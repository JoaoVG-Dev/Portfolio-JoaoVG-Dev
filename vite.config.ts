import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs/promises';
import path from 'node:path';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { fileURLToPath } from 'node:url';
import type { Plugin } from 'vite';

type ProjectImageOption = {
  label: string;
  value: string;
};

const rootDir = path.dirname(fileURLToPath(import.meta.url));
const assetsDir = path.resolve(rootDir, 'public/assets/projects');
const allowedImageExtensions = new Set(['.gif', '.jpeg', '.jpg', '.png', '.svg', '.webp']);
const allowedImageMimeTypes = new Set([
  'image/gif',
  'image/jpeg',
  'image/png',
  'image/svg+xml',
  'image/webp',
]);
const maxUploadSize = 5 * 1024 * 1024;

function sendJson(res: ServerResponse, statusCode: number, payload: unknown) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(payload));
}

function getImageLabel(fileName: string) {
  const name = path.parse(fileName).name;

  return name
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function sanitizeFileName(fileName: string, mimeType: string) {
  const parsed = path.parse(fileName);
  const extFromName = parsed.ext.toLowerCase();
  const extFromMime =
    mimeType === 'image/jpeg'
      ? '.jpg'
      : mimeType === 'image/png'
        ? '.png'
        : mimeType === 'image/webp'
          ? '.webp'
          : mimeType === 'image/gif'
            ? '.gif'
            : mimeType === 'image/svg+xml'
              ? '.svg'
              : '';
  const ext = allowedImageExtensions.has(extFromName) ? extFromName : extFromMime;

  if (!ext) {
    throw new Error('Formato de imagem não suportado.');
  }

  const baseName = (parsed.name || 'project-image')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'project-image';

  return `${baseName}${ext}`;
}

async function getAvailableFileName(fileName: string) {
  const parsed = path.parse(fileName);
  let candidate = fileName;
  let suffix = 2;

  while (true) {
    try {
      await fs.access(path.join(assetsDir, candidate));
      candidate = `${parsed.name}-${suffix}${parsed.ext}`;
      suffix += 1;
    } catch {
      return candidate;
    }
  }
}

async function collectRequestBody(req: IncomingMessage) {
  const chunks: Buffer[] = [];
  let totalSize = 0;

  for await (const chunk of req) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    totalSize += buffer.length;

    if (totalSize > maxUploadSize) {
      throw new Error('Imagem maior que 5MB.');
    }

    chunks.push(buffer);
  }

  return Buffer.concat(chunks);
}

function parseMultipartImage(req: IncomingMessage, body: Buffer) {
  const contentType = req.headers['content-type'] ?? '';
  const boundaryMatch = /boundary=(?:"([^"]+)"|([^;]+))/i.exec(contentType);

  if (!boundaryMatch) {
    throw new Error('Requisição de upload inválida.');
  }

  const boundary = Buffer.from(`--${boundaryMatch[1] ?? boundaryMatch[2]}`);
  let cursor = body.indexOf(boundary);

  while (cursor !== -1) {
    cursor += boundary.length;

    if (body[cursor] === 45 && body[cursor + 1] === 45) {
      break;
    }

    if (body[cursor] === 13 && body[cursor + 1] === 10) {
      cursor += 2;
    }

    const nextBoundary = body.indexOf(boundary, cursor);

    if (nextBoundary === -1) {
      break;
    }

    const part = body.subarray(cursor, nextBoundary - 2);
    const headerEnd = part.indexOf(Buffer.from('\r\n\r\n'));

    if (headerEnd !== -1) {
      const headers = part.subarray(0, headerEnd).toString('utf8');
      const content = part.subarray(headerEnd + 4);
      const disposition = /content-disposition:\s*form-data;[^\r\n]*/i.exec(headers)?.[0] ?? '';
      const fileName = /filename="([^"]+)"/i.exec(disposition)?.[1];
      const mimeType = /content-type:\s*([^\r\n]+)/i.exec(headers)?.[1]?.trim().toLowerCase() ?? '';

      if (fileName && content.length > 0) {
        if (!allowedImageMimeTypes.has(mimeType)) {
          throw new Error('Envie uma imagem PNG, JPG, WEBP, GIF ou SVG.');
        }

        return { content, fileName, mimeType };
      }
    }

    cursor = nextBoundary;
  }

  throw new Error('Nenhuma imagem foi encontrada no upload.');
}

async function listProjectImages(): Promise<ProjectImageOption[]> {
  await fs.mkdir(assetsDir, { recursive: true });
  const entries = await fs.readdir(assetsDir, { withFileTypes: true });

  return entries
    .filter((entry) => entry.isFile() && allowedImageExtensions.has(path.extname(entry.name).toLowerCase()))
    .map((entry) => ({
      label: getImageLabel(entry.name),
      value: `/assets/projects/${entry.name}`,
    }))
    .sort((a, b) => a.label.localeCompare(b.label, 'pt-BR'));
}

function projectImageUploadPlugin(): Plugin {
  return {
    name: 'portfolio-project-image-upload',
    configureServer(server) {
      server.middlewares.use('/api/project-images', async (req, res) => {
        try {
          if (req.method === 'GET') {
            sendJson(res, 200, { images: await listProjectImages() });
            return;
          }

          if (req.method === 'POST') {
            const body = await collectRequestBody(req);
            const image = parseMultipartImage(req, body);
            const safeName = sanitizeFileName(image.fileName, image.mimeType);
            const finalName = await getAvailableFileName(safeName);
            const targetPath = path.join(assetsDir, finalName);

            await fs.mkdir(assetsDir, { recursive: true });
            await fs.writeFile(targetPath, image.content);
            sendJson(res, 201, {
              image: {
                label: getImageLabel(finalName),
                value: `/assets/projects/${finalName}`,
              },
            });
            return;
          }

          sendJson(res, 405, { error: 'Método não permitido.' });
        } catch (error) {
          sendJson(res, 400, {
            error: error instanceof Error ? error.message : 'Não foi possível salvar a imagem.',
          });
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), projectImageUploadPlugin()],
});

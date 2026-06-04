import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs/promises';
import path from 'node:path';
import type { ServerResponse } from 'node:http';
import { fileURLToPath } from 'node:url';
import type { Plugin } from 'vite';

type ProjectImageOption = {
  label: string;
  value: string;
};

const rootDir = path.dirname(fileURLToPath(import.meta.url));
const assetsDir = path.resolve(rootDir, 'public/assets/projects');
const allowedImageExtensions = new Set(['.gif', '.jpeg', '.jpg', '.png', '.svg', '.webp']);

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

function projectImageListPlugin(): Plugin {
  return {
    name: 'portfolio-project-image-list',
    configureServer(server) {
      server.middlewares.use('/api/project-images', async (req, res) => {
        try {
          if (req.method === 'GET') {
            sendJson(res, 200, { images: await listProjectImages() });
            return;
          }

          sendJson(res, 405, { error: 'Metodo nao permitido.' });
        } catch (error) {
          sendJson(res, 400, {
            error: error instanceof Error ? error.message : 'Nao foi possivel listar as imagens.',
          });
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), projectImageListPlugin()],
});

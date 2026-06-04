import { projectImageOptions, type ProjectImageOption } from '../data/projectImages';
import { supabase } from './supabase';

export const projectImageBucket = 'portfolio-assets';

const projectImageFolder = 'projects';
const maxProjectImageSize = 5 * 1024 * 1024;
const supportedProjectImageMimeTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);
const extensionByMimeType: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

function mergeImageOptions(options: ProjectImageOption[]) {
  const map = new Map<string, ProjectImageOption>();

  [...projectImageOptions, ...options].forEach((option) => {
    map.set(option.value, option);
  });

  return Array.from(map.values());
}

function getImageLabel(fileName: string) {
  return fileName
    .replace(/\.[^.]+$/, '')
    .replace(/^\d{13}-[a-f0-9-]{36}-/i, '')
    .replace(/^\d{13}-[a-z0-9]{10}-/i, '')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase()) || 'Imagem do projeto';
}

function sanitizeFileBaseName(fileName: string) {
  return (
    fileName
      .replace(/\.[^.]+$/, '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 80) || 'project-image'
  );
}

function getUniqueStoragePath(file: File) {
  const extension = extensionByMimeType[file.type] ?? 'jpg';
  const randomId =
    typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2, 12);

  return `${projectImageFolder}/${Date.now()}-${randomId}-${sanitizeFileBaseName(file.name)}.${extension}`;
}

function validateProjectImage(file: File) {
  if (!supportedProjectImageMimeTypes.has(file.type)) {
    throw new Error('Envie uma imagem JPG, PNG ou WEBP.');
  }

  if (file.size > maxProjectImageSize) {
    throw new Error('A imagem é muito grande. Use uma imagem de até 5MB.');
  }
}

async function fetchLocalProjectImages(): Promise<ProjectImageOption[]> {
  if (!import.meta.env.DEV) {
    return [];
  }

  try {
    const response = await fetch('/api/project-images');

    if (!response.ok) {
      throw new Error('Não foi possível listar imagens locais.');
    }

    const payload = (await response.json()) as { images?: ProjectImageOption[] };
    return payload.images ?? [];
  } catch {
    return [];
  }
}

async function fetchStorageProjectImages(): Promise<ProjectImageOption[]> {
  if (!supabase) {
    return [];
  }

  const storage = supabase.storage.from(projectImageBucket);

  try {
    const { data, error } = await storage
      .list(projectImageFolder, {
        limit: 100,
        sortBy: { column: 'created_at', order: 'desc' },
      });

    if (error) {
      throw error;
    }

    return (data ?? [])
      .filter((item) => item.name && !item.name.endsWith('/'))
      .map((item) => {
        const path = `${projectImageFolder}/${item.name}`;
        const { data: publicUrlData } = storage.getPublicUrl(path);

        return {
          label: getImageLabel(item.name),
          value: publicUrlData.publicUrl,
        };
      });
  } catch {
    return [];
  }
}

export async function fetchProjectImages(): Promise<ProjectImageOption[]> {
  const [localImages, storageImages] = await Promise.all([
    fetchLocalProjectImages(),
    fetchStorageProjectImages(),
  ]);

  return mergeImageOptions([...storageImages, ...localImages]);
}

export async function uploadProjectImage(file: File): Promise<ProjectImageOption> {
  if (!supabase) {
    throw new Error('Supabase não configurado. Verifique VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY.');
  }

  validateProjectImage(file);

  const storagePath = getUniqueStoragePath(file);
  const { error } = await supabase.storage.from(projectImageBucket).upload(storagePath, file, {
    cacheControl: '31536000',
    contentType: file.type,
    upsert: false,
  });

  if (error) {
    throw new Error(error.message || 'Não foi possível enviar a imagem para o Supabase Storage.');
  }

  const { data } = supabase.storage.from(projectImageBucket).getPublicUrl(storagePath);

  if (!data.publicUrl) {
    throw new Error('Upload concluído, mas não foi possível gerar a URL pública da imagem.');
  }

  return {
    label: getImageLabel(file.name),
    value: data.publicUrl,
  };
}

import { projectImageOptions, type ProjectImageOption } from '../data/projectImages';

function mergeImageOptions(options: ProjectImageOption[]) {
  const map = new Map<string, ProjectImageOption>();

  [...projectImageOptions, ...options].forEach((option) => {
    map.set(option.value, option);
  });

  return Array.from(map.values());
}

export async function fetchProjectImages(): Promise<ProjectImageOption[]> {
  if (!import.meta.env.DEV) {
    return projectImageOptions;
  }

  try {
    const response = await fetch('/api/project-images');

    if (!response.ok) {
      throw new Error('Não foi possível listar imagens locais.');
    }

    const payload = (await response.json()) as { images?: ProjectImageOption[] };
    return mergeImageOptions(payload.images ?? []);
  } catch {
    return projectImageOptions;
  }
}

export async function uploadProjectImage(file: File): Promise<ProjectImageOption> {
  if (!import.meta.env.DEV) {
    throw new Error('Upload local disponível apenas ao rodar o projeto com npm run dev.');
  }

  const formData = new FormData();
  formData.append('image', file);

  const response = await fetch('/api/project-images', {
    method: 'POST',
    body: formData,
  });
  const payload = (await response.json()) as { image?: ProjectImageOption; error?: string };

  if (!response.ok || !payload.image) {
    throw new Error(payload.error ?? 'Não foi possível salvar a imagem em public/assets/projects.');
  }

  return payload.image;
}

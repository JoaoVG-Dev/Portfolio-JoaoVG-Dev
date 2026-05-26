import { supabase } from './supabase';
import { normalizeWhatsappContactUrl } from './contactLinks';
import type { CmsRecord, CmsResourceConfig } from '../types/cms';

export type DashboardSummary = {
  totals: {
    projects: number;
    technologies: number;
    certificates: number;
    experiences: number;
  };
  recentItems: Array<{
    id: string;
    title: string;
    type: string;
    createdAt: string | null;
  }>;
};

export type TechnologyOption = {
  id: string;
  name: string;
};

type ProjectTechnologyRecord = {
  technology_id: string | null;
  technologies: { name: string | null } | { name: string | null }[] | null;
};

export type ProfileSettingsRecord = {
  id: string;
  name: string;
  title: string;
  bio: string;
  avatar_url: string;
  github_url: string;
  linkedin_url: string;
  whatsapp_url: string;
  email: string;
};

function normalizeProfileSettingsRecord(record: ProfileSettingsRecord | null) {
  if (!record) {
    return null;
  }

  return {
    ...record,
    whatsapp_url: normalizeWhatsappContactUrl(record.whatsapp_url),
  };
}

function getClient() {
  if (!supabase) {
    throw new Error('Supabase não configurado.');
  }

  return supabase;
}

export async function fetchCmsRecords(config: CmsResourceConfig): Promise<CmsRecord[]> {
  const client = getClient();
  const query =
    config.key === 'projects'
      ? client
          .from(config.table)
          .select('*, project_technologies(technology_id, technologies(name))')
          .order('display_order', { ascending: true })
      : client.from(config.table).select('*').order('display_order', { ascending: true });

  const { data, error } = await query;
  if (error) {
    throw error;
  }

  if (config.key === 'projects') {
    return (data ?? []).map((record) => {
      const project = record as CmsRecord & {
        project_technologies?: ProjectTechnologyRecord[] | null;
      };
      const relations = project.project_technologies ?? [];

      return {
        ...project,
        technology_ids: relations
          .map((relation) => relation.technology_id)
          .filter((id): id is string => Boolean(id)),
        technology_names: relations
          .map((relation) => {
            const technology = Array.isArray(relation.technologies)
              ? relation.technologies[0]
              : relation.technologies;

            return technology?.name ?? null;
          })
          .filter((name): name is string => Boolean(name)),
      };
    }) as CmsRecord[];
  }

  return (data ?? []) as CmsRecord[];
}

export async function createCmsRecord(config: CmsResourceConfig, payload: CmsRecord) {
  const client = getClient();
  const { data, error } = await client.from(config.table).insert(payload).select('*').single();

  if (error) {
    throw error;
  }

  return data as CmsRecord;
}

export async function updateCmsRecord(config: CmsResourceConfig, id: string, payload: CmsRecord) {
  const client = getClient();
  const { data, error } = await client
    .from(config.table)
    .update(payload)
    .eq('id', id)
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return data as CmsRecord;
}

export async function deleteCmsRecord(config: CmsResourceConfig, id: string) {
  const client = getClient();
  const { error } = await client.from(config.table).delete().eq('id', id);

  if (error) {
    throw error;
  }
}

export async function fetchTechnologyOptions(): Promise<TechnologyOption[]> {
  const client = getClient();
  const { data, error } = await client
    .from('technologies')
    .select('id, name')
    .order('display_order', { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []) as TechnologyOption[];
}

export async function fetchProjectTechnologyIds(projectId: string): Promise<string[]> {
  const client = getClient();
  const { data, error } = await client
    .from('project_technologies')
    .select('technology_id')
    .eq('project_id', projectId);

  if (error) {
    throw error;
  }

  return (data ?? []).map((row) => String(row.technology_id));
}

export async function setProjectTechnologyIds(projectId: string, technologyIds: string[]) {
  const client = getClient();
  const { error: deleteError } = await client
    .from('project_technologies')
    .delete()
    .eq('project_id', projectId);

  if (deleteError) {
    throw deleteError;
  }

  if (technologyIds.length === 0) {
    return;
  }

  const { error: insertError } = await client.from('project_technologies').insert(
    technologyIds.map((technologyId) => ({
      project_id: projectId,
      technology_id: technologyId,
    })),
  );

  if (insertError) {
    throw insertError;
  }
}

async function countTable(table: string) {
  const client = getClient();
  const { count, error } = await client
    .from(table)
    .select('id', { count: 'exact', head: true });

  if (error) {
    throw error;
  }

  return count ?? 0;
}

async function fetchRecent(table: string, type: string) {
  const client = getClient();
  const { data, error } = await client
    .from(table)
    .select('id, title, created_at')
    .order('created_at', { ascending: false })
    .limit(4);

  if (error) {
    throw error;
  }

  return (data ?? []).map((row) => {
    const record = row as unknown as Record<string, unknown>;

    return {
      id: String(record.id),
      title: String(record.title ?? 'Sem título'),
      type,
      createdAt: typeof record.created_at === 'string' ? record.created_at : null,
    };
  });
}

export async function fetchDashboardSummary(): Promise<DashboardSummary> {
  const [projects, technologies, certificates, experiences, recentProjects, recentCertificates] =
    await Promise.all([
      countTable('projects'),
      countTable('technologies'),
      countTable('certificates'),
      countTable('experiences'),
      fetchRecent('projects', 'Projeto'),
      fetchRecent('certificates', 'Certificado'),
    ]);

  return {
    totals: {
      projects,
      technologies,
      certificates,
      experiences,
    },
    recentItems: [...recentProjects, ...recentCertificates]
      .sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''))
      .slice(0, 6),
  };
}

export async function fetchAdminProfile(): Promise<ProfileSettingsRecord | null> {
  const client = getClient();
  const {
    data: { user },
    error: userError,
  } = await client.auth.getUser();

  if (userError) {
    throw userError;
  }

  if (!user) {
    return null;
  }

  const { data, error } = await client
    .from('profiles')
    .select('id, name, title, bio, avatar_url, github_url, linkedin_url, whatsapp_url, email')
    .eq('id', user.id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return normalizeProfileSettingsRecord(data as ProfileSettingsRecord | null);
}

export async function updateAdminProfile(payload: Omit<ProfileSettingsRecord, 'id'>) {
  const current = await fetchAdminProfile();

  if (!current) {
    throw new Error('Profile admin não encontrado. Crie o usuário admin e rode o seed novamente.');
  }

  const client = getClient();
  const normalizedPayload = {
    ...payload,
    whatsapp_url: normalizeWhatsappContactUrl(payload.whatsapp_url),
  };
  const { data, error } = await client
    .from('profiles')
    .update(normalizedPayload)
    .eq('id', current.id)
    .select('id, name, title, bio, avatar_url, github_url, linkedin_url, whatsapp_url, email')
    .single();

  if (error) {
    throw error;
  }

  return normalizeProfileSettingsRecord(data as ProfileSettingsRecord) as ProfileSettingsRecord;
}

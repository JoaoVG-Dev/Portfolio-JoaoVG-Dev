import { fallbackPortfolio } from '../data/fallbackPortfolio';
import { supabase } from './supabase';
import type {
  Certificate,
  Experience,
  PortfolioContent,
  Profile,
  Project,
  Technology,
} from '../types/portfolio';

type ProfileRow = {
  id: string;
  name: string | null;
  title: string | null;
  bio: string | null;
  avatar_url: string | null;
  github_url: string | null;
  linkedin_url: string | null;
  whatsapp_url: string | null;
  email: string | null;
  role: string | null;
  active: boolean | null;
  updated_at: string | null;
};

type TechnologyRow = {
  id: string;
  name: string;
  category: string | null;
  level: string | null;
  icon_url: string | null;
  active: boolean | null;
  display_order: number | null;
};

type ProjectRow = {
  id: string;
  title: string;
  slug: string | null;
  short_description: string | null;
  description: string | null;
  cover_url: string | null;
  github_url: string | null;
  deploy_url: string | null;
  status: string | null;
  featured: boolean | null;
  active: boolean | null;
  display_order: number | null;
  started_at: string | null;
  completed_at: string | null;
  project_technologies?: ProjectTechnologyRow[] | null;
};

type ProjectTechnologyRow = {
  technology_id: string | null;
  technologies: TechnologyRow | TechnologyRow[] | null;
};

type CertificateRow = {
  id: string;
  title: string;
  institution: string | null;
  category: string | null;
  certificate_url: string | null;
  workload: string | null;
  completed_at: string | null;
  active: boolean | null;
  featured?: boolean | null;
  display_order: number | null;
};

type ExperienceRow = {
  id: string;
  role: string;
  company: string | null;
  start_date: string | null;
  end_date: string | null;
  current: boolean | null;
  description: string | null;
  active: boolean | null;
  display_order: number | null;
};

type SupabaseClient = NonNullable<typeof supabase>;

const profileSelect =
  'id, name, title, bio, avatar_url, github_url, linkedin_url, whatsapp_url, email, role, active, updated_at';
const technologySelect = 'id, name, category, level, icon_url, active, display_order';
const projectSelect =
  'id, title, slug, short_description, description, cover_url, github_url, deploy_url, status, featured, active, display_order, started_at, completed_at';
const projectWithTechnologiesSelect = `${projectSelect}, project_technologies(technology_id, technologies(${technologySelect}))`;
const certificateSelect =
  'id, title, institution, category, certificate_url, workload, completed_at, active, featured, display_order';
const experienceSelect =
  'id, role, company, start_date, end_date, current, description, active, display_order';

const splitBio = (bio: string | null) => {
  if (!bio) {
    return fallbackPortfolio.profile.bio;
  }

  return bio
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
};

const filledValue = (value: string | null | undefined, fallback: string) => {
  const trimmedValue = value?.trim();

  return trimmedValue || fallback;
};

const safeErrorDetails = (error: unknown) => {
  const value = error as {
    code?: unknown;
    details?: unknown;
    hint?: unknown;
    message?: unknown;
    name?: unknown;
  };

  return {
    code: typeof value.code === 'string' ? value.code : undefined,
    details: typeof value.details === 'string' ? value.details : undefined,
    hint: typeof value.hint === 'string' ? value.hint : undefined,
    message:
      typeof value.message === 'string'
        ? value.message
        : error instanceof Error
          ? error.message
          : String(error),
    name: typeof value.name === 'string' ? value.name : undefined,
  };
};

const warnInDevelopment = (message: string, error?: unknown) => {
  if (!import.meta.env.DEV) {
    return;
  }

  if (error) {
    console.warn(message, safeErrorDetails(error));
    return;
  }

  console.warn(message);
};

const comparePublicRows = <T extends { completed_at: string | null; display_order: number | null; featured?: boolean | null }>(
  first: T,
  second: T,
) => {
  const featuredDifference = Number(Boolean(second.featured)) - Number(Boolean(first.featured));

  if (featuredDifference !== 0) {
    return featuredDifference;
  }

  const orderDifference = (first.display_order ?? Number.MAX_SAFE_INTEGER) - (second.display_order ?? Number.MAX_SAFE_INTEGER);

  if (orderDifference !== 0) {
    return orderDifference;
  }

  return (second.completed_at ?? '').localeCompare(first.completed_at ?? '');
};

const orderRows = <T extends { completed_at: string | null; display_order: number | null; featured?: boolean | null }>(
  rows: T[],
) => [...rows].sort(comparePublicRows);

const orderPublicProjects = (projects: Project[]) => [...projects].sort((first, second) => {
  const featuredDifference = Number(second.featured) - Number(first.featured);

  if (featuredDifference !== 0) {
    return featuredDifference;
  }

  return first.sortOrder - second.sortOrder;
});

const orderPublicCertificates = (certificates: Certificate[]) => [...certificates].sort((first, second) => {
  const featuredDifference = Number(second.featured) - Number(first.featured);

  if (featuredDifference !== 0) {
    return featuredDifference;
  }

  const orderDifference = first.sortOrder - second.sortOrder;

  if (orderDifference !== 0) {
    return orderDifference;
  }

  return (second.completedAt ?? '').localeCompare(first.completedAt ?? '');
});

const visibleFallbackProjects = () =>
  orderPublicProjects(fallbackPortfolio.projects.filter((project) => project.active === true));

const visibleFallbackCertificates = () =>
  orderPublicCertificates(fallbackPortfolio.certificates.filter((certificate) => certificate.active === true));

const publicFallbackPortfolio = (): PortfolioContent => ({
  ...fallbackPortfolio,
  projects: visibleFallbackProjects(),
  certificates: visibleFallbackCertificates(),
});

const mapProfile = (row: ProfileRow): Profile => ({
  id: row.id,
  name: filledValue(row.name, fallbackPortfolio.profile.name),
  role: filledValue(row.title, fallbackPortfolio.profile.role),
  headline: fallbackPortfolio.profile.headline,
  summary: fallbackPortfolio.profile.summary,
  bio: splitBio(row.bio),
  email: filledValue(row.email, fallbackPortfolio.profile.email),
  location: fallbackPortfolio.profile.location,
  whatsappUrl: filledValue(row.whatsapp_url, fallbackPortfolio.profile.whatsappUrl),
  githubUrl: filledValue(row.github_url, fallbackPortfolio.profile.githubUrl),
  linkedinUrl: filledValue(row.linkedin_url, fallbackPortfolio.profile.linkedinUrl),
  instagramUrl: fallbackPortfolio.profile.instagramUrl,
  cvUrl: fallbackPortfolio.profile.cvUrl,
  avatarUrl: filledValue(row.avatar_url, fallbackPortfolio.profile.avatarUrl),
  isPublished: row.active ?? true,
  updatedAt: row.updated_at ?? undefined,
});

const mapTechnology = (row: TechnologyRow): Technology => ({
  id: row.id,
  name: row.name,
  iconUrl: row.icon_url ?? '',
  category: row.category ?? '',
  sortOrder: row.display_order ?? 0,
  isFeatured: row.active ?? true,
});

const normalizeTechnologyRelation = (relation: ProjectTechnologyRow): Technology | null => {
  const technology = Array.isArray(relation.technologies)
    ? relation.technologies[0]
    : relation.technologies;

  return technology ? mapTechnology(technology) : null;
};

const mapProject = (row: ProjectRow): Project => ({
  id: row.id,
  title: row.title,
  slug: row.slug ?? row.id,
  category: row.short_description ?? row.status ?? 'Projeto',
  description: row.description ?? row.short_description ?? '',
  imageUrl: row.cover_url ?? '',
  liveUrl: row.deploy_url,
  repositoryUrl: row.github_url,
  technologies: (row.project_technologies ?? [])
    .map(normalizeTechnologyRelation)
    .filter((technology): technology is Technology => Boolean(technology)),
  sortOrder: row.display_order ?? 0,
  featured: row.featured === true,
  active: row.active === true,
  isFeatured: row.featured === true,
  isPublished: row.active === true,
});

const mapCertificate = (row: CertificateRow): Certificate => ({
  id: row.id,
  title: row.title,
  institution: row.institution ?? '',
  category: row.category,
  certificateUrl: row.certificate_url,
  imageUrl: null,
  workload: row.workload,
  completedAt: row.completed_at,
  sortOrder: row.display_order ?? 0,
  featured: row.featured === true,
  active: row.active === true,
  isFeatured: row.featured === true,
  isPublished: row.active === true,
});

const mapExperience = (row: ExperienceRow): Experience => ({
  id: row.id,
  company: row.company ?? '',
  role: row.role,
  location: fallbackPortfolio.profile.location,
  startDate: row.start_date ?? '',
  endDate: row.current ? null : row.end_date,
  description: row.description ?? '',
  type: row.current ? 'personal' : 'full-time',
  sortOrder: row.display_order ?? 0,
  isPublished: row.active ?? true,
});

async function fetchProfile(client: SupabaseClient): Promise<Profile> {
  try {
    const { data, error } = await client
      .from('profiles')
      .select(profileSelect)
      .eq('active', true)
      .limit(1)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return data ? mapProfile(data as ProfileRow) : fallbackPortfolio.profile;
  } catch (error) {
    warnInDevelopment('Supabase retornou erro ao carregar profile publico; usando fallback local da secao.', error);
    return fallbackPortfolio.profile;
  }
}

async function fetchTechnologies(client: SupabaseClient): Promise<Technology[]> {
  try {
    const { data, error } = await client
      .from('technologies')
      .select(technologySelect)
      .eq('active', true)
      .order('display_order', { ascending: true });

    if (error) {
      throw error;
    }

    return ((data ?? []) as TechnologyRow[]).map(mapTechnology);
  } catch (error) {
    warnInDevelopment('Supabase retornou erro ao carregar tecnologias publicas; usando fallback local da secao.', error);
    return fallbackPortfolio.technologies;
  }
}

const applyProjectOrdering = (query: ReturnType<SupabaseClient['from']>) =>
  query
    .select(projectWithTechnologiesSelect)
    .eq('active', true)
    .order('featured', { ascending: false })
    .order('display_order', { ascending: true })
    .order('completed_at', { ascending: false });

const applyProjectFallbackOrdering = (query: ReturnType<SupabaseClient['from']>) =>
  query
    .select(projectSelect)
    .eq('active', true)
    .order('featured', { ascending: false })
    .order('display_order', { ascending: true })
    .order('completed_at', { ascending: false });

async function fetchProjects(client: SupabaseClient): Promise<Project[]> {
  try {
    const { data, error } = await applyProjectOrdering(client.from('projects'));

    if (error) {
      throw error;
    }

    const rows = orderRows((data ?? []) as ProjectRow[]);

    if (rows.length === 0) {
      warnInDevelopment('Supabase retornou zero projetos ativos; exibindo lista publica vazia.');
      return [];
    }

    return rows.map(mapProject);
  } catch (error) {
    warnInDevelopment(
      'Supabase retornou erro ao carregar tecnologias dos projetos; tentando exibir projetos sem tecnologias.',
      error,
    );

    try {
      const { data, error: projectError } = await applyProjectFallbackOrdering(client.from('projects'));

      if (projectError) {
        throw projectError;
      }

      const rows = orderRows((data ?? []) as ProjectRow[]);

      if (rows.length === 0) {
        warnInDevelopment('Supabase retornou zero projetos ativos; exibindo lista publica vazia.');
        return [];
      }

      return rows.map((row) => mapProject({ ...row, project_technologies: [] }));
    } catch (projectError) {
      warnInDevelopment('Supabase retornou erro ao carregar projetos publicos; usando fallback local da secao.', projectError);
      return visibleFallbackProjects();
    }
  }
}

async function fetchCertificates(client: SupabaseClient): Promise<Certificate[]> {
  try {
    const { data, error } = await client
      .from('certificates')
      .select(certificateSelect)
      .eq('active', true)
      .order('featured', { ascending: false })
      .order('display_order', { ascending: true })
      .order('completed_at', { ascending: false });

    if (error) {
      throw error;
    }

    const rows = orderRows((data ?? []) as CertificateRow[]);

    if (rows.length === 0) {
      warnInDevelopment('Supabase retornou zero certificados ativos; exibindo lista publica vazia.');
      return [];
    }

    return rows.map(mapCertificate);
  } catch (error) {
    warnInDevelopment('Supabase retornou erro ao carregar certificados publicos; usando fallback local da secao.', error);
    return visibleFallbackCertificates();
  }
}

async function fetchExperiences(client: SupabaseClient): Promise<Experience[]> {
  try {
    const { data, error } = await client
      .from('experiences')
      .select(experienceSelect)
      .eq('active', true)
      .order('display_order', { ascending: true });

    if (error) {
      throw error;
    }

    return ((data ?? []) as ExperienceRow[]).map(mapExperience);
  } catch (error) {
    warnInDevelopment('Supabase retornou erro ao carregar experiencias publicas; usando fallback local da secao.', error);
    return fallbackPortfolio.experiences;
  }
}

export async function fetchPortfolioContent(): Promise<PortfolioContent> {
  if (!supabase) {
    return publicFallbackPortfolio();
  }

  const client = supabase;
  const [profile, technologies, projects, certificates, experiences] = await Promise.all([
    fetchProfile(client),
    fetchTechnologies(client),
    fetchProjects(client),
    fetchCertificates(client),
    fetchExperiences(client),
  ]);

  return {
    profile,
    technologies,
    projects,
    certificates,
    experiences,
  };
}

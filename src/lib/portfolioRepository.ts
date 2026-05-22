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
  image_url: string | null;
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

const splitBio = (bio: string | null) => {
  if (!bio) {
    return fallbackPortfolio.profile.bio;
  }

  return bio
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
};

const mapProfile = (row: ProfileRow): Profile => ({
  id: row.id,
  name: row.name ?? fallbackPortfolio.profile.name,
  role: row.title ?? fallbackPortfolio.profile.role,
  headline: fallbackPortfolio.profile.headline,
  summary: fallbackPortfolio.profile.summary,
  bio: splitBio(row.bio),
  email: row.email ?? fallbackPortfolio.profile.email,
  location: fallbackPortfolio.profile.location,
  whatsappUrl: row.whatsapp_url ?? fallbackPortfolio.profile.whatsappUrl,
  githubUrl: row.github_url ?? fallbackPortfolio.profile.githubUrl,
  linkedinUrl: row.linkedin_url ?? fallbackPortfolio.profile.linkedinUrl,
  instagramUrl: fallbackPortfolio.profile.instagramUrl,
  cvUrl: fallbackPortfolio.profile.cvUrl,
  avatarUrl: row.avatar_url ?? fallbackPortfolio.profile.avatarUrl,
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
  isFeatured: row.featured ?? false,
  isPublished: row.active ?? true,
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
  isFeatured: row.featured ?? false,
  isPublished: row.active ?? true,
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

export async function fetchPortfolioContent(): Promise<PortfolioContent> {
  if (!supabase) {
    return fallbackPortfolio;
  }

  try {
    const [profile, technologies, projects, certificates, experiences] = await Promise.all([
      supabase.from('profiles').select('*').eq('active', true).limit(1).maybeSingle(),
      supabase.from('technologies').select('*').eq('active', true).order('display_order'),
      supabase
        .from('projects')
        .select('*, project_technologies(technology_id, technologies(*))')
        .eq('active', true)
        .order('display_order'),
      supabase.from('certificates').select('*').eq('active', true).order('display_order'),
      supabase.from('experiences').select('*').eq('active', true).order('display_order'),
    ]);

    const error =
      profile.error ??
      technologies.error ??
      projects.error ??
      certificates.error ??
      experiences.error;

    if (error) {
      throw error;
    }

    const mappedCertificates = ((certificates.data ?? []) as CertificateRow[])
      .map(mapCertificate)
      .sort((a, b) => {
        const orderDifference = a.sortOrder - b.sortOrder;

        if (orderDifference !== 0) {
          return orderDifference;
        }

        return (b.completedAt ?? '').localeCompare(a.completedAt ?? '');
      });

    return {
      profile: profile.data ? mapProfile(profile.data as ProfileRow) : fallbackPortfolio.profile,
      technologies: ((technologies.data ?? []) as TechnologyRow[]).map(mapTechnology),
      projects: ((projects.data ?? []) as ProjectRow[]).map(mapProject),
      certificates: mappedCertificates,
      experiences: ((experiences.data ?? []) as ExperienceRow[]).map(mapExperience),
    };
  } catch (error) {
    console.warn('Supabase content fetch failed. Falling back to local portfolio data.', error);
    return fallbackPortfolio;
  }
}

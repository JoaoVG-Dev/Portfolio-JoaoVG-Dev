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
  name: string;
  role: string;
  headline: string;
  summary: string;
  bio: string[];
  email: string;
  location: string;
  whatsapp_url: string;
  github_url: string;
  linkedin_url: string;
  instagram_url: string;
  cv_url: string;
  avatar_url: string;
  is_published: boolean;
  updated_at: string;
};

type TechnologyRow = {
  id: string;
  name: string;
  icon_url: string;
  category: string;
  sort_order: number;
  is_featured: boolean;
};

type ProjectRow = {
  id: string;
  title: string;
  slug: string;
  category: string;
  description: string;
  image_url: string;
  live_url: string | null;
  repository_url: string | null;
  sort_order: number;
  is_featured: boolean;
  is_published: boolean;
};

type CertificateRow = {
  id: string;
  title: string;
  issuer: string;
  issued_at: string | null;
  credential_url: string | null;
  image_url: string | null;
  sort_order: number;
  is_published: boolean;
};

type ExperienceRow = {
  id: string;
  company: string;
  role: string;
  location: string;
  start_date: string;
  end_date: string | null;
  description: string;
  type: Experience['type'];
  sort_order: number;
  is_published: boolean;
};

const mapProfile = (row: ProfileRow): Profile => ({
  id: row.id,
  name: row.name,
  role: row.role,
  headline: row.headline,
  summary: row.summary,
  bio: row.bio,
  email: row.email,
  location: row.location,
  whatsappUrl: row.whatsapp_url,
  githubUrl: row.github_url,
  linkedinUrl: row.linkedin_url,
  instagramUrl: row.instagram_url,
  cvUrl: row.cv_url,
  avatarUrl: row.avatar_url,
  isPublished: row.is_published,
  updatedAt: row.updated_at,
});

const mapTechnology = (row: TechnologyRow): Technology => ({
  id: row.id,
  name: row.name,
  iconUrl: row.icon_url,
  category: row.category,
  sortOrder: row.sort_order,
  isFeatured: row.is_featured,
});

const mapProject = (row: ProjectRow): Project => ({
  id: row.id,
  title: row.title,
  slug: row.slug,
  category: row.category,
  description: row.description,
  imageUrl: row.image_url,
  liveUrl: row.live_url,
  repositoryUrl: row.repository_url,
  sortOrder: row.sort_order,
  isFeatured: row.is_featured,
  isPublished: row.is_published,
});

const mapCertificate = (row: CertificateRow): Certificate => ({
  id: row.id,
  title: row.title,
  issuer: row.issuer,
  issuedAt: row.issued_at,
  credentialUrl: row.credential_url,
  imageUrl: row.image_url,
  sortOrder: row.sort_order,
  isPublished: row.is_published,
});

const mapExperience = (row: ExperienceRow): Experience => ({
  id: row.id,
  company: row.company,
  role: row.role,
  location: row.location,
  startDate: row.start_date,
  endDate: row.end_date,
  description: row.description,
  type: row.type,
  sortOrder: row.sort_order,
  isPublished: row.is_published,
});

export async function fetchPortfolioContent(): Promise<PortfolioContent> {
  if (!supabase) {
    return fallbackPortfolio;
  }

  try {
    const [profile, technologies, projects, certificates, experiences] = await Promise.all([
      supabase.from('profiles').select('*').eq('is_published', true).limit(1).maybeSingle(),
      supabase.from('technologies').select('*').eq('is_featured', true).order('sort_order'),
      supabase.from('projects').select('*').eq('is_published', true).order('sort_order'),
      supabase.from('certificates').select('*').eq('is_published', true).order('sort_order'),
      supabase.from('experiences').select('*').eq('is_published', true).order('sort_order'),
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

    return {
      profile: profile.data ? mapProfile(profile.data as ProfileRow) : fallbackPortfolio.profile,
      technologies:
        technologies.data && technologies.data.length > 0
          ? (technologies.data as TechnologyRow[]).map(mapTechnology)
          : fallbackPortfolio.technologies,
      projects:
        projects.data && projects.data.length > 0
          ? (projects.data as ProjectRow[]).map(mapProject)
          : fallbackPortfolio.projects,
      certificates:
        certificates.data && certificates.data.length > 0
          ? (certificates.data as CertificateRow[]).map(mapCertificate)
          : fallbackPortfolio.certificates,
      experiences:
        experiences.data && experiences.data.length > 0
          ? (experiences.data as ExperienceRow[]).map(mapExperience)
          : fallbackPortfolio.experiences,
    };
  } catch (error) {
    console.warn('Supabase content fetch failed. Falling back to local portfolio data.', error);
    return fallbackPortfolio;
  }
}


export type Profile = {
  id: string;
  name: string;
  role: string;
  headline: string;
  summary: string;
  bio: string[];
  email: string;
  location: string;
  whatsappUrl: string;
  githubUrl: string;
  linkedinUrl: string;
  instagramUrl: string;
  cvUrl: string;
  avatarUrl: string;
  isPublished: boolean;
  updatedAt?: string;
};

export type Technology = {
  id: string;
  name: string;
  iconUrl: string;
  category: string;
  sortOrder: number;
  isFeatured: boolean;
};

export type Project = {
  id: string;
  title: string;
  slug: string;
  category: string;
  description: string;
  imageUrl: string;
  liveUrl: string | null;
  repositoryUrl: string | null;
  technologies: Technology[];
  sortOrder: number;
  isFeatured: boolean;
  isPublished: boolean;
};

export type Certificate = {
  id: string;
  title: string;
  institution: string;
  category: string | null;
  certificateUrl: string | null;
  imageUrl: string | null;
  workload: string | null;
  completedAt: string | null;
  sortOrder: number;
  isFeatured: boolean;
  isPublished: boolean;
};

export type Experience = {
  id: string;
  company: string;
  role: string;
  location: string;
  startDate: string;
  endDate: string | null;
  description: string;
  type: 'full-time' | 'freelance' | 'study' | 'personal';
  sortOrder: number;
  isPublished: boolean;
};

export type PortfolioContent = {
  profile: Profile;
  technologies: Technology[];
  projects: Project[];
  certificates: Certificate[];
  experiences: Experience[];
};

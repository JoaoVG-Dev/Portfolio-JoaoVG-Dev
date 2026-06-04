import type { CmsFieldOption } from '../types/cms';

export const ALL_CERTIFICATE_CATEGORY = 'Todos' as const;
export const DEFAULT_CERTIFICATE_CATEGORY = 'Fundamentos' as const;

export const CERTIFICATE_CATEGORIES = [
  'Front-end',
  'Back-end',
  'Fundamentos',
  'Graduação',
  'Banco de Dados',
  'Certificações',
] as const;

export type CertificateCategory = (typeof CERTIFICATE_CATEGORIES)[number];
export type CertificateCategoryFilter = typeof ALL_CERTIFICATE_CATEGORY | CertificateCategory;

export const certificateCategoryOptions: CmsFieldOption[] = CERTIFICATE_CATEGORIES.map((category) => ({
  label: category,
  value: category,
}));

const categoryAliases: Record<string, CertificateCategory> = {
  'front-end': 'Front-end',
  frontend: 'Front-end',
  front: 'Front-end',
  'back-end': 'Back-end',
  backend: 'Back-end',
  back: 'Back-end',
  graduacao: 'Graduação',
  faculdade: 'Graduação',
  fundamentos: 'Fundamentos',
  fundamentals: 'Fundamentos',
  base: 'Fundamentos',
  iniciante: 'Fundamentos',
  iniciantes: 'Fundamentos',
  basico: 'Fundamentos',
  basicos: 'Fundamentos',
  'banco-de-dados': 'Banco de Dados',
  database: 'Banco de Dados',
  databases: 'Banco de Dados',
  db: 'Banco de Dados',
  sql: 'Banco de Dados',
  certificacao: 'Certificações',
  certificacoes: 'Certificações',
  certification: 'Certificações',
  certifications: 'Certificações',
  certificado: 'Certificações',
  certificados: 'Certificações',
  outros: DEFAULT_CERTIFICATE_CATEGORY,
  outro: DEFAULT_CERTIFICATE_CATEGORY,
  other: DEFAULT_CERTIFICATE_CATEGORY,
  others: DEFAULT_CERTIFICATE_CATEGORY,
};

function normalizeCategoryKey(category: string) {
  return category
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, ' e ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function normalizeCertificateCategory(category: string | null | undefined): CertificateCategory {
  const normalizedCategory = normalizeCategoryKey(category ?? '');

  if (!normalizedCategory) {
    return DEFAULT_CERTIFICATE_CATEGORY;
  }

  return categoryAliases[normalizedCategory] ?? DEFAULT_CERTIFICATE_CATEGORY;
}

export type CmsResourceKey = 'projects' | 'technologies' | 'certificates' | 'experiences';

export type CmsFieldType = 'text' | 'textarea' | 'url' | 'number' | 'checkbox' | 'date' | 'select';

export type CmsFieldOption = {
  label: string;
  value: string;
};

export type CmsField = {
  name: string;
  label: string;
  type: CmsFieldType;
  required?: boolean;
  placeholder?: string;
  hint?: string;
  options?: CmsFieldOption[];
};

export type CmsRecordValue = string | number | boolean | null;

export type CmsRecord = {
  id?: string;
  [key: string]: CmsRecordValue | string[] | undefined;
};

export type CmsResourceConfig = {
  key: CmsResourceKey;
  table: CmsResourceKey;
  title: string;
  singular: string;
  description: string;
  fields: CmsField[];
  initialRecord: CmsRecord;
  getTitle: (record: CmsRecord) => string;
  getSubtitle: (record: CmsRecord) => string;
};

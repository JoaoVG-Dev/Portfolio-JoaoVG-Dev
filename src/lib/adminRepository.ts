import { supabase } from './supabase';
import type { CmsRecord, CmsResourceConfig } from '../types/cms';

function getClient() {
  if (!supabase) {
    throw new Error('Supabase não configurado.');
  }

  return supabase;
}

export async function fetchCmsRecords(config: CmsResourceConfig): Promise<CmsRecord[]> {
  const client = getClient();
  const { data, error } = await client
    .from(config.table)
    .select('*')
    .order('display_order', { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []) as CmsRecord[];
}

export async function createCmsRecord(config: CmsResourceConfig, payload: CmsRecord) {
  const client = getClient();
  const { error } = await client.from(config.table).insert(payload);

  if (error) {
    throw error;
  }
}

export async function updateCmsRecord(config: CmsResourceConfig, id: string, payload: CmsRecord) {
  const client = getClient();
  const { error } = await client.from(config.table).update(payload).eq('id', id);

  if (error) {
    throw error;
  }
}

export async function deleteCmsRecord(config: CmsResourceConfig, id: string) {
  const client = getClient();
  const { error } = await client.from(config.table).delete().eq('id', id);

  if (error) {
    throw error;
  }
}

import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error(
    'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_KEY. Check your environment variables.',
  );
}

const globalForAdminClient = globalThis as typeof globalThis & {
  __supabaseAdminClient?: ReturnType<typeof createClient>;
};

const adminClient =
  globalForAdminClient.__supabaseAdminClient ??
  createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
    },
  });

if (process.env.NODE_ENV !== 'production') {
  globalForAdminClient.__supabaseAdminClient = adminClient as any;
}

export const supabaseAdminClient = adminClient;

export const getAdminBucket = (bucket: string) =>
  supabaseAdminClient.storage.from(bucket);


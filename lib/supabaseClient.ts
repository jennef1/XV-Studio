import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/database';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. Did you set up your environment variables?',
  );
}

const globalForBrowserClient = globalThis as typeof globalThis & {
  __supabaseBrowserClient?: ReturnType<typeof createBrowserClient<Database>>;
};

const client =
  globalForBrowserClient.__supabaseBrowserClient ??
  createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);

if (process.env.NODE_ENV !== 'production') {
  globalForBrowserClient.__supabaseBrowserClient = client;
}

export const supabaseBrowserClient = client;

export const getStorageBucket = (bucket: string) =>
  supabaseBrowserClient.storage.from(bucket);


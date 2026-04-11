import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Browser-safe anon client — OK to use in client components.
 * Only reads from tables that have permissive RLS policies (none exposed for now).
 */
export function getBrowserSupabase(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return null;
  return createClient(url, anon, {
    auth: { persistSession: false },
  });
}

/**
 * SERVER-ONLY admin client — uses the service role key.
 * NEVER import this file into a client component.
 */
export function getAdminSupabase(): SupabaseClient {
  if (typeof window !== "undefined") {
    throw new Error("getAdminSupabase() called in the browser — server-only.");
  }
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !service) {
    throw new Error(
      "Supabase server env missing (NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY)."
    );
  }
  return createClient(url, service, {
    auth: { persistSession: false },
  });
}

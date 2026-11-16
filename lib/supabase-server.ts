import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ??
  process.env.SUPABASE_URL;

const supabaseServiceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error(
    "Supabase URL is not configured."
  );
}

if (!supabaseServiceRoleKey) {
  throw new Error(
    "Supabase service role key is not configured."
  );
}

export const supabaseServer = createClient(
  supabaseUrl,
  supabaseServiceRoleKey
);
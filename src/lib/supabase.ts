import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.NEXT_PUBLIC_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey =
  import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase public env vars are missing.");
}

export const supabase = createClient(supabaseUrl ?? "", supabaseAnonKey ?? "");
export const hasSupabase = Boolean(supabaseUrl && supabaseAnonKey);

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const keyLooksSecret = supabasePublishableKey.startsWith("sb_secret");

export const isSupabaseConfigured = Boolean(supabaseUrl && supabasePublishableKey && !keyLooksSecret);

export const getSupabaseRuntimeStatus = () => ({
  configured: isSupabaseConfigured,
  hasUrl: Boolean(supabaseUrl),
  hasPublishableKey: Boolean(supabasePublishableKey),
  hasLegacyAnonKey: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
  keyLooksSecret
});

let browserClient: SupabaseClient | null = null;

export const getSupabaseClient = () => {
  if (!isSupabaseConfigured) {
    return null;
  }

  browserClient ??= createClient(supabaseUrl, supabasePublishableKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    },
    realtime: {
      params: {
        eventsPerSecond: 12
      }
    }
  });

  return browserClient;
};

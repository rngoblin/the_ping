import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const nightTestSupabaseUrl = "https://cucceyvdzigomjdppdnh.supabase.co";
const nightTestAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9." +
  "eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN1Y2NleXZkemlnb21qZHBwZG5oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg3NzAwODQsImV4cCI6MjA5NDM0NjA4NH0." +
  "Ny2svEVKvwDbrJn5Wm4b7qzUeo7uhexnWWpfi2XBCPU";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || nightTestSupabaseUrl;
const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || nightTestAnonKey;
const keyLooksSecret = supabasePublishableKey.startsWith("sb_secret");

export const isSupabaseConfigured = Boolean(supabaseUrl && supabasePublishableKey && !keyLooksSecret);

export const getSupabaseRuntimeStatus = () => ({
  configured: isSupabaseConfigured,
  hasUrl: Boolean(supabaseUrl),
  hasPublishableKey: Boolean(supabasePublishableKey),
  usingNightTestFallback: supabaseUrl === nightTestSupabaseUrl && supabasePublishableKey === nightTestAnonKey,
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

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const liveTestSupabaseUrl = "https://cucceyvdzigomjdppdnh.supabase.co";
const liveTestSupabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN1Y2NleXZkemlnb21qZHBwZG5oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg3NzAwODQsImV4cCI6MjA5NDM0NjA4NH0.Ny2svEVKvwDbrJn5Wm4b7qzUeo7uhexnWWpfi2XBCPU";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || liveTestSupabaseUrl;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || liveTestSupabaseAnonKey;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

let browserClient: SupabaseClient | null = null;

export const getSupabaseClient = () => {
  if (!isSupabaseConfigured) {
    return null;
  }

  browserClient ??= createClient(supabaseUrl, supabaseAnonKey, {
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

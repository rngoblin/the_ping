import { eventConfig } from "@/data/eventConfig";
import { mockRealtime } from "@/services/realtime/mockRealtime";
import { supabaseRealtime } from "@/services/realtime/supabaseRealtime";
import { isSupabaseConfigured } from "@/services/supabase/client";

export const getRealtimeProviderName = () => {
  if (eventConfig.realtimeProvider === "supabase" && isSupabaseConfigured) {
    return "supabase";
  }

  return "mock";
};

export const getRealtimeAdapter = () => {
  return getRealtimeProviderName() === "supabase" ? supabaseRealtime : mockRealtime;
};

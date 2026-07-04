// Node 22 (see netlify.toml NODE_VERSION) ships a native global WebSocket, so
// Supabase Realtime works without polyfilling `ws`. These server clients never
// open realtime channels anyway, so no extra options are required here.
export function getSupabaseNodeOptions() {
  return {}
}

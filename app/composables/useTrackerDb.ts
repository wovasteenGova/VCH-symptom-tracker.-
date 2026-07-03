export const TRACKER_SCHEMA = 'tracker'

export function useTrackerDb() {
  const supabase = useSupabaseClient()

  return supabase.schema(TRACKER_SCHEMA)
}

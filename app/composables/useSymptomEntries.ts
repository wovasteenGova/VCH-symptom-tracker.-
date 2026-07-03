type SymptomEntryPayload = {
  condition_key: string
  condition_label: string
  source?: 'veteran' | 'family'
  entry_status?: 'draft' | 'complete'
  severity?: number | null
  occurred_at?: string | null
  summary?: string | null
  impact?: string | null
  details?: Record<string, unknown>
}

export function useSymptomEntries() {
  const supabase = useSupabaseClient()

  async function getUserId() {
    const { data: userData, error: userError } = await supabase.auth.getUser()

    if (userError) {
      throw userError
    }

    if (userData.user) {
      return userData.user.id
    }

    throw new Error('Please sign in before saving symptom entries.')
  }

  async function listEntries() {
    const userId = await getUserId()

    const { data, error } = await supabase
      .from('symptom_entries')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    return data || []
  }

  async function createEntry(payload: SymptomEntryPayload) {
    const userId = await getUserId()

    const { data, error } = await supabase
      .from('symptom_entries')
      .insert({
        user_id: userId,
        source: 'veteran',
        entry_status: 'complete',
        ...payload
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return data
  }

  async function updateEntry(id: string, payload: Partial<SymptomEntryPayload>) {
    const { data, error } = await supabase
      .from('symptom_entries')
      .update({
        ...payload,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw error
    }

    return data
  }

  async function deleteEntry(id: string) {
    const { error } = await supabase
      .from('symptom_entries')
      .delete()
      .eq('id', id)

    if (error) {
      throw error
    }
  }

  async function deleteAllEntries() {
    const userId = await getUserId()

    const { error } = await supabase
      .from('symptom_entries')
      .delete()
      .eq('user_id', userId)

    if (error) {
      throw error
    }
  }

  return {
    listEntries,
    createEntry,
    updateEntry,
    deleteEntry,
    deleteAllEntries
  }
}

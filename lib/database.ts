import { supabase } from './supabase'

// Example: User profile operations
export const createUserProfile = async (userId: string, data: any) => {
  const { data: profile, error } = await supabase
    .from('profiles')
    .insert([{ id: userId, ...data }])
    .select()
    .single()

  return { profile, error }
}

export const getUserProfile = async (userId: string) => {
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  return { profile, error }
}

export const updateUserProfile = async (userId: string, updates: any) => {
  const { data: profile, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()

  return { profile, error }
}
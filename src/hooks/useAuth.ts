import { useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase, isUsingMockAuth } from '../lib/supabase'
import { MockUser, MockSession, MockUserProfile } from '../lib/mockAuth'

export interface UserProfile {
  id: string
  name: string
  email: string
  user_type: 'student' | 'employee'
  university_id: string
  department: string
  points: number
  avatar_url?: string
  created_at: string
}

export function useAuth() {
  const [user, setUser] = useState<User | MockUser | null>(null)
  const [profile, setProfile] = useState<UserProfile | MockUserProfile | null>(null)
  const [session, setSession] = useState<Session | MockSession | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchUserProfile(session.user.id)
      } else {
        setLoading(false)
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        
        if (session?.user) {
          await fetchUserProfile(session.user.id)
        } else {
          setProfile(null)
          setLoading(false)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const fetchUserProfile = async (userId: string) => {
    try {
      console.log('Fetching profile for user:', userId, 'Using mock auth:', isUsingMockAuth)
      
      const result = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single()

      console.log('Profile fetch result:', result)
      const { data, error } = result

      if (error && error.code === 'PGRST116') {
        // Profile doesn't exist, this is normal for new users
        console.log('No profile found for user, this is normal for new users')
        setLoading(false)
        return
      }

      if (error) {
        console.error('Error fetching profile:', error)
      } else {
        console.log('Profile fetched successfully:', data)
        setProfile(data)
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  }

  const signUp = async (email: string, password: string, userData: {
    name: string
    user_type: 'student' | 'employee'
    university_id: string
    department: string
  }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    })
    
    return { data, error }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  }

  const createProfile = async (userData: Omit<UserProfile, 'created_at' | 'points'>) => {
    try {
      console.log('Creating profile with data:', userData, 'Using mock auth:', isUsingMockAuth)
      
      const result = await supabase
        .from('user_profiles')
        .insert([{
          ...userData,
          points: 0
        }])
        .select()
        .single()

      console.log('Profile creation result:', result)
      const { data, error } = result

      if (data) {
        console.log('Profile created successfully:', data)
        setProfile(data)
      }

      if (error) {
        console.error('Error in createProfile:', error)
      }

      return { data, error }
    } catch (error) {
      console.error('Error creating profile:', error)
      return { data: null, error }
    }
  }

  const updateProfile = async (updates: Partial<UserProfile | MockUserProfile>) => {
    if (!user) return { data: null, error: new Error('No user logged in') }

    try {
      let result;
      
      if (isUsingMockAuth) {
        // Use mock database
        result = await supabase.from('user_profiles').update(updates).eq('id', user.id).select().single()
      } else {
        // Use real Supabase
        result = await supabase
          .from('user_profiles')
          .update(updates)
          .eq('id', user.id)
          .select()
          .single()
      }

      const { data, error } = result

      if (data) {
        setProfile(data)
      }

      return { data, error }
    } catch (error) {
      console.error('Error updating profile:', error)
      return { data: null, error }
    }
  }

  return {
    user,
    profile,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    createProfile,
    updateProfile
  }
}
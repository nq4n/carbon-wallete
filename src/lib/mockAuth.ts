// Mock authentication system for development/demo purposes
// This replaces Supabase auth when real credentials are not available

export interface MockUser {
  id: string
  email: string
  user_metadata?: any
  created_at: string
}

export interface MockSession {
  access_token: string
  refresh_token: string
  user: MockUser
}

export interface MockUserProfile {
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

// Demo users for testing
const demoUsers: { [email: string]: MockUser } = {
  'demo@squ.edu.om': {
    id: '550e8400-e29b-41d4-a716-446655440000',
    email: 'demo@squ.edu.om',
    user_metadata: {
      name: 'أحمد محمد الأحمدي',
      user_type: 'student',
      university_id: '202301234',
      department: 'هندسة البرمجيات'
    },
    created_at: '2024-01-01T00:00:00Z'
  },
  'employee@squ.edu.om': {
    id: '550e8400-e29b-41d4-a716-446655440001',
    email: 'employee@squ.edu.om',
    user_metadata: {
      name: 'فاطمة سالم الراشدي',
      user_type: 'employee',
      university_id: 'E789456',
      department: 'قسم تقنية المعلومات'
    },
    created_at: '2024-01-01T00:00:00Z'
  }
}

const demoProfiles: { [userId: string]: MockUserProfile } = {
  '550e8400-e29b-41d4-a716-446655440000': {
    id: '550e8400-e29b-41d4-a716-446655440000',
    name: 'أحمد محمد الأحمدي',
    email: 'demo@squ.edu.om',
    user_type: 'student',
    university_id: '202301234',
    department: 'هندسة البرمجيات',
    points: 1250,
    created_at: '2024-01-01T00:00:00Z'
  },
  '550e8400-e29b-41d4-a716-446655440001': {
    id: '550e8400-e29b-41d4-a716-446655440001',
    name: 'فاطمة سالم الراشدي',
    email: 'employee@squ.edu.om',
    user_type: 'employee',
    university_id: 'E789456',
    department: 'قسم تقنية المعلومات',
    points: 890,
    created_at: '2024-01-01T00:00:00Z'
  }
}

export class MockAuth {
  private currentUser: MockUser | null = null
  private currentSession: MockSession | null = null
  private listeners: ((event: string, session: MockSession | null) => void)[] = []

  constructor() {
    // Check if there's a stored session
    const storedSession = localStorage.getItem('mock-auth-session')
    if (storedSession) {
      try {
        this.currentSession = JSON.parse(storedSession)
        this.currentUser = this.currentSession.user
      } catch (e) {
        localStorage.removeItem('mock-auth-session')
      }
    }
  }

  async getSession() {
    return {
      data: { session: this.currentSession },
      error: null
    }
  }

  async signInWithPassword({ email, password }: { email: string, password: string }) {
    // Demo credentials
    if (email === 'demo@squ.edu.om' && password === 'demo123') {
      const user = demoUsers[email]
      const session: MockSession = {
        access_token: 'mock-token-' + Date.now(),
        refresh_token: 'mock-refresh-token-' + Date.now(),
        user
      }
      
      this.currentUser = user
      this.currentSession = session
      localStorage.setItem('mock-auth-session', JSON.stringify(session))
      
      // Notify listeners
      this.listeners.forEach(listener => listener('SIGNED_IN', session))
      
      return { data: { user, session }, error: null }
    }
    
    if (email === 'employee@squ.edu.om' && password === 'demo123') {
      const user = demoUsers[email]
      const session: MockSession = {
        access_token: 'mock-token-' + Date.now(),
        refresh_token: 'mock-refresh-token-' + Date.now(),
        user
      }
      
      this.currentUser = user
      this.currentSession = session
      localStorage.setItem('mock-auth-session', JSON.stringify(session))
      
      // Notify listeners
      this.listeners.forEach(listener => listener('SIGNED_IN', session))
      
      return { data: { user, session }, error: null }
    }

    return {
      data: { user: null, session: null },
      error: { message: 'Invalid login credentials' }
    }
  }

  async signUp({ email, password, options }: {
    email: string
    password: string
    options?: { data?: any }
  }) {
    // For demo, only allow specific domains
    if (!email.endsWith('@squ.edu.om')) {
      return {
        data: { user: null, session: null },
        error: { message: 'Only SQU email addresses are allowed' }
      }
    }

    // Create a new mock user
    const userId = 'user-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9)
    const user: MockUser = {
      id: userId,
      email,
      user_metadata: options?.data || {},
      created_at: new Date().toISOString()
    }

    const session: MockSession = {
      access_token: 'mock-token-' + Date.now(),
      refresh_token: 'mock-refresh-token-' + Date.now(),
      user
    }

    this.currentUser = user
    this.currentSession = session
    localStorage.setItem('mock-auth-session', JSON.stringify(session))

    // Automatically create a profile for new users
    if (options?.data) {
      const newProfile: MockUserProfile = {
        id: userId,
        name: options.data.name,
        email: email,
        user_type: options.data.user_type,
        university_id: options.data.university_id,
        department: options.data.department,
        points: 0,
        created_at: new Date().toISOString()
      }
      demoProfiles[userId] = newProfile
    }

    // Notify listeners
    this.listeners.forEach(listener => listener('SIGNED_IN', session))

    return { data: { user, session }, error: null }
  }

  async signOut() {
    this.currentUser = null
    this.currentSession = null
    localStorage.removeItem('mock-auth-session')
    
    // Notify listeners
    this.listeners.forEach(listener => listener('SIGNED_OUT', null))
    
    return { error: null }
  }

  onAuthStateChange(callback: (event: string, session: MockSession | null) => void) {
    this.listeners.push(callback)
    return {
      data: {
        subscription: {
          unsubscribe: () => {
            const index = this.listeners.indexOf(callback)
            if (index > -1) {
              this.listeners.splice(index, 1)
            }
          }
        }
      }
    }
  }
}

export class MockDatabase {
  from(table: string) {
    return new MockTable(table)
  }
}

class MockTable {
  private table: string
  private query: any = {}

  constructor(table: string) {
    this.table = table
    this.query = {
      operation: null,
      columns: '*',
      data: null,
      where: null,
      single: false
    }
  }

  select(columns = '*') {
    this.query.operation = 'select'
    this.query.columns = columns
    return this
  }

  insert(data: any) {
    this.query.operation = 'insert'
    this.query.data = Array.isArray(data) ? data : [data]
    return this
  }

  update(data: any) {
    this.query.operation = 'update'
    this.query.data = data
    return this
  }

  delete() {
    this.query.operation = 'delete'
    return this
  }

  eq(column: string, value: any) {
    this.query.where = { column, value, operator: 'eq' }
    return this
  }

  neq(column: string, value: any) {
    this.query.where = { column, value, operator: 'neq' }
    return this
  }

  single() {
    this.query.single = true
    return this
  }

  async execute(): Promise<{ data: any, error: any }> {
    try {
      if (this.table === 'user_profiles') {
        return await this.handleUserProfiles()
      }

      // Add more table handlers as needed
      return { data: null, error: { message: `Mock table '${this.table}' not implemented` } }
    } catch (error) {
      return { data: null, error: { message: `Mock operation failed: ${error}` } }
    }
  }

  private async handleUserProfiles(): Promise<{ data: any, error: any }> {
    switch (this.query.operation) {
      case 'select':
        if (this.query.where && this.query.where.operator === 'eq') {
          const profile = demoProfiles[this.query.where.value]
          if (profile) {
            return { data: this.query.single ? profile : [profile], error: null }
          } else {
            return { 
              data: null, 
              error: { 
                code: 'PGRST116', 
                message: 'The result contains 0 rows' 
              } 
            }
          }
        }
        
        // Return all profiles if no where clause
        const allProfiles = Object.values(demoProfiles)
        return { 
          data: this.query.single ? allProfiles[0] : allProfiles, 
          error: null 
        }

      case 'insert':
        if (this.query.data && Array.isArray(this.query.data)) {
          const newProfile = {
            ...this.query.data[0],
            created_at: new Date().toISOString(),
            points: this.query.data[0].points || 0
          }
          
          // Store in mock database
          demoProfiles[newProfile.id] = newProfile
          
          return { 
            data: this.query.single ? newProfile : [newProfile], 
            error: null 
          }
        }
        return { data: null, error: { message: 'No data provided for insert' } }

      case 'update':
        if (this.query.where && this.query.data) {
          const existingProfile = demoProfiles[this.query.where.value]
          if (existingProfile) {
            const updatedProfile = {
              ...existingProfile,
              ...this.query.data,
              updated_at: new Date().toISOString()
            }
            
            demoProfiles[this.query.where.value] = updatedProfile
            return { 
              data: this.query.single ? updatedProfile : [updatedProfile], 
              error: null 
            }
          }
        }
        return { data: null, error: { message: 'Profile not found for update' } }

      case 'delete':
        if (this.query.where) {
          const profile = demoProfiles[this.query.where.value]
          if (profile) {
            delete demoProfiles[this.query.where.value]
            return { data: profile, error: null }
          }
        }
        return { data: null, error: { message: 'Profile not found for delete' } }

      default:
        return { data: null, error: { message: 'Unknown operation' } }
    }
  }

  // Make it work like a promise to match Supabase API
  then(onfulfilled?: (value: any) => any, onrejected?: (reason: any) => any) {
    return this.execute().then(onfulfilled, onrejected)
  }

  catch(onrejected?: (reason: any) => any) {
    return this.execute().catch(onrejected)
  }

  finally(onfinally?: () => void) {
    return this.execute().finally(onfinally)
  }
}

// Create mock instances
export const mockAuth = new MockAuth()
export const mockDb = new MockDatabase()

// Create a mock supabase client that mimics the real one
export const createMockSupabaseClient = () => {
  const client = {
    auth: mockAuth,
    from: (table: string) => mockDb.from(table),
    storage: {
      // Add mock storage methods if needed
      from: (bucket: string) => ({
        upload: async () => ({ data: null, error: null }),
        download: async () => ({ data: null, error: null }),
        list: async () => ({ data: [], error: null }),
        remove: async () => ({ data: null, error: null })
      })
    }
  }

  return client
}
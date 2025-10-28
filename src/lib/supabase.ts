import { createClient } from '@supabase/supabase-js'
import { createMockSupabaseClient } from './mockAuth'
import { publicAnonKey, projectId } from '../utils/supabase/info'

// Extend window interface for our demo flag
declare global {
  interface Window {
    __demoInfoShown?: boolean
  }
}

// Configuration for Supabase
// Replace these with your actual Supabase project credentials
const supabaseUrl = `https://${projectId}.supabase.co`
const supabaseAnonKey = publicAnonKey

// Check if we have real Supabase credentials
const hasRealCredentials = 
  !!(projectId && projectId !== "vmseijrfsadkwtdlpvzy") &&
  !!(publicAnonKey && publicAnonKey !== "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZtc2VpanJmc2Fka3d0ZGxwdnp5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2ODA0NDcsImV4cCI6MjA3MTI1NjQ0N30.-_Y9agFSdMtu5kkfg64Jwn4rGaBd-djXVCZvVmMidVk")

// For development/demo purposes, use mock auth when real credentials aren't available
// For production, you need to:
// 1. Create a Supabase project at https://supabase.com
// 2. Replace the URL and key above with your actual project credentials
// 3. Set up the database tables using the SQL in /database/setup.sql
export const supabase = hasRealCredentials 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createMockSupabaseClient() as any

// Export a flag to know if we're using mock or real Supabase
export const isUsingMockAuth = !hasRealCredentials

// Display info about current setup (only once)
if (typeof window !== 'undefined' && !hasRealCredentials && !window.__demoInfoShown) {
  window.__demoInfoShown = true
  console.log(`
🚀 المحفظة الكربونية الرقمية - وضع التجريبي

يعمل التطبيق حالياً في الوضع التجريبي باستخدام بيانات وهمية.

حسابات تجريبية متاحة:
📧 demo@squ.edu.om | 🔒 demo123 (طالب)
📧 employee@squ.edu.om | 🔒 demo123 (موظف)

لاستخدام Supabase الحقيقي:
1. أنشئ مشروع في https://supabase.com
2. عدّل ملف /lib/supabase.ts بمفاتيح مشروعك
3. شغّل أوامر SQL من /database/setup.sql
  `)
}
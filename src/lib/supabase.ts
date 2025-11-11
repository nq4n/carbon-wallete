import { createClient } from '@supabase/supabase-js'
import { createMockSupabaseClient } from './mockAuth'
import { publicAnonKey, projectId } from '../utils/supabase/info'

// Extend window interface for our demo flag
declare global {
  interface Window {
    __demoInfoShown?: boolean
  }
}


const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// (اختياري) تحقق إذا القيم حقيقية أم placeholder
const hasRealCredentials =
  supabaseUrl && supabaseUrl !== "https://your-project.supabase.co" &&
  supabaseAnonKey && supabaseAnonKey !== "your-anon-key";

console.log("Using real Supabase credentials:", hasRealCredentials);

// If real credentials are not provided, fall back to an in-memory mock client
// to avoid runtime "Failed to fetch" errors when the app calls the Supabase API.
export const supabase = ((): ReturnType<typeof createClient> | any => {
  if (hasRealCredentials) {
    return createClient(supabaseUrl, supabaseAnonKey);
  }
  // use the mocked client for local/demo mode
  return createMockSupabaseClient();
})();

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
import { useEffect, useState } from "react";
import type { User, Session } from "@supabase/supabase-js";
import { supabase, isUsingMockAuth } from "../lib/supabase";
import type { MockUser, MockSession, MockUserProfile } from "../lib/mockAuth";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  user_type: "student" | "employee";
  university_id: string;
  department: string;
  points: number;
  avatar_url?: string;
  created_at: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | MockUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | MockUserProfile | null>(null);
  const [session, setSession] = useState<Session | MockSession | null>(null);
  const [loading, setLoading] = useState(true); // جاهزية الواجهة

  // تهيئة جلسة التوثيق مرة واحدة
  useEffect(() => {
    let mounted = true;

    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      setSession(data.session ?? null);
      setUser(data.session?.user ?? null);
      setLoading(false); // لا تنتظر جلب البروفايل
    })();

    const { data: sub } = supabase.auth.onAuthStateChange((_ev, sess) => {
      setSession(sess ?? null);
      setUser(sess?.user ?? null);
      setLoading(false);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  // جلب البروفايل عند تغيّر المستخدم
  useEffect(() => {
    let aborted = false;
    async function fetchProfile(uid: string) {
      try {
        const { data, error } = await supabase
          .from("user_profiles")
          .select("*")
          .eq("id", uid)
          .maybeSingle(); // لا يرمي خطأ عند عدم وجود صف

        if (aborted) return;

        if (error && error.code !== "PGRST116") {
          console.warn("profile load error:", error);
          setProfile(null);
          return;
        }
        setProfile(data ?? null); // قد يكون null مباشرة بعد التسجيل حتى يعمل التريغر
      } catch (err) {
        if (!aborted) {
          console.warn("profile fetch exception:", err);
          setProfile(null);
        }
      }
    }

    if (user?.id) fetchProfile(user.id);
    else setProfile(null);

    return () => {
      aborted = true;
    };
  }, [user?.id]);

  // تسجيل الدخول
  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (error) console.error("login error:", { status: error.status, name: error.name, message: error.message });
    return { data, error };
  };

  // إنشاء حساب (التريغر ينشئ صف user_profiles تلقائيًا)
  const signUp = async (
    email: string,
    password: string,
    userData: {
      name: string;
      user_type: "student" | "employee";
      university_id: string;
      department: string;
    }
  ) => {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { data: userData }, // يمر إلى raw_user_meta_data لاستخدامه في التريغر
    });
    if (error) console.error("signup error:", { status: error.status, name: error.name, message: error.message });
    return { data, error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  // إدخال/تعديل بروفايل يدويًا (يستخدم سياسة insert/update مع id = auth.uid())
  const createProfile = async (userData: Omit<UserProfile, "created_at" | "points">) => {
    try {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return { data: null, error: new Error("No user") };

      const payload = { ...userData, id: u.user.id, points: 0 };
      const { data, error } = await supabase.from("user_profiles").insert([payload]).select().maybeSingle();

      if (error) {
        console.error("createProfile error:", error);
        return { data: null, error };
      }
      setProfile(data as any);
      return { data, error: null };
    } catch (e: any) {
      console.error("createProfile exception:", e);
      return { data: null, error: e };
    }
  };

  const updateProfile = async (updates: Partial<UserProfile | MockUserProfile>) => {
    const id = (user as any)?.id;
    if (!id) return { data: null, error: new Error("No user logged in") };

    try {
      const { data, error } = await supabase
        .from("user_profiles")
        .update(updates)
        .eq("id", id)
        .select()
        .maybeSingle();

      if (error) return { data: null, error };
      if (data) setProfile(data as any);
      return { data, error: null };
    } catch (e: any) {
      console.error("updateProfile exception:", e);
      return { data: null, error: e };
    }
  };

  return {
    user,
    profile,
    session,
    loading, // استخدمه لحماية الواجهات: إن كان true اعرض nothing/Spinner بسيط
    signIn,
    signUp,
    signOut,
    createProfile,
    updateProfile,
  };
}

'use client';

import { useState, useEffect } from "react";
import { supabase } from "./lib/supabase";
import {
  AuthProvider,
  useAuthContext,
} from "./components/auth/AuthProvider";
import LoginForm from "./components/auth/LoginForm";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "./components/ui/tabs";
import { Button } from "./components/ui/button";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "./components/ui/avatar";
import { Badge } from "./components/ui/badge";
import { Card } from "./components/ui/card";
import CarbonDashboard from "./components/CarbonDashboard";
import ActivityLogger from "./components/ActivityLogger";
import CarbonStats from "./components/CarbonStats";
import RewardsCenter from "./components/RewardsCenter";
import UserCoupons from "./components/UserCoupons";
import InteractiveMap from "./components/InteractiveMap";
import GreenStore from "./components/GreenStore";
import EcoLearningCenter from "./components/EcoLearningCenter";
import EcoQuizzes from "./components/EcoQuizzes";
import AIRecommendations from "./components/AIRecommendations";
import ChangePasswordDialog from "./components/ChangePasswordDialog";
import Notifications from './components/Notifications';
import {
  Home,
  BarChart3,
  Gift,
  User,
  Lock,
  Bell,
  GraduationCap,
  Briefcase,
  MapPin,
  ShoppingBag,
  BookOpen,
  Brain,
  Lightbulb,
  Loader2,
} from "lucide-react";
import greenPulseLogo from "./assets/logo.png";
import { ImageWithFallback } from "./components/figma/ImageWithFallback";
import { Toaster } from './components/ui/sonner';
import GrowingTreeBackground from "./components/auth/GrowingTreeBackground";

function AppContent() {
  const { user, profile, loading, signOut } = useAuthContext();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [profileStats, setProfileStats] = useState({
    rank: 0,
    totalUsers: 0,
    currentGoal: "Loading...",
  });

  useEffect(() => {
    if (!user || !profile) return;

    const fetchProfileData = async () => {
      const { data: rankingData } = await supabase
        .from('user_rankings')
        .select('rank')
        .eq('user_id', user.id)
        .single();
      
      const { count } = await supabase
        .from('user_rankings')
        .select('*', { count: 'exact', head: true });

      const { data: goal } = await supabase
        .from('carbon_goals')
        .select('title')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      setProfileStats({
        rank: rankingData?.rank ?? 0,
        totalUsers: count ?? 0,
        currentGoal: goal?.title ?? 'لم يتم تعيين هدف حالي',
      });
    };

    fetchProfileData();
  }, [user, profile]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-16 h-16 mx-auto animate-spin text-primary" />
          <p className="text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-16 h-16 mx-auto animate-spin text-primary" />
          <p className="text-muted-foreground">جاري تحميل بيانات الملف الشخصي...</p>
        </div>
      </div>
    );
  }

  const userData = {
    name: profile.name,
    id: profile.university_id,
    department: profile.department,
    level: profile.level || "مبتدئ",
    points: profile.points,
    type: profile.user_type,
  };

  return (
    <div className="relative min-h-screen z-[1]" dir="rtl">
      <GrowingTreeBackground
        isAnimating={true}
        color="rgba(32,227,227,0.35)"
        hoverColor="rgba(28,233,233,0.57)"
        lineWidth={1}
        speed={1}
        density={8}
        fade={0.05}
      />
      <header className="border-b bg-transparent">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <ImageWithFallback
                  src={greenPulseLogo}
                  alt="Green Pulse Logo"
                  className="w-12 h-12 object-contain"
                />
              </div>
              <div>
                <h1 className="font-bold text-lg">المحفظة الكربونية الرقمية</h1>
                <p className="text-sm text-muted-foreground">جامعة السلطان قابوس</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => setActiveTab('notifications')}><Bell className="w-5 h-5" /></Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => signOut()}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                تسجيل الخروج
              </Button>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="font-medium text-sm">{userData.name}</p>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">{userData.points} نقطة</Badge>
                    <span className="text-xs text-muted-foreground">{userData.department}</span>
                  </div>
                </div>
                <Avatar>
                  <AvatarImage src={profile.avatar_url} />
                  <AvatarFallback>{userData.name.slice(0, 2)}</AvatarFallback>
                </Avatar>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="mb-6">
            <TabsList className="grid w-full grid-cols-9 h-12 text-xs bg-transparent">
                 <TabsTrigger value="dashboard"><Home className="w-4 h-4" /><span className="hidden lg:inline">لوحة التحكم</span></TabsTrigger>
                 <TabsTrigger value="learning"><BookOpen className="w-4 h-4" /><span className="hidden lg:inline">التعلم</span></TabsTrigger>
                 <TabsTrigger value="quiz"><Brain className="w-4 h-4" /><span className="hidden lg:inline">الاختبارات</span></TabsTrigger>
                 <TabsTrigger value="ai"><Lightbulb className="w-4 h-4" /><span className="hidden lg:inline">التوصيات</span></TabsTrigger>
                 <TabsTrigger value="map"><MapPin className="w-4 h-4" /><span className="hidden lg:inline">الخريطة</span></TabsTrigger>
                 <TabsTrigger value="store"><ShoppingBag className="w-4 h-4" /><span className="hidden lg:inline">المتجر</span></TabsTrigger>
                 <TabsTrigger value="stats"><BarChart3 className="w-4 h-4" /><span className="hidden lg:inline">الإحصائيات</span></TabsTrigger>
                 <TabsTrigger value="rewards"><Gift className="w-4 h-4" /><span className="hidden lg:inline">المكافآت</span></TabsTrigger>
                 <TabsTrigger value="profile"><User className="w-4 h-4" /><span className="hidden lg:inline">الملف الشخصي</span></TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="dashboard" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">مرحباً، {userData.name.split(" ")[0]}!</h2>
                <p className="text-muted-foreground">إليك نظرة عامة على نشاطك البيئي اليوم</p>
              </div>
              <ActivityLogger onSaved={() => window.location.reload()} />
            </div>
            <CarbonDashboard />
          </TabsContent>

          <TabsContent value="learning"><EcoLearningCenter /></TabsContent>
          <TabsContent value="quiz"><EcoQuizzes userPoints={userData.points} /></TabsContent>
          <TabsContent value="ai"><AIRecommendations userData={userData} /></TabsContent>
          <TabsContent value="map"><InteractiveMap /></TabsContent>
          <TabsContent value="store"><GreenStore userPoints={userData.points} /></TabsContent>
          <TabsContent value="stats"><CarbonStats /></TabsContent>
          <TabsContent value="rewards"><RewardsCenter /></TabsContent>
          <TabsContent value="notifications"><Notifications /></TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="font-semibold mb-4">المعلومات الشخصية</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-center mb-6">
                    <Avatar className="w-24 h-24">
                      <AvatarImage src={profile?.avatar_url} />
                      <AvatarFallback className="text-2xl">{userData.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}</AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="space-y-3">
                     <div><label className="text-sm text-muted-foreground">البريد الإلكتروني</label><p className="font-medium">{user?.email}</p></div>
                    <div>
                      <label className="text-sm text-muted-foreground">نوع المستخدم</label>
                      <br></br>
                      <Badge variant="outline" className="mt-1">
                        {userData.type === "student" ? <><GraduationCap className="w-4 h-4 ml-1" />طالب</> : <><Briefcase className="w-4 h-4 ml-1" />موظف</>}
                      </Badge>
                    </div>
                    <div><label className="text-sm text-muted-foreground">الاسم</label><p className="font-medium">{userData.name}</p></div>
                    <div><label className="text-sm text-muted-foreground">{userData.type === "student" ? "الرقم الجامعي" : "الرقم الوظيفي"}</label><p className="font-medium">{userData.id}</p></div>
                    <div><label className="text-sm text-muted-foreground">{userData.type === "student" ? "التخصص" : "القسم"}</label><p className="font-medium">{userData.department}</p></div>
                    <div><label className="text-sm text-muted-foreground">المستوى البيئي</label><Badge className="bg-green-600">{userData.level}</Badge></div>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="font-semibold mb-4">الأهداف البيئية</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-medium text-green-800 mb-2">الهدف الحالي</h4>
                    <p className="text-sm text-green-700">{profileStats.currentGoal}</p>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-muted-foreground">النقاط المجمعة</label>
                      <p className="text-2xl font-bold text-green-600">{userData.points}</p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">الترتيب العام</label>
                      <br></br>
                      <label className="text-2xl font-bold text-green-600">#{profileStats.rank}</label>
                      <p className="font-semibold"> من أصل {profileStats.totalUsers} مستخدم</p>
                    </div>
                  </div>
                </div>
                <div className="mt-6 pt-4 border-t">
                  <Button variant="outline" className="w-full" onClick={() => setIsChangePasswordOpen(true)}>
                    <Lock className="w-4 h-4 ml-2" />
                    تغيير كلمة المرور
                  </Button>
                </div>
              </Card>
            </div>
            <UserCoupons />
          </TabsContent>
        </Tabs>
      </div>

      <ChangePasswordDialog isOpen={isChangePasswordOpen} onOpenChange={setIsChangePasswordOpen} />

      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t">
         <div className="grid grid-cols-6 h-16 text-xs">
          {[ 
            { id: "dashboard", icon: Home, label: "الرئيسية" },
            { id: "learning", icon: BookOpen, label: "التعلم" },
            { id: "quiz", icon: Brain, label: "الاختبارات" },
            { id: "ai", icon: Lightbulb, label: "التوصيات" },
            { id: "rewards", icon: Gift, label: "المكافآت" },
            { id: "profile", icon: User, label: "الملف" },
           ].map(({ id, icon: Icon, label }) => (
            <button key={id} onClick={() => setActiveTab(id)} className={`flex flex-col items-center justify-center gap-1 transition-colors ${activeTab === id ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}>
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
           ))}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
      <Toaster />
    </AuthProvider>
  );
}

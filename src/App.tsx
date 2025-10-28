"use client";

import { useState } from "react";
import {
  AuthProvider,
  useAuthContext,
} from "./components/auth/AuthProvider";
import LoginForm from "./components/auth/LoginForm";
import ProfileSetup from "./components/ProfileSetup";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./components/ui/select";
import CarbonDashboard from "./components/CarbonDashboard";
import ActivityLogger from "./components/ActivityLogger";
import CarbonStats from "./components/CarbonStats";
import RewardsCenter from "./components/RewardsCenter";
import InteractiveMap from "./components/InteractiveMap";
import GreenStore from "./components/GreenStore";
import EcoLearningCenter from "./components/EcoLearningCenter";
import EcoQuizzes from "./components/EcoQuizzes";
import AIRecommendations from "./components/AIRecommendations";
import {
  Home,
  BarChart3,
  Gift,
  User,
  Settings,
  Bell,
  Menu,
  Leaf,
  GraduationCap,
  Briefcase,
  MapPin,
  ShoppingBag,
  BookOpen,
  Brain,
  Lightbulb,
} from "lucide-react";
import greenPulseLogo from "figma:asset/2c1ec6a90a7fc9cfca4f45b98c3e9ac1918a1565.png";
import { ImageWithFallback } from "./components/figma/ImageWithFallback";
import { Toaster } from './components/ui/sonner';

function AppContent() {
  const { user, profile, loading, signOut } = useAuthContext();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <ImageWithFallback
            src={greenPulseLogo}
            alt="Green Pulse Logo"
            className="w-16 h-16 object-contain mx-auto animate-pulse"
          />
          <p className="text-muted-foreground">
            جاري التحميل...
          </p>
        </div>
      </div>
    );
  }

  // Show login form if user is not authenticated
  if (!user) {
    return <LoginForm />;
  }

  // Show profile setup if user is authenticated but has no profile
  if (user && !profile) {
    return <ProfileSetup />;
  }

  // Use profile data if available, otherwise use default data
  const userData = profile
    ? {
        name: profile.name,
        id: profile.university_id,
        department: profile.department,
        level: "صديق البيئة",
        points: profile.points,
        type: profile.user_type,
      }
    : {
        name: "مستخدم جديد",
        id: user.email || "",
        department: "غير محدد",
        level: "مبتدئ",
        points: 0,
        type: "student",
      };

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 bg-[rgba(32,227,227,0.35)]">
          <div className="flex items-center justify-between">
            {/* Logo and Title */}
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <ImageWithFallback
                  src={greenPulseLogo}
                  alt="Green Pulse Logo"
                  className="w-12 h-12 object-contain"
                />
              </div>
              <div>
                <h1 className="font-bold text-lg">
                  المحفظة الكربونية الرقمية
                </h1>
                <p className="text-sm text-muted-foreground">
                  جامعة السلطان قابوس
                </p>
              </div>
            </div>

            {/* User Profile */}
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm">
                <Bell className="w-4 h-4" />
              </Button>

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
                  <p className="font-medium text-sm">
                    {userData.name}
                  </p>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="secondary"
                      className="text-xs"
                    >
                      {userData.points} نقطة
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {userData.department}
                    </span>
                  </div>
                </div>
                <Avatar>
                  <AvatarImage src="/api/placeholder/40/40" />
                  <AvatarFallback>أ.أ</AvatarFallback>
                </Avatar>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          {/* Navigation Tabs */}
          <div className="mb-6 bg-[rgba(28,233,233,0.57)]">
            <TabsList className="grid w-full grid-cols-9 h-12 text-xs">
              <TabsTrigger
                value="dashboard"
                className="flex items-center gap-1"
              >
                <Home className="w-4 h-4" />
                <span className="hidden lg:inline">
                  لوحة التحكم
                </span>
              </TabsTrigger>
              <TabsTrigger
                value="learning"
                className="flex items-center gap-1"
              >
                <BookOpen className="w-4 h-4" />
                <span className="hidden lg:inline">التعلم</span>
              </TabsTrigger>
              <TabsTrigger
                value="quiz"
                className="flex items-center gap-1"
              >
                <Brain className="w-4 h-4" />
                <span className="hidden lg:inline">
                  الاختبارات
                </span>
              </TabsTrigger>
              <TabsTrigger
                value="ai"
                className="flex items-center gap-1"
              >
                <Lightbulb className="w-4 h-4" />
                <span className="hidden lg:inline">
                  التوصيات
                </span>
              </TabsTrigger>
              <TabsTrigger
                value="map"
                className="flex items-center gap-1"
              >
                <MapPin className="w-4 h-4" />
                <span className="hidden lg:inline">
                  الخريطة
                </span>
              </TabsTrigger>
              <TabsTrigger
                value="store"
                className="flex items-center gap-1"
              >
                <ShoppingBag className="w-4 h-4" />
                <span className="hidden lg:inline">المتجر</span>
              </TabsTrigger>
              <TabsTrigger
                value="stats"
                className="flex items-center gap-1"
              >
                <BarChart3 className="w-4 h-4" />
                <span className="hidden lg:inline">
                  الإحصائيات
                </span>
              </TabsTrigger>
              <TabsTrigger
                value="rewards"
                className="flex items-center gap-1"
              >
                <Gift className="w-4 h-4" />
                <span className="hidden lg:inline">
                  المكافآت
                </span>
              </TabsTrigger>
              <TabsTrigger
                value="profile"
                className="flex items-center gap-1"
              >
                <User className="w-4 h-4" />
                <span className="hidden lg:inline">
                  الملف الشخصي
                </span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">
                  مرحباً، {userData.name.split(" ")[0]}!
                </h2>
                <p className="text-muted-foreground">
                  إليك نظرة عامة على نشاطك البيئي اليوم
                </p>
              </div>
              <ActivityLogger />
            </div>
            <CarbonDashboard />
          </TabsContent>

          {/* Learning Center Tab */}
          <TabsContent value="learning">
            <EcoLearningCenter />
          </TabsContent>

          {/* Quiz Tab */}
          <TabsContent value="quiz">
            <EcoQuizzes userPoints={userData.points} />
          </TabsContent>

          {/* AI Recommendations Tab */}
          <TabsContent value="ai">
            <AIRecommendations userData={userData} />
          </TabsContent>

          {/* Interactive Map Tab */}
          <TabsContent value="map">
            <InteractiveMap />
          </TabsContent>

          {/* Green Store Tab */}
          <TabsContent value="store">
            <GreenStore userPoints={userData.points} />
          </TabsContent>

          {/* Statistics Tab */}
          <TabsContent value="stats">
            <CarbonStats />
          </TabsContent>

          {/* Rewards Tab */}
          <TabsContent value="rewards">
            <RewardsCenter />
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* User Information */}
              <Card className="p-6">
                <h3 className="font-semibold mb-4">
                  المعلومات الشخصية
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-center mb-6">
                    <Avatar className="w-24 h-24">
                      <AvatarImage
                        src={
                          profile?.avatar_url ||
                          "/api/placeholder/96/96"
                        }
                      />
                      <AvatarFallback className="text-2xl">
                        {userData.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-muted-foreground">
                        البريد الإلكتروني
                      </label>
                      <p className="font-medium">
                        {user?.email}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">
                        نوع المستخدم
                      </label>
                      <Badge variant="outline" className="mt-1">
                        {userData.type === "student" ? (
                          <div className="flex items-center gap-2">
                            <GraduationCap className="w-4 h-4" />
                            طالب
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Briefcase className="w-4 h-4" />
                            موظف
                          </div>
                        )}
                      </Badge>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">
                        الاسم
                      </label>
                      <p className="font-medium">
                        {userData.name}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">
                        {userData.type === "student"
                          ? "الرقم الجامعي"
                          : "الرقم الوظيفي"}
                      </label>
                      <p className="font-medium">
                        {userData.id}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">
                        {userData.type === "student"
                          ? "التخصص"
                          : "القسم"}
                      </label>
                      <p className="font-medium">
                        {userData.department}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">
                        المستوى البيئي
                      </label>
                      <Badge className="bg-green-600">
                        {userData.level}
                      </Badge>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Environmental Goals */}
              <Card className="p-6">
                <h3 className="font-semibold mb-4">
                  الأهداف البيئية
                </h3>
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-medium text-green-800 mb-2">
                      الهدف الحالي
                    </h4>
                    <p className="text-sm text-green-700">
                      تقليل البصمة الكربونية بنسبة 20% هذا الشهر
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-muted-foreground">
                        النقاط المجمعة
                      </label>
                      <p className="text-2xl font-bold text-green-600">
                        {userData.points}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">
                        الترتيب العام
                      </label>
                      <p className="font-semibold">
                        #24 من أصل{" "}
                        {userData.type === "student"
                          ? "450 طالب"
                          : "125 موظف"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t">
                  <Button variant="outline" className="w-full">
                    <Settings className="w-4 h-4 ml-2" />
                    إعدادات الحساب
                  </Button>
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Mobile Bottom Navigation (if needed) */}
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
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex flex-col items-center justify-center gap-1 transition-colors ${
                activeTab === id
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
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
'use client';

import { useEffect, useState } from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Leaf, 
  Car, 
  Zap, 
  Trash2, 
  Award, 
  TrendingDown, 
  Target,
  Calendar,
  Trophy,
  CheckCircle
} from 'lucide-react';
import { supabase } from "../lib/supabase";
import { useAuth } from '../hooks/useAuth';
import ActivityLogger from './ActivityLogger';
import QRScanner from './QRScanner';
import { toast } from "sonner";

const PAGE_LIMIT = 10;

interface Activity {
  id: string;
  kind: 'transport' | 'energy' | 'waste' | 'food';
  description: string;
  carbon_saved_kg: number;
  points_earned: number;
  created_at: string;
}

interface CarbonData {
    daily_co2: number;
    weekly_co2: number;
    monthly_co2: number;
    level: string;
    rank: number;
    total_carbon_saved_kg: number;
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  due_date: string;
  points_reward: number;
  is_completed: boolean;
}

export default function CarbonDashboard() {
  const { user } = useAuth();
  const [summary,setSummary] = useState<CarbonData | null>(null);
  const [activities,setActivities] = useState<any[]>([]);
  const [points,setPoints] = useState<number>(0);
  const [todayKg, setTodayKg] = useState(0);
  const [weekKg, setWeekKg] = useState(0);
  const [monthKg, setMonthKg] = useState(0);
  const [challenges, setChallenges] = useState<Challenge[]>([]);

  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);

  const loadActivities = async () => {
    if(!user) return;
    const { data: a, error } = await supabase
      .from("activity_log")
      .select(`id, created_at, carbon_saved, points_earned, activity_catalog ( name, kind )`)
      .eq("user_id", user.id)
      .order("created_at", { ascending:false })
      .limit(PAGE_LIMIT);

    if (error) {
      console.error("Error loading activities:", error);
      setActivities([]);
      return;
    }
    
    const formattedActivities = a?.map(act => ({
      id: act.id,
      created_at: act.created_at,
      carbon_saved_kg: act.carbon_saved,
      points_earned: act.points_earned,
      description: act.activity_catalog.name,
      kind: act.activity_catalog.kind
    })) ?? [];
    
    setActivities(formattedActivities);
  };

  const loadDashboardSummary = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('user_rankings')
      .select(`
        rank,
        user_profiles ( points, level )
      `)
      .eq('user_id', user.id)
      .single();

    if (error) {
      console.error('Error fetching user summary:', error);
      return;
    }

    const profile = Array.isArray(data?.user_profiles) ? data.user_profiles[0] : data?.user_profiles;

    setPoints(profile?.points ?? 0);
    setSummary({
        ...(summary as CarbonData),
        level: profile?.level ?? '...',
        rank: data?.rank ?? 0,
    });
  };

  const loadChallenges = async () => {
    if (!user) return;

    const { data: challengesData, error: challengesError } = await supabase
      .from('challenges')
      .select('*');

    if (challengesError) {
      console.error('Error fetching challenges:', challengesError);
      return;
    }

    const { data: completedChallengesData, error: completedChallengesError } = await supabase
      .from('user_completed_challenges')
      .select('challenge_id')
      .eq('user_id', user.id);

    if (completedChallengesError) {
      console.error('Error fetching completed challenges:', completedChallengesError);
      return;
    }

    const completedChallengeIds = new Set(completedChallengesData?.map(c => c.challenge_id) ?? []);

    const formattedChallenges = challengesData?.map(c => ({
      ...c,
      is_completed: completedChallengeIds.has(c.id),
    })) ?? [];

    setChallenges(formattedChallenges);
  };

  async function totalCarbonSince(s: Date) {
    if (!user) return 0;
    const { data, error } = await supabase
      .from("activity_log")
      .select("carbon_saved")
      .eq("user_id", user.id)
      .gte("created_at", s.toISOString());
    if (error) {
      console.error(`Error calculating total carbon since ${s.toISOString()}:`, error);
      return 0;
    }
    return (data ?? []).reduce((t,x)=>t+Number(x.carbon_saved||0),0);
  }

  const reload = async () => {
    if (!user) return;
    await Promise.all([loadActivities(), loadDashboardSummary(), loadChallenges()]);

    const startOfDay = new Date(); startOfDay.setHours(0,0,0,0);
    const startOfWeek = new Date(); startOfWeek.setDate(startOfWeek.getDate()-startOfWeek.getDay()); startOfWeek.setHours(0,0,0,0);
    const startOfMonth = new Date(); startOfMonth.setDate(1); startOfMonth.setHours(0,0,0,0);

    totalCarbonSince(startOfDay).then(setTodayKg);
    totalCarbonSince(startOfWeek).then(setWeekKg);
    totalCarbonSince(startOfMonth).then(setMonthKg);
  };

  useEffect(() => {
    reload();
  }, [user]);

  const handleCompleteChallengeClick = (challenge: Challenge) => {
    setSelectedChallenge(challenge);
    setIsScannerOpen(true);
  };

  const handleScannerClose = () => {
    setIsScannerOpen(false);
    setSelectedChallenge(null);
  };

  const handleChallengeScanned = async (scannedData: string) => {
    handleScannerClose();
    if (!user || !selectedChallenge) {
      toast.error("حدث خطأ ما. حاول مرة أخرى.");
      return;
    }
    
    let parsedData;
    try {
      parsedData = JSON.parse(scannedData);
    } catch (e) {
      toast.error("رمز QR غير صالح أو تالف.");
      return;
    }

    if (parsedData.challenge_id != selectedChallenge.id) {
        toast.error(`رمز QR هذا لا يتطابق مع تحدي \"${selectedChallenge.title}\".`);
        return;
    }

    const { error } = await supabase.rpc('complete_challenge', { 
      p_challenge_id: selectedChallenge.id, 
      p_user_id: user.id 
    });

    if (error) {
      console.error("Error completing challenge:", error);
      toast.error("لم يتم إكمال التحدي. قد تكون أكملته بالفعل.");
    } else {
      toast.success(`تهانينا! لقد أكملت تحدي \"${selectedChallenge.title}\" وحصلت على ${selectedChallenge.points_reward} نقطة.`);
      await reload(); 
    }
  };
  
  const weeklyTarget = 35;
  const weeklyProgress = (weekKg / weeklyTarget) * 100;

  const getActivityIcon = (kind: Activity['kind']) => {
    switch (kind) {
      case 'transport': return <Car className="w-4 h-4" />;
      case 'energy': return <Zap className="w-4 h-4" />;
      case 'waste': return <Trash2 className="w-4 h-4" />;
      case 'food': return <Leaf className="w-4 h-4" />;
    }
  };

  const getActivityColor = (kind: Activity['kind']) => {
    switch (kind) {
      case 'transport': return 'bg-blue-100 text-blue-700';
      case 'energy': return 'bg-yellow-100 text-yellow-700';
      case 'waste': return 'bg-green-100 text-green-700';
      case 'food': return 'bg-orange-100 text-orange-700';
    }
  };
  
  const daysRemaining = (dueDate: string) => {
    if (!dueDate) return null;
    const due = new Date(dueDate);
    const today = new Date();
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return 'انتهى';
    return `${diffDays} أيام متبقية`;
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">المحفظة الكربونية</h1>
          <p className="text-muted-foreground">تتبع بصمتك الكربونية واربح النقاط</p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="secondary" className="text-lg px-4 py-2"><Trophy className="w-4 h-4 ml-2" />{points} نقطة</Badge>
          <Badge variant="outline" className="text-lg px-4 py-2">{summary?.level ?? '...'}</Badge>
        </div>
      </div>

       <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
         <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">اليوم</p>
              <p className="text-2xl font-bold">{todayKg.toFixed(1)} كجم CO₂</p>
            </div>
            <div className="p-2 bg-green-100 rounded-lg"><TrendingDown className="w-5 h-5 text-green-600" /></div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">هذا الأسبوع</p>
              <p className="text-2xl font-bold">{weekKg.toFixed(1)} كجم CO₂</p>
            </div>
            <div className="p-2 bg-blue-100 rounded-lg"><Calendar className="w-5 h-5 text-blue-600" /></div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">هذا الشهر</p>
              <p className="text-2xl font-bold">{monthKg.toFixed(1)} كجم CO₂</p>
            </div>
            <div className="p-2 bg-purple-100 rounded-lg"><Leaf className="w-5 h-5 text-purple-600" /></div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">الترتيب</p>
              <p className="text-2xl font-bold">#{summary?.rank ?? 0}</p>
            </div>
            <div className="p-2 bg-yellow-100 rounded-lg"><Award className="w-5 h-5 text-yellow-600" /></div>
          </div>
        </Card>
      </div>
      
       <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2"><Target className="w-5 h-5" /><h3 className="font-semibold">الهدف الأسبوعي</h3></div>
          <span className="text-sm text-muted-foreground">{weekKg.toFixed(1)} / {weeklyTarget} كجم CO₂</span>
        </div>
        <Progress value={weeklyProgress} className="h-3" />
        <p className="text-sm text-muted-foreground mt-2">{weeklyProgress > 100 ? 'تجاوزت هدفك!' : `${(weeklyTarget - weekKg).toFixed(1)} كجم متبقية للوصول للهدف`}</p>
      </Card>

      <Tabs defaultValue="activities" className="w-full">
        <TabsList className="grid w-full grid-cols-2"><TabsTrigger value="activities">الأنشطة الأخيرة</TabsTrigger><TabsTrigger value="challenges">التحديات</TabsTrigger></TabsList>

        <TabsContent value="activities" className="space-y-4">
           <Card className="p-4">
            <h3 className="font-semibold mb-4">أنشطة اليوم</h3>
            <div className="space-y-3">
              {activities.length === 0 ? (
                <p className="text-muted-foreground text-center">لم تسجل أي أنشطة بعد.</p>
              ) : (
                activities.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${getActivityColor(activity.kind)}`}>
                        {getActivityIcon(activity.kind)}
                      </div>
                      <div>
                        <p className="font-medium">{activity.description}</p>
                        <p className="text-sm text-muted-foreground">وفرت {activity.carbon_saved_kg.toFixed(2)} كجم CO₂</p>
                      </div>
                    </div>
                    <Badge variant="secondary">+{activity.points_earned} نقطة</Badge>
                  </div>
                ))
              )}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="challenges" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {challenges.map((challenge) => (
              <Card key={challenge.id} className={`p-4 ${challenge.is_completed ? 'bg-green-50' : ''}`}>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold">{challenge.title}</h4>
                  {challenge.is_completed ? (
                    <Badge className="bg-green-600 text-white"><CheckCircle className="w-4 h-4 ml-1" />مكتمل</Badge>
                  ) : (
                    <Badge variant="outline">{daysRemaining(challenge.due_date)}</Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mb-3">{challenge.description}</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-bold text-green-600">+{challenge.points_reward} نقطة</span>
                  {!challenge.is_completed && (
                    <Button size="sm" onClick={() => handleCompleteChallengeClick(challenge)}>
                      إكمال التحدي
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex gap-4">
         <ActivityLogger onSaved={reload} />
         <Button variant="outline" className="flex-1"><Award className="w-4 h-4 ml-2" />استبدل النقاط</Button>
      </div>

      {isScannerOpen && (
        <QRScanner 
            isOpen={isScannerOpen} 
            onClose={handleScannerClose} 
            onScanResult={handleChallengeScanned} 
        />
      )}
    </div>
  );
}

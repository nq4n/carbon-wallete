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
  Trophy
} from 'lucide-react';
import { supabase } from "../lib/supabase";
import { useAuth } from '../hooks/useAuth';
import ActivityLogger from './ActivityLogger';

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

export default function CarbonDashboard() {
  const { user } = useAuth();
  const [summary,setSummary] = useState<CarbonData | null>(null);
  const [activities,setActivities] = useState<any[]>([]);
  const [points,setPoints] = useState<number>(0);
  const [todayKg, setTodayKg] = useState(0);
  const [weekKg, setWeekKg] = useState(0);
  const [monthKg, setMonthKg] = useState(0);

  const loadSummary = async () => {
    if(!user) return;
    const { data: s } = await supabase
      .from("v_user_carbon_summary")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();
    setSummary(s);
  };

  const loadActivities = async () => {
    if(!user) return;
    const { data: a } = await supabase
      .from("activity_logs")
      .select("id,kind,description,carbon_saved_kg,points_earned,created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending:false })
      .limit(PAGE_LIMIT);
    setActivities(a ?? []);
  };

  const loadPoints = async () => {
    if(!user) return;
    const { data: p } = await supabase
      .from("user_profiles")
      .select("points")
      .eq("id", user.id)
      .maybeSingle();
    setPoints(p?.points ?? 0);
  };

  async function totalCarbonSince(s: Date) {
    if (!user) return 0;
    const { data, error } = await supabase
      .from("activity_logs")
      .select("carbon_saved_kg")
      .eq("user_id", user.id)
      .gte("created_at", s.toISOString());
    if (error) return 0;
    return (data ?? []).reduce((t,x)=>t+Number(x.carbon_saved_kg||0),0);
  }

  const reload = async () => {
    if (!user) return;
    await Promise.all([loadSummary(), loadActivities(), loadPoints()]);

    const startOfDay = new Date(); startOfDay.setHours(0,0,0,0);
    const startOfWeek = new Date(); startOfWeek.setDate(startOfWeek.getDate()-startOfWeek.getDay());
    const startOfMonth = new Date(); startOfMonth.setDate(1);

    totalCarbonSince(startOfDay).then(setTodayKg);
    totalCarbonSince(startOfWeek).then(setWeekKg);
    totalCarbonSince(startOfMonth).then(setMonthKg);
  };

  useEffect(() => {
    reload();
  }, [user]);

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

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">المحفظة الكربونية</h1>
          <p className="text-muted-foreground">تتبع بصمتك الكربونية واربح النقاط</p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="secondary" className="text-lg px-4 py-2">
            <Trophy className="w-4 h-4 ml-2" />
            {points} نقطة
          </Badge>
          <Badge variant="outline" className="text-lg px-4 py-2">
            {summary?.level ?? '...'}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">اليوم</p>
              <p className="text-2xl font-bold">{todayKg.toFixed(1)} كجم CO₂</p>
            </div>
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingDown className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">هذا الأسبوع</p>
              <p className="text-2xl font-bold">{weekKg.toFixed(1)} كجم CO₂</p>
            </div>
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">هذا الشهر</p>
              <p className="text-2xl font-bold">{monthKg.toFixed(1)} كجم CO₂</p>
            </div>
            <div className="p-2 bg-purple-100 rounded-lg">
              <Leaf className="w-5 h-5 text-purple-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">الترتيب</p>
              <p className="text-2xl font-bold">#{summary?.rank ?? 0}</p>
            </div>
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Award className="w-5 h-5 text-yellow-600" />
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            <h3 className="font-semibold">الهدف الأسبوعي</h3>
          </div>
          <span className="text-sm text-muted-foreground">
            {(summary?.total_carbon_saved_kg ?? 0).toFixed(1)} / {weeklyTarget} كجم CO₂
          </span>
        </div>
        <Progress value={weeklyProgress} className="h-3" />
        <p className="text-sm text-muted-foreground mt-2">
          {weeklyProgress > 100 ? 'تجاوزت هدفك!' : `${(weeklyTarget - (summary?.total_carbon_saved_kg ?? 0)).toFixed(1)} كجم متبقية للوصول للهدف`}
        </p>
      </Card>

      <Tabs defaultValue="activities" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="activities">الأنشطة الأخيرة</TabsTrigger>
          <TabsTrigger value="challenges">التحديات</TabsTrigger>
        </TabsList>

        <TabsContent value="activities" className="space-y-4">
          <Card className="p-4">
            <h3 className="font-semibold mb-4">أنشطة اليوم</h3>
            <div className="space-y-3">
              {activities.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${getActivityColor(activity.kind)}`}>
                      {getActivityIcon(activity.kind)}
                    </div>
                    <div>
                      <p className="font-medium">{activity.description}</p>
                      <p className="text-sm text-muted-foreground">
                        وفرت {activity.carbon_saved_kg} كجم CO₂
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary">+{activity.points_earned} نقطة</Badge>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="challenges" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold">تحدي الأسبوع</h4>
                <Badge variant="outline">7 أيام متبقية</Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                استخدم وسائل النقل المستدامة لمدة 5 أيام
              </p>
              <Progress value={60} className="h-2" />
              <p className="text-xs text-muted-foreground mt-2">3/5 أيام مكتملة</p>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold">تحدي إعادة التدوير</h4>
                <Badge variant="outline">3 أيام متبقية</Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                أعد تدوير 10 عبوات هذا الأسبوع
              </p>
              <Progress value={80} className="h-2" />
              <p className="text-xs text-muted-foreground mt-2">8/10 عبوات</p>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex gap-4">
        <ActivityLogger onSaved={reload} />
        <Button variant="outline" className="flex-1">
          <Award className="w-4 h-4 ml-2" />
          استبدل النقاط
        </Button>
      </div>
    </div>
  );
}

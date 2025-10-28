'use client';

import { useState } from 'react';
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

interface CarbonData {
  daily: number;
  weekly: number;
  monthly: number;
  points: number;
  level: string;
  rank: number;
}

interface Activity {
  id: string;
  type: 'transport' | 'energy' | 'waste' | 'food';
  description: string;
  carbonSaved: number;
  pointsEarned: number;
  date: string;
}

export default function CarbonDashboard() {
  const [carbonData] = useState<CarbonData>({
    daily: 4.2,
    weekly: 28.5,
    monthly: 120.8,
    points: 1250,
    level: 'صديق البيئة',
    rank: 24
  });

  const [activities] = useState<Activity[]>([
    {
      id: '1',
      type: 'transport',
      description: 'استخدام الحافلة الجامعية بدلاً من السيارة',
      carbonSaved: 2.1,
      pointsEarned: 15,
      date: '2024-01-15'
    },
    {
      id: '2',
      type: 'energy',
      description: 'إطفاء الأنوار في القاعة الدراسية',
      carbonSaved: 0.5,
      pointsEarned: 8,
      date: '2024-01-15'
    },
    {
      id: '3',
      type: 'waste',
      description: 'إعادة تدوير 5 زجاجات بلاستيكية',
      carbonSaved: 1.2,
      pointsEarned: 12,
      date: '2024-01-14'
    }
  ]);

  const weeklyTarget = 35;
  const weeklyProgress = (carbonData.weekly / weeklyTarget) * 100;

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'transport': return <Car className="w-4 h-4" />;
      case 'energy': return <Zap className="w-4 h-4" />;
      case 'waste': return <Trash2 className="w-4 h-4" />;
      case 'food': return <Leaf className="w-4 h-4" />;
    }
  };

  const getActivityColor = (type: Activity['type']) => {
    switch (type) {
      case 'transport': return 'bg-blue-100 text-blue-700';
      case 'energy': return 'bg-yellow-100 text-yellow-700';
      case 'waste': return 'bg-green-100 text-green-700';
      case 'food': return 'bg-orange-100 text-orange-700';
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header with Points and Level */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">المحفظة الكربونية</h1>
          <p className="text-muted-foreground">تتبع بصمتك الكربونية واربح النقاط</p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="secondary" className="text-lg px-4 py-2">
            <Trophy className="w-4 h-4 ml-2" />
            {carbonData.points} نقطة
          </Badge>
          <Badge variant="outline" className="text-lg px-4 py-2">
            {carbonData.level}
          </Badge>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">اليوم</p>
              <p className="text-2xl font-bold">{carbonData.daily} كجم CO₂</p>
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
              <p className="text-2xl font-bold">{carbonData.weekly} كجم CO₂</p>
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
              <p className="text-2xl font-bold">{carbonData.monthly} كجم CO₂</p>
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
              <p className="text-2xl font-bold">#{carbonData.rank}</p>
            </div>
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Award className="w-5 h-5 text-yellow-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Weekly Progress */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            <h3 className="font-semibold">الهدف الأسبوعي</h3>
          </div>
          <span className="text-sm text-muted-foreground">
            {carbonData.weekly} / {weeklyTarget} كجم CO₂
          </span>
        </div>
        <Progress value={weeklyProgress} className="h-3" />
        <p className="text-sm text-muted-foreground mt-2">
          {weeklyProgress > 100 ? 'تجاوزت هدفك!' : `${(weeklyTarget - carbonData.weekly).toFixed(1)} كجم متبقية للوصول للهدف`}
        </p>
      </Card>

      {/* Tabs for Activities and Statistics */}
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
                    <div className={`p-2 rounded-full ${getActivityColor(activity.type)}`}>
                      {getActivityIcon(activity.type)}
                    </div>
                    <div>
                      <p className="font-medium">{activity.description}</p>
                      <p className="text-sm text-muted-foreground">
                        وفرت {activity.carbonSaved} كجم CO₂
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary">+{activity.pointsEarned} نقطة</Badge>
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

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button className="flex-1">
          <Leaf className="w-4 h-4 ml-2" />
          سجل نشاط جديد
        </Button>
        <Button variant="outline" className="flex-1">
          <Award className="w-4 h-4 ml-2" />
          استبدل النقاط
        </Button>
      </div>
    </div>
  );
}
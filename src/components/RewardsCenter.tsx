'use client';

import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from './ui/dialog';
import { supabase } from '../lib/supabase';
import { useAuthContext } from './auth/AuthProvider';
import { toast } from "sonner";
import {
  Gift,
  Award,
  Trophy,
  Star,
  Coffee,
  Book,
  ShoppingBag,
  Leaf,
  CheckCircle,
  Lock,
  Coins,
  Loader2
} from 'lucide-react';

interface Reward {
  id: string;
  title: string;
  description: string;
  points_cost: number;
  category: 'food' | 'academic' | 'merchandise' | 'experiences';
  available: boolean;
  image?: string;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon_name: string;
  completed: boolean;
  progress?: number;
  target_value?: number;
  points_reward: number;
}

// Map icon names to Lucide components
const iconMap: { [key: string]: React.ElementType } = {
  Leaf,
  Star,
  Trophy,
  Award,
};

export default function RewardsCenter() {
  const { user, profile, loading: authLoading } = useAuthContext();
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [userPoints, setUserPoints] = useState(0);

  useEffect(() => {
    if (!authLoading && user && profile) {
      setUserPoints(profile.points);
      fetchData();
    }
  }, [authLoading, user, profile]);

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    
    // Fetch Rewards
    const { data: rewardsData, error: rewardsError } = await supabase
      .from('rewards')
      .select('*');
    if (rewardsError) toast.error('Failed to load rewards.');
    else setRewards(rewardsData || []);

    // Fetch Achievements & User Progress
    const { data: achievementsData, error: achievementsError } = await supabase
      .from('achievements')
      .select('*, user_achievements!left(user_id, progress, completed_at)');

    if (achievementsError) {
      toast.error('Failed to load achievements.');
    } else {
      const formattedAchievements = achievementsData.map(a => {
        const userAchievement = a.user_achievements[0];
        return {
          id: a.id,
          title: a.title,
          description: a.description,
          icon_name: a.icon_name,
          points_reward: a.points_reward,
          target_value: a.target_value,
          progress: userAchievement?.progress ?? 0,
          completed: !!userAchievement?.completed_at,
        };
      });
      setAchievements(formattedAchievements);
    }

    setLoading(false);
  };

  const handleRedeem = async (reward: Reward) => {
    if (!user || !profile) {
      toast.error("You must be logged in to redeem rewards.");
      return;
    }
    if (userPoints < reward.points_cost) {
      toast.error("Not enough points.");
      return;
    }

    // Deduct points
    const newPoints = userPoints - reward.points_cost;
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({ points: newPoints })
      .eq('id', user.id);

    if (updateError) {
      toast.error("Failed to redeem reward. Please try again.");
    } else {
      setUserPoints(newPoints);
      toast.success(`Successfully redeemed "${reward.title}"!`);
      // Optionally, log the redemption activity
    }
  };

  const getCategoryIcon = (category: Reward['category']) => {
    switch (category) {
      case 'food': return <Coffee className="w-5 h-5" />;
      case 'academic': return <Book className="w-5 h-5" />;
      case 'merchandise': return <ShoppingBag className="w-5 h-5" />;
      case 'experiences': return <Gift className="w-5 h-5" />;
    }
  };
  
  const getCategoryColor = (category: Reward['category']) => {
    switch (category) {
      case 'food': return 'bg-orange-100 text-orange-700';
      case 'academic': return 'bg-blue-100 text-blue-700';
      case 'merchandise': return 'bg-green-100 text-green-700';
      case 'experiences': return 'bg-purple-100 text-purple-700';
    }
  };

  if (loading || authLoading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="w-12 h-12 animate-spin" /></div>;
  }

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">مركز المكافآت</h2>
          <p className="text-muted-foreground">استبدل نقاطك واحصل على مكافآت رائعة</p>
        </div>
        <Card className="p-4"><div className="flex items-center gap-3">
          <div className="p-2 bg-yellow-100 rounded-full"><Coins className="w-5 h-5 text-yellow-600" /></div>
          <div>
            <p className="text-sm text-muted-foreground">رصيدك الحالي</p>
            <p className="text-xl font-bold">{userPoints.toLocaleString()} نقطة</p>
          </div>
        </div></Card>
      </div>

      <Tabs defaultValue="rewards" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="rewards">المكافآت</TabsTrigger>
          <TabsTrigger value="achievements">الإنجازات</TabsTrigger>
        </TabsList>

        <TabsContent value="rewards" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rewards.map((reward) => {
            const canAfford = userPoints >= reward.points_cost;
            return (
              <Card key={reward.id} className={`p-4 flex flex-col justify-between transition-all ${!reward.available || !canAfford ? 'opacity-60' : 'hover:shadow-lg'}`}>
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div className={`p-2 rounded-lg ${getCategoryColor(reward.category)}`}>{getCategoryIcon(reward.category)}</div>
                    <Badge variant="outline">{reward.category}</Badge>
                  </div>
                  <h4 className="font-semibold mb-2">{reward.title}</h4>
                  <p className="text-sm text-muted-foreground mb-4">{reward.description}</p>
                </div>
                <div className="flex items-center justify-between mt-auto">
                  <div className="flex items-center gap-2"><Coins className="w-4 h-4 text-yellow-500" /><span className="font-semibold">{reward.points_cost} نقطة</span></div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm" disabled={!reward.available || !canAfford}>
                        {!reward.available ? <Lock className="w-4 h-4 ml-1" /> : null}
                        {reward.available ? (canAfford ? 'استبدال' : 'نقاط غير كافية') : 'غير متاح'}
                      </Button>
                    </DialogTrigger>
                    <DialogContent dir="rtl">
                      <DialogHeader><DialogTitle>تأكيد الاستبدال</DialogTitle></DialogHeader>
                      <div className="space-y-4">
                         <p>هل أنت متأكد أنك تريد استبدال "{reward.title}" مقابل {reward.points_cost} نقطة؟</p>
                         <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                           <span>الرصيد بعد الاستبدال:</span>
                           <span className="font-semibold">{(userPoints - reward.points_cost).toLocaleString()} نقطة</span>
                         </div>
                         <div className="flex justify-end gap-3">
                          <DialogClose asChild><Button variant="outline">إلغاء</Button></DialogClose>
                           <DialogClose asChild><Button onClick={() => handleRedeem(reward)}>تأكيد</Button></DialogClose>
                         </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="achievements" className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {achievements.map((achievement) => {
            const IconComponent = iconMap[achievement.icon_name] || Award;
            const progressPercent = achievement.target_value ? (achievement.progress / achievement.target_value) * 100 : 0;
            return (
              <Card key={achievement.id} className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-2 rounded-lg ${achievement.completed ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}><IconComponent className="w-5 h-5" /></div>
                  {achievement.completed ? <Badge className="bg-green-600"><CheckCircle className="w-3 h-3 ml-1" />مكتمل</Badge> : <Badge variant="outline">قيد التقدم</Badge>}
                </div>
                <h4 className="font-semibold mb-2">{achievement.title}</h4>
                <p className="text-sm text-muted-foreground mb-4">{achievement.description}</p>
                {!achievement.completed && achievement.target_value && (
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm"><span>التقدم</span><span>{achievement.progress} / {achievement.target_value}</span></div>
                    <Progress value={progressPercent} className="h-2" />
                  </div>
                )}
                <div className="flex items-center justify-between"><div className="flex items-center gap-2"><Award className="w-4 h-4 text-yellow-600" /><span className="text-sm font-medium">+{achievement.points_reward} نقطة</span></div>
                  {achievement.completed && <CheckCircle className="w-5 h-5 text-green-600" />}</div>
              </Card>
            );
          })}
        </TabsContent>
      </Tabs>
    </div>
  );
}

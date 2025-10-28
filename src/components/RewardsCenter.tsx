'use client';

import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import {
  Gift,
  Award,
  Trophy,
  Star,
  Coffee,
  Book,
  ShoppingBag,
  Utensils,
  CheckCircle,
  Lock,
  Coins,
  Leaf
} from 'lucide-react';

interface Reward {
  id: string;
  title: string;
  description: string;
  pointsCost: number;
  category: 'food' | 'academic' | 'merchandise' | 'experiences';
  available: boolean;
  image?: string;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: any;
  completed: boolean;
  progress?: number;
  maxProgress?: number;
  pointsReward: number;
}

const rewards: Reward[] = [
  {
    id: '1',
    title: 'قهوة مجانية',
    description: 'مشروب مجاني من كافيتيريا الجامعة',
    pointsCost: 50,
    category: 'food',
    available: true
  },
  {
    id: '2',
    title: 'خصم 20% على الكتب',
    description: 'خصم على جميع الكتب من مكتبة الجامعة',
    pointsCost: 200,
    category: 'academic',
    available: true
  },
  {
    id: '3',
    title: 'حقيبة الجامعة البيئية',
    description: 'حقيبة مصنوعة من مواد معاد تدويرها',
    pointsCost: 500,
    category: 'merchandise',
    available: true
  },
  {
    id: '4',
    title: 'وجبة غداء صحية',
    description: 'وجبة عضوية من المطعم الصحي',
    pointsCost: 150,
    category: 'food',
    available: true
  },
  {
    id: '5',
    title: 'جولة بيئية خاصة',
    description: 'جولة في مرافق الجامعة المستدامة',
    pointsCost: 300,
    category: 'experiences',
    available: false
  }
];

const achievements: Achievement[] = [
  {
    id: '1',
    title: 'البداية الخضراء',
    description: 'سجل أول نشاط بيئي',
    icon: Leaf,
    completed: true,
    pointsReward: 25
  },
  {
    id: '2',
    title: 'صديق البيئة',
    description: 'احصل على 500 نقطة',
    icon: Star,
    completed: true,
    progress: 500,
    maxProgress: 500,
    pointsReward: 50
  },
  {
    id: '3',
    title: 'محارب الكربون',
    description: 'وفر 50 كجم من CO₂',
    icon: Trophy,
    completed: false,
    progress: 32,
    maxProgress: 50,
    pointsReward: 100
  },
  {
    id: '4',
    title: 'الأسبوع المثالي',
    description: 'حقق الهدف الأسبوعي 4 أسابيع متتالية',
    icon: Award,
    completed: false,
    progress: 2,
    maxProgress: 4,
    pointsReward: 150
  }
];

export default function RewardsCenter() {
  const [userPoints] = useState(1250);
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);

  const getCategoryIcon = (category: Reward['category']) => {
    switch (category) {
      case 'food': return <Coffee className="w-5 h-5" />;
      case 'academic': return <Book className="w-5 h-5" />;
      case 'merchandise': return <ShoppingBag className="w-5 h-5" />;
      case 'experiences': return <Gift className="w-5 h-5" />;
    }
  };

  const getCategoryName = (category: Reward['category']) => {
    switch (category) {
      case 'food': return 'طعام ومشروبات';
      case 'academic': return 'أكاديمي';
      case 'merchandise': return 'منتجات';
      case 'experiences': return 'تجارب';
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

  const canAffordReward = (pointsCost: number) => userPoints >= pointsCost;

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header with Points Balance */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">مركز المكافآت</h2>
          <p className="text-muted-foreground">استبدل نقاطك واحصل على مكافآت رائعة</p>
        </div>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-full">
              <Coins className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">رصيدك الحالي</p>
              <p className="text-xl font-bold">{userPoints.toLocaleString()} نقطة</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs for Rewards and Achievements */}
      <Tabs defaultValue="rewards" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="rewards">المكافآت</TabsTrigger>
          <TabsTrigger value="achievements">الإنجازات</TabsTrigger>
        </TabsList>

        <TabsContent value="rewards" className="space-y-6">
          {/* Rewards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rewards.map((reward) => {
              const canAfford = canAffordReward(reward.pointsCost);
              
              return (
                <Card 
                  key={reward.id} 
                  className={`p-4 transition-all duration-200 ${
                    !reward.available ? 'opacity-60' : 
                    !canAfford ? 'opacity-75' : 'hover:shadow-md'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className={`p-2 rounded-lg ${getCategoryColor(reward.category)}`}>
                      {getCategoryIcon(reward.category)}
                    </div>
                    <Badge variant="outline">
                      {getCategoryName(reward.category)}
                    </Badge>
                  </div>
                  
                  <h4 className="font-semibold mb-2">{reward.title}</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    {reward.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Coins className="w-4 h-4 text-yellow-600" />
                      <span className="font-semibold">{reward.pointsCost} نقطة</span>
                    </div>
                    
                    {!reward.available ? (
                      <Button variant="outline" size="sm" disabled>
                        <Lock className="w-4 h-4 ml-2" />
                        غير متاح
                      </Button>
                    ) : !canAfford ? (
                      <Button variant="outline" size="sm" disabled>
                        نقاط غير كافية
                      </Button>
                    ) : (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" onClick={() => setSelectedReward(reward)}>
                            استبدال
                          </Button>
                        </DialogTrigger>
                        <DialogContent dir="rtl">
                          <DialogHeader>
                            <DialogTitle>تأكيد الاستبدال</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="text-center">
                              <div className={`inline-flex p-4 rounded-lg ${getCategoryColor(reward.category)} mb-4`}>
                                {getCategoryIcon(reward.category)}
                              </div>
                              <h3 className="font-semibold text-lg mb-2">{reward.title}</h3>
                              <p className="text-muted-foreground mb-4">{reward.description}</p>
                            </div>
                            
                            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                              <span>التكلفة:</span>
                              <div className="flex items-center gap-2">
                                <Coins className="w-4 h-4 text-yellow-600" />
                                <span className="font-semibold">{reward.pointsCost} نقطة</span>
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                              <span>الرصيد بعد الاستبدال:</span>
                              <span className="font-semibold">
                                {(userPoints - reward.pointsCost).toLocaleString()} نقطة
                              </span>
                            </div>
                            
                            <div className="flex gap-3">
                              <Button className="flex-1">تأكيد الاستبدال</Button>
                              <Button variant="outline" className="flex-1">إلغاء</Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-6">
          {/* Achievements Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {achievements.map((achievement) => {
              const IconComponent = achievement.icon;
              
              return (
                <Card key={achievement.id} className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`p-2 rounded-lg ${
                      achievement.completed ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      <IconComponent className="w-5 h-5" />
                    </div>
                    {achievement.completed ? (
                      <Badge className="bg-green-600">
                        <CheckCircle className="w-3 h-3 ml-1" />
                        مكتمل
                      </Badge>
                    ) : (
                      <Badge variant="outline">
                        قيد التقدم
                      </Badge>
                    )}
                  </div>
                  
                  <h4 className="font-semibold mb-2">{achievement.title}</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    {achievement.description}
                  </p>
                  
                  {achievement.progress !== undefined && achievement.maxProgress && (
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span>التقدم</span>
                        <span>{achievement.progress} / {achievement.maxProgress}</span>
                      </div>
                      <Progress 
                        value={(achievement.progress / achievement.maxProgress) * 100} 
                        className="h-2"
                      />
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-yellow-600" />
                      <span className="text-sm font-medium">+{achievement.pointsReward} نقطة</span>
                    </div>
                    {achievement.completed && (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
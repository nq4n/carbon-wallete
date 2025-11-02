'use client';

import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import {
  Lightbulb,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Sparkles,
  Target,
  BarChart3,
  Zap,
  Recycle,
  Car,
  Printer,
  Coffee,
  ArrowRight,
  ThumbsUp,
  ThumbsDown,
  Calendar,
  Award
} from 'lucide-react';
import { toast } from 'sonner';

interface UserData {
  name: string;
  id: string;
  department: string;
  level: string;
  points: number;
  type: string;
}

interface Recommendation {
  id: number;
  title: string;
  description: string;
  category: 'energy' | 'waste' | 'transport' | 'printing' | 'general';
  priority: 'high' | 'medium' | 'low';
  impact: 'high' | 'medium' | 'low';
  points: number;
  actionRequired: string;
  deadline?: string;
  status: 'new' | 'accepted' | 'rejected' | 'completed';
  data: {
    current: number;
    target: number;
    unit: string;
    trend: 'up' | 'down' | 'stable';
  };
}

interface AIRecommendationsProps {
  userData: UserData;
  /** Toggle the "Coming Soon" overlay */
  disabled?: boolean;
}

export default function AIRecommendations({ userData, disabled = true }: AIRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  useEffect(() => {
    generateRecommendations();
  }, [userData]);

  const generateRecommendations = () => {
    setIsLoading(true);
    setTimeout(() => {
      const generatedRecommendations: Recommendation[] = [
        {
          id: 1,
          title: 'تقليل استهلاك الطباعة',
          description: 'لاحظت زيادة في استهلاكك للطباعة بنسبة 35% هذا الشهر مقارنة بالشهر الماضي. ننصحك بالتحول للنسخ الرقمية.',
          category: 'printing',
          priority: 'high',
          impact: 'high',
          points: 25,
          actionRequired: 'استخدم النسخ الإلكترونية للمحاضرات والمراجع',
          deadline: '2024-01-15',
          status: 'new',
          data: { current: 450, target: 300, unit: 'ورقة', trend: 'up' }
        },
        {
          id: 2,
          title: 'تحسين عادات النقل',
          description: 'يمكنك توفير 40% من انبعاثات الكربون عبر استخدام الحافلة الجامعية أو الدراجة 3 أيام إضافية في الأسبوع.',
          category: 'transport',
          priority: 'medium',
          impact: 'high',
          points: 30,
          actionRequired: 'خطط لاستخدام النقل المستدام أكثر',
          status: 'new',
          data: { current: 2, target: 5, unit: 'أيام/أسبوع', trend: 'stable' }
        },
        {
          id: 3,
          title: 'تحسين كفاءة الطاقة',
          description: 'تستهلك أجهزتك الإلكترونية طاقة أكثر من المتوسط. إطفاء الأجهزة بالكامل يمكن أن يوفر 20% من الاستهلاك.',
          category: 'energy',
          priority: 'medium',
          impact: 'medium',
          points: 20,
          actionRequired: 'اطفئ الأجهزة بالكامل بدلاً من وضع الاستعداد',
          status: 'accepted',
          data: { current: 8.5, target: 6.8, unit: 'كيلووات/يوم', trend: 'down' }
        },
        {
          id: 4,
          title: 'تحسين إدارة النفايات',
          description: 'نسبة إعادة التدوير لديك منخفضة. يمكن تحسينها عبر فصل النفايات بشكل أفضل.',
          category: 'waste',
          priority: 'low',
          impact: 'medium',
          points: 15,
          actionRequired: 'استخدم صناديق إعادة التدوير المخصصة',
          status: 'completed',
          data: { current: 35, target: 60, unit: '%', trend: 'stable' }
        },
        {
          id: 5,
          title: 'تقليل شراء القهوة بالأكواب البلاستيكية',
          description: 'تشتري 15 كوب قهوة شهرياً بأكواب يمكن التخلص منها. استخدام كوب قابل لإعادة الاستخدام سيوفر النفايات.',
          category: 'waste',
          priority: 'low',
          impact: 'low',
          points: 10,
          actionRequired: 'احضر كوبك الشخصي للكافيتيريا',
          status: 'new',
          data: { current: 15, target: 3, unit: 'كوب/شهر', trend: 'up' }
        }
      ];
      setRecommendations(generatedRecommendations);
      setIsLoading(false);
    }, 2000);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'energy': return <Zap className="w-5 h-5 text-yellow-600" />;
      case 'waste': return <Recycle className="w-5 h-5 text-green-600" />;
      case 'transport': return <Car className="w-5 h-5 text-blue-600" />;
      case 'printing': return <Printer className="w-5 h-5 text-purple-600" />;
      default: return <Lightbulb className="w-5 h-5 text-orange-600" />;
    }
  };

  const getCategoryName = (category: string) => {
    switch (category) {
      case 'energy': return 'الطاقة';
      case 'waste': return 'النفايات';
      case 'transport': return 'النقل';
      case 'printing': return 'الطباعة';
      default: return 'عام';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'rejected': return <XCircle className="w-4 h-4 text-red-600" />;
      case 'completed': return <Award className="w-4 h-4 text-purple-600" />;
      default: return <Sparkles className="w-4 h-4 text-blue-600" />;
    }
  };

  const updateRecommendationStatus = (id: number, status: 'accepted' | 'rejected') => {
    setRecommendations(prev => prev.map(rec => (rec.id === id ? { ...rec, status } : rec)));
    const recommendation = recommendations.find(r => r.id === id);
    if (status === 'accepted') {
      toast.success(`تم قبول التوصية! ستحصل على ${recommendation?.points} نقطة عند التنفيذ`);
    } else {
      toast.info('تم رفض التوصية');
    }
  };

  const markAsCompleted = (id: number) => {
    setRecommendations(prev => prev.map(rec => (rec.id === id ? { ...rec, status: 'completed' } : rec)));
    const recommendation = recommendations.find(r => r.id === id);
    toast.success(`مبروك! حصلت على ${recommendation?.points} نقطة`);
  };

  const filteredRecommendations = recommendations.filter(rec => {
    if (selectedFilter === 'all') return true;
    return rec.status === selectedFilter;
  });

  const stats = {
    total: recommendations.length,
    new: recommendations.filter(r => r.status === 'new').length,
    accepted: recommendations.filter(r => r.status === 'accepted').length,
    completed: recommendations.filter(r => r.status === 'completed').length,
    totalPoints: recommendations.filter(r => r.status === 'completed').reduce((sum, r) => sum + r.points, 0)
  };

  return (
    <section dir="rtl" className="max-w-7xl mx-auto">
      {/* Isolated wrapper to guarantee overlay covers the whole section */}
      <div className="relative isolate z-0 rounded-xl overflow-hidden">
        {/* ===== Inner content (dim & non-interactive when disabled) ===== */}
        <div className={['space-y-6 p-2 sm:p-4 lg:p-6', disabled ? 'opacity-40 pointer-events-none select-none' : ''].join(' ')}>
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-blue-600" />
                المساعد البيئي الذكي
              </h2>
              <p className="text-muted-foreground">توصيات مخصصة لتحسين بصمتك البيئية</p>
            </div>
            <Button onClick={generateRecommendations} disabled={isLoading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              تحديث التوصيات
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-600" />
                <div>
                  <div className="text-2xl font-bold">{stats.new}</div>
                  <div className="text-sm text-muted-foreground">توصية جديدة</div>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div>
                  <div className="text-2xl font-bold">{stats.accepted}</div>
                  <div className="text-sm text-muted-foreground">قيد التنفيذ</div>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-purple-600" />
                <div>
                  <div className="text-2xl font-bold">{stats.completed}</div>
                  <div className="text-sm text-muted-foreground">مكتملة</div>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-orange-600" />
                <div>
                  <div className="text-2xl font-bold">{stats.totalPoints}</div>
                  <div className="text-sm text-muted-foreground">نقطة مكتسبة</div>
                </div>
              </div>
            </Card>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 border-b">
            {[
              { key: 'all', label: 'جميع التوصيات', count: stats.total },
              { key: 'new', label: 'جديدة', count: stats.new },
              { key: 'accepted', label: 'قيد التنفيذ', count: stats.accepted },
              { key: 'completed', label: 'مكتملة', count: stats.completed }
            ].map(({ key, label, count }) => (
              <Button
                key={key}
                variant={selectedFilter === key ? 'default' : 'ghost'}
                onClick={() => setSelectedFilter(key)}
                className="relative"
              >
                {label}
                <Badge variant="secondary" className="ml-2">{count}</Badge>
              </Button>
            ))}
          </div>

          {/* Loading */}
          {isLoading && (
            <Card className="p-8">
              <div className="text-center space-y-4">
                <div className="animate-spin mx-auto w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
                <div>
                  <h3 className="font-semibold">جارٍ تحليل بياناتك...</h3>
                  <p className="text-muted-foreground">نحن نحلل أنشطتك البيئية لتقديم توصيات مخصصة</p>
                </div>
              </div>
            </Card>
          )}

          {/* Recommendations */}
          {!isLoading && (
            <div className="space-y-4">
              {filteredRecommendations.map((recommendation) => (
                <Card key={recommendation.id} className="overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">{getCategoryIcon(recommendation.category)}</div>

                      <div className="flex-1 space-y-4">
                        {/* Header */}
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">{recommendation.title}</h3>
                              {getStatusIcon(recommendation.status)}
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{getCategoryName(recommendation.category)}</Badge>
                              <Badge className={getPriorityColor(recommendation.priority)}>
                                {recommendation.priority === 'high' && 'أولوية عالية'}
                                {recommendation.priority === 'medium' && 'أولوية متوسطة'}
                                {recommendation.priority === 'low' && 'أولوية منخفضة'}
                              </Badge>
                              <Badge variant="outline">
                                <Sparkles className="w-3 h-3 mr-1" />
                                {recommendation.points} نقطة
                              </Badge>
                            </div>
                          </div>

                          {recommendation.deadline && (
                            <div className="text-sm text-muted-foreground flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {recommendation.deadline}
                            </div>
                          )}
                        </div>

                        {/* Description */}
                        <p className="text-muted-foreground">{recommendation.description}</p>

                        {/* Data Visualization */}
                        <div className="bg-accent rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">الوضع الحالي vs الهدف</span>
                            <div className="flex items-center gap-1">
                              <TrendingUp
                                className={`w-4 h-4 ${
                                  recommendation.data.trend === 'up'
                                    ? 'text-red-500'
                                    : recommendation.data.trend === 'down'
                                    ? 'text-green-500'
                                    : 'text-gray-500'
                                }`}
                              />
                              <span className="text-sm text-muted-foreground">
                                {recommendation.data.trend === 'up'
                                  ? 'متزايد'
                                  : recommendation.data.trend === 'down'
                                  ? 'متناقص'
                                  : 'مستقر'}
                              </span>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <div className="text-sm text-muted-foreground">الحالي</div>
                              <div className="text-xl font-bold">
                                {recommendation.data.current} {recommendation.data.unit}
                              </div>
                            </div>
                            <div>
                              <div className="text-sm text-muted-foreground">الهدف</div>
                              <div className="text-xl font-bold text-green-600">
                                {recommendation.data.target} {recommendation.data.unit}
                              </div>
                            </div>
                          </div>

                          <Progress
                            value={
                              recommendation.data.current > 0
                                ? (recommendation.data.target / recommendation.data.current) * 100
                                : 0
                            }
                            className="mt-3 h-2"
                          />
                        </div>

                        {/* Action */}
                        <div className="bg-blue-50 rounded-lg p-4">
                          <h4 className="font-medium text-blue-800 mb-1">الإجراء المطلوب:</h4>
                          <p className="text-sm text-blue-700">{recommendation.actionRequired}</p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2">
                          {recommendation.status === 'new' && (
                            <>
                              <Button
                                onClick={() => updateRecommendationStatus(recommendation.id, 'accepted')}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <ThumbsUp className="w-4 h-4 mr-2" />
                                قبول التوصية
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() => updateRecommendationStatus(recommendation.id, 'rejected')}
                              >
                                <ThumbsDown className="w-4 h-4 mr-2" />
                                رفض
                              </Button>
                            </>
                          )}

                          {recommendation.status === 'accepted' && (
                            <Button onClick={() => markAsCompleted(recommendation.id)}>
                              <CheckCircle className="w-4 h-4 mr-2" />
                              تم التنفيذ
                            </Button>
                          )}

                          {recommendation.status === 'completed' && (
                            <Button disabled variant="outline">
                              <Award className="w-4 h-4 mr-2" />
                              مكتملة
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {filteredRecommendations.length === 0 && !isLoading && (
            <Card className="p-8">
              <div className="text-center space-y-3">
                <Lightbulb className="w-12 h-12 text-muted-foreground mx-auto" />
                <h3 className="font-semibold">لا توجد توصيات</h3>
                <p className="text-muted-foreground">لا توجد توصيات في هذه الفئة حالياً</p>
              </div>
            </Card>
          )}
        </div>

        {/* ===== Overlay when disabled ===== */}
        {disabled && (
          <>
            <div className="pointer-events-none absolute inset-0 z-[90] bg-background/85 backdrop-blur-sm" aria-hidden="true" />
            <div className="absolute inset-0 z-[100] flex items-center justify-center p-4">
              <Card className="pointer-events-auto p-8 text-center bg-background/95 shadow-lg">
                <Lightbulb className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">✨ قريباً! ✨</h3>
                <p className="text-muted-foreground leading-relaxed">
                  نحن حالياً نعمل على تطوير هذا القسم.
                  <br />
                  انتظر النسخة القادمة!
                </p>
              </Card>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

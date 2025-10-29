'use client';

import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import {
  TrendingDown,
  Calendar,
  Users,
  Download,
  Share2,
  Loader2
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';

const categoryColors: { [key: string]: string } = {
  transport: '#3b82f6',
  energy: '#eab308',
  waste: '#22c55e',
  food: '#f97316',
  other: '#64748b'
};

export default function CarbonStats() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [comparisonData, setComparisonData] = useState<any[]>([]);
  const [keyInsights, setKeyInsights] = useState<any>({});

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      setLoading(true);

      // 1. Fetch all activity logs for the user
      const { data: logs, error } = await supabase
        .from('activity_logs')
        .select('created_at, carbon_saved_kg, points_earned, kind')
        .eq('user_id', user.id);

      if (error || !logs) {
        setLoading(false);
        return;
      }

      const now = new Date();

      // 2. Process Weekly Data
      const last7Days = Array(7).fill(0).map((_, i) => {
        const d = new Date();
        d.setDate(now.getDate() - i);
        return d.toISOString().split('T')[0];
      }).reverse();

      const processedWeeklyData = last7Days.map(day => {
        const dayLogs = logs.filter(log => log.created_at.startsWith(day));
        const totalCarbon = dayLogs.reduce((sum, log) => sum + log.carbon_saved_kg, 0);
        return { day: new Date(day).toLocaleDateString('ar-SA', { weekday: 'short' }), carbon: totalCarbon, target: 5.0 };
      });
      setWeeklyData(processedWeeklyData);

      // 3. Process Monthly Data
      const last6Months = Array(6).fill(0).map((_, i) => {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        return { month: d.toLocaleString('ar-SA', { month: 'long' }), year: d.getFullYear() };
      }).reverse();

      const processedMonthlyData = last6Months.map(m => {
        const monthLogs = logs.filter(log => {
          const logDate = new Date(log.created_at);
          return logDate.getFullYear() === m.year && logDate.toLocaleString('ar-SA', { month: 'long' }) === m.month;
        });
        const totalCarbon = monthLogs.reduce((sum, log) => sum + log.carbon_saved_kg, 0);
        const totalPoints = monthLogs.reduce((sum, log) => sum + log.points_earned, 0);
        return { month: m.month, carbon: totalCarbon, points: totalPoints };
      });
      setMonthlyData(processedMonthlyData);

      // 4. Process Category Data
      const categoryMap: { [key: string]: number } = {};
      let totalCarbonSaved = 0;
      logs.forEach(log => {
        categoryMap[log.kind] = (categoryMap[log.kind] || 0) + log.carbon_saved_kg;
        totalCarbonSaved += log.carbon_saved_kg;
      });
      const processedCategoryData = Object.entries(categoryMap).map(([name, value]) => ({
        name,
        value: (value / totalCarbonSaved) * 100, // as percentage
        absolute_value: value,
        color: categoryColors[name] || '#64748b'
      }));
      setCategoryData(processedCategoryData);

      // 5. Key Insights & Comparison (using a backend function for efficiency)
      const { data: insights, error: insightsError } = await supabase.rpc('get_user_stats', { p_user_id: user.id });
      if (insights) {
        setKeyInsights(insights);
        setComparisonData([
          { category: 'أنت', carbon: insights.user_total, color: '#3b82f6' },
          { category: 'متوسط القسم', carbon: insights.department_avg, color: '#64748b' },
          { category: 'متوسط الجامعة', carbon: insights.university_avg, color: '#94a3b8' },
        ]);
      } 

      setLoading(false);
    };

    fetchData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="mr-4 text-lg">جارِ تحميل الإحصائيات...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">الإحصائيات والتقارير</h2>
          <p className="text-muted-foreground">تحليل مفصل لبصمتك الكربونية</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm"><Download className="w-4 h-4 ml-2" />تصدير</Button>
          <Button variant="outline" size="sm"><Share2 className="w-4 h-4 ml-2" />مشاركة</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">التحسن هذا الأسبوع</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-2xl font-bold text-green-600">{keyInsights.weekly_improvement_pct?.toFixed(0) ?? 0}%</span>
            <TrendingDown className="w-4 h-4 text-green-600" />
          </div>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">أفضل نشاط</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-2xl font-bold">{keyInsights.top_activity ?? '...'}</span>
            <Calendar className="w-4 h-4 text-blue-600" />
          </div>
        </Card>
        <Card className="p-4">
           <p className="text-sm text-muted-foreground">الترتيب بين الأقران</p>
           <div className="flex items-center gap-2 mt-1">
             <span className="text-2xl font-bold">#{keyInsights.rank ?? 0}</span>
             <Users className="w-4 h-4 text-purple-600" />
           </div>
        </Card>
      </div>

      <Tabs defaultValue="trend" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="trend">الاتجاه</TabsTrigger>
          <TabsTrigger value="categories">التصنيفات</TabsTrigger>
          <TabsTrigger value="comparison">المقارنة</TabsTrigger>
          <TabsTrigger value="monthly">الشهري</TabsTrigger>
        </TabsList>

        <TabsContent value="trend">
          <Card className="p-6">
            <h3 className="font-semibold mb-4">الاتجاه الأسبوعي للبصمة الكربونية</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip formatter={(value: any) => [`${Number(value).toFixed(2)} كجم`, 'بصمة الكربون']} />
                  <Area type="monotone" dataKey="carbon" stroke="#3b82f6" fill="#dbeafe" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="categories">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
             <Card className="p-6">
               <h3 className="font-semibold mb-4">التوزيع حسب الفئة</h3>
               <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                      {categoryData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                    </Pie>
                    <Tooltip formatter={(value: any) => [`${value.toFixed(1)}%`, 'النسبة']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>
            <Card className="p-6">
              <h3 className="font-semibold mb-4">التفاصيل حسب الفئة</h3>
              <div className="space-y-4">
                {categoryData.map((category, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded" style={{ backgroundColor: category.color }} />
                      <span className="font-medium">{category.name}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{category.value.toFixed(1)}%</p>
                      <p className="text-sm text-muted-foreground">{category.absolute_value.toFixed(1)} كجم CO₂</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="comparison">
          <Card className="p-6">
            <h3 className="font-semibold mb-4">مقارنة الأداء (إجمالي التوفير)</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={comparisonData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <YAxis type="category" dataKey="category" width={80} />
                  <XAxis type="number" />
                  <Tooltip formatter={(value: any) => [`${Number(value).toFixed(2)} كجم`, 'إجمالي التوفير']} />
                  <Bar dataKey="carbon" radius={[0, 4, 4, 0]}>
                    {comparisonData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="monthly">
          <Card className="p-6">
            <h3 className="font-semibold mb-4">الاتجاه الشهري</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="carbon" orientation="right" label={{ value: 'كجم CO₂', angle: -90, position: 'insideRight' }}/>
                  <YAxis yAxisId="points" orientation="left" label={{ value: 'النقاط', angle: 90, position: 'insideLeft' }}/>
                  <Tooltip />
                  <Line yAxisId="carbon" type="monotone" dataKey="carbon" stroke="#dc2626" name="توفير الكربون" />
                  <Line yAxisId="points" type="monotone" dataKey="points" stroke="#16a34a" name="النقاط المكتسبة" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

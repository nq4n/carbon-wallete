'use client';

import { useState } from 'react';
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
  BarChart3,
  Users,
  Download,
  Share2
} from 'lucide-react';

const weeklyData = [
  { day: 'السبت', carbon: 3.2, target: 5.0 },
  { day: 'الأحد', carbon: 4.1, target: 5.0 },
  { day: 'الاثنين', carbon: 2.8, target: 5.0 },
  { day: 'الثلاثاء', carbon: 3.9, target: 5.0 },
  { day: 'الأربعاء', carbon: 4.5, target: 5.0 },
  { day: 'الخميس', carbon: 3.7, target: 5.0 },
  { day: 'الجمعة', carbon: 2.1, target: 5.0 },
];

const monthlyData = [
  { month: 'يناير', carbon: 125, points: 890 },
  { month: 'فبراير', carbon: 118, points: 920 },
  { month: 'مارس', carbon: 132, points: 850 },
  { month: 'أبريل', carbon: 108, points: 1050 },
  { month: 'مايو', carbon: 95, points: 1180 },
  { month: 'يونيو', carbon: 88, points: 1250 },
];

const categoryData = [
  { name: 'النقل', value: 45, color: '#3b82f6' },
  { name: 'الطاقة', value: 30, color: '#eab308' },
  { name: 'النفايات', value: 15, color: '#22c55e' },
  { name: 'الطعام', value: 10, color: '#f97316' },
];

const comparisonData = [
  { category: 'أنت', carbon: 28.5, color: '#3b82f6' },
  { category: 'متوسط الكلية', carbon: 35.2, color: '#64748b' },
  { category: 'متوسط الجامعة', carbon: 42.1, color: '#94a3b8' },
];

export default function CarbonStats() {
  const [selectedPeriod, setSelectedPeriod] = useState('week');

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">الإحصائيات والتقارير</h2>
          <p className="text-muted-foreground">تحليل مفصل لبصمتك الكربونية</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 ml-2" />
            تصدير
          </Button>
          <Button variant="outline" size="sm">
            <Share2 className="w-4 h-4 ml-2" />
            مشاركة
          </Button>
        </div>
      </div>

      {/* Key Insights Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">التحسن هذا الأسبوع</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-2xl font-bold text-green-600">-15%</span>
                <TrendingDown className="w-4 h-4 text-green-600" />
              </div>
            </div>
            <Badge variant="secondary" className="bg-green-100 text-green-700">
              ممتاز
            </Badge>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">الأيام المتتالية للهدف</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-2xl font-bold">12</span>
                <Calendar className="w-4 h-4 text-blue-600" />
              </div>
            </div>
            <Badge variant="secondary" className="bg-blue-100 text-blue-700">
              جديد
            </Badge>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">الترتيب بين الأقران</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-2xl font-bold">#24</span>
                <Users className="w-4 h-4 text-purple-600" />
              </div>
            </div>
            <Badge variant="secondary" className="bg-purple-100 text-purple-700">
              من أصل 450
            </Badge>
          </div>
        </Card>
      </div>

      {/* Charts Tabs */}
      <Tabs defaultValue="trend" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="trend">الاتجاه</TabsTrigger>
          <TabsTrigger value="categories">التصنيفات</TabsTrigger>
          <TabsTrigger value="comparison">المقارنة</TabsTrigger>
          <TabsTrigger value="monthly">الشهري</TabsTrigger>
        </TabsList>

        <TabsContent value="trend" className="space-y-4">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">الاتجاه الأسبوعي للبصمة الكربونية</h3>
              <div className="flex gap-2">
                <Badge variant="outline" className="text-blue-600">
                  البصمة الفعلية
                </Badge>
                <Badge variant="outline" className="text-gray-600">
                  الهدف
                </Badge>
              </div>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: any, name: string) => [
                      `${value} كجم CO₂`,
                      name === 'carbon' ? 'البصمة الفعلية' : 'الهدف'
                    ]}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="target" 
                    stroke="#94a3b8" 
                    fill="#f1f5f9" 
                    strokeDasharray="5 5"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="carbon" 
                    stroke="#3b82f6" 
                    fill="#dbeafe" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="font-semibold mb-4">التوزيع حسب الفئة</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => [`${value}%`, 'النسبة']} />
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
                      <div 
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: category.color }}
                      />
                      <span className="font-medium">{category.name}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{category.value}%</p>
                      <p className="text-sm text-muted-foreground">
                        {((category.value / 100) * 28.5).toFixed(1)} كجم CO₂
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="comparison" className="space-y-4">
          <Card className="p-6">
            <h3 className="font-semibold mb-4">مقارنة الأداء</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={comparisonData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="category" type="category" width={100} />
                  <Tooltip formatter={(value: any) => [`${value} كجم CO₂`, 'البصمة الكربونية']} />
                  <Bar dataKey="carbon" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-green-800">
                🎉 أداؤك أفضل من متوسط الكلية بنسبة 19% ومن متوسط الجامعة بنسبة 32%!
              </p>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="monthly" className="space-y-4">
          <Card className="p-6">
            <h3 className="font-semibold mb-4">الاتجاه الشهري</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="carbon" orientation="right" />
                  <YAxis yAxisId="points" orientation="left" />
                  <Tooltip />
                  <Line 
                    yAxisId="carbon"
                    type="monotone" 
                    dataKey="carbon" 
                    stroke="#dc2626" 
                    strokeWidth={3}
                    name="البصمة الكربونية (كجم CO₂)"
                  />
                  <Line 
                    yAxisId="points"
                    type="monotone" 
                    dataKey="points" 
                    stroke="#16a34a" 
                    strokeWidth={3}
                    name="النقاط المكتسبة"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
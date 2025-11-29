"use client";

import { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  AreaChart,
  Area,
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
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  Users,
  Download,
  Share2,
  Loader2,
  Award,
  Zap,
  Car,
  Trash2,
  Leaf,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../lib/supabase";

// ---------- helpers ----------
const translateActivityKind = (kind: string | null) => {
  if (!kind) return "...";
  switch (kind) {
    case "transport":
      return "النقل";
    case "energy":
      return "الطاقة";
    case "waste":
      return "النفايات";
    case "food":
      return "الطعام";
    default:
      return kind;
  }
};

const getActivityIcon = (kind: string | null) => {
  if (!kind) return <Calendar className="w-4 h-4 text-gray-500" />;
  switch (kind) {
    case "transport":
      return <Car className="w-4 h-4 text-blue-500" />;
    case "energy":
      return <Zap className="w-4 h-4 text-yellow-500" />;
    case "waste":
      return <Trash2 className="w-4 h-4 text-green-500" />;
    case "food":
      return <Leaf className="w-4 h-4 text-orange-500" />;
    default:
      return <Award className="w-4 h-4 text-gray-500" />;
  }
};

const categoryColors: Record<string, string> = {
  transport: "#3b82f6",
  energy: "#eab308",
  waste: "#22c55e",
  food: "#f97316",
};

const arabicWeekDays = [
  "الأحد",
  "الاثنين",
  "الثلاثاء",
  "الأربعاء",
  "الخميس",
  "الجمعة",
  "السبت",
];

export default function CarbonStats() {
  const { user, loading: authLoading } = useAuth();

  const [loading, setLoading] = useState(true);
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [comparisonData, setComparisonData] = useState<any[]>([]);
  const [keyInsights, setKeyInsights] = useState<any>({});

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);

        // ---------- 1) get_user_stats ----------
        const { data: statsData, error: statsError } = await supabase.rpc(
          "get_user_stats",
          { p_user_id: user.id }
        );

        if (statsError) {
          console.error("Error fetching user stats:", statsError);
        } else {
          const stats = Array.isArray(statsData) ? statsData[0] : statsData;

          if (stats) {
            // The `get_user_stats` function returns camelCase keys.
            // We should access them directly.
            const totalCarbonSaved = parseFloat(stats.totalCarbonSaved || 0);
            const departmentAverage = parseFloat(stats.departmentAverage || 0);
            const universityAverage = parseFloat(stats.universityAverage || 0);

            // Set key insights with all required values, including the newly calculated ones.
            // The `stats` object already contains all the keys we need in camelCase.
            setKeyInsights({
              ...stats,
              totalCarbonSaved, // Ensure these are numbers
              departmentAverage,
              universityAverage,
            });
            
            const cmp = [
              {
                category: "أنت",
                value: totalCarbonSaved,
                color: "#3b82f6",
              },
              {
                category: "متوسط القسم",
                value: departmentAverage,
                color: "#64748b",
              },
              {
                category: "متوسط الجامعة",
                value: universityAverage,
                color: "#94a3b8",
              },
            ];

            setComparisonData(cmp);
          }
        }

        // ---------- 2) weekly activity_log ----------
        const today = new Date();
        const dayOfWeek = today.getDay(); // 0 = Sunday
        const startDate = new Date(today);
        startDate.setDate(today.getDate() - dayOfWeek);
        startDate.setHours(0, 0, 0, 0);

        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6);
        endDate.setHours(23, 59, 59, 999);

        const { data: logsData, error: logsError } = await supabase
          .from("activity_log")
          .select("created_at, carbon_saved, activity_catalog(kind)")
          .eq("user_id", user.id)
          .gte("created_at", startDate.toISOString())
          .lte("created_at", endDate.toISOString());

        if (logsError) {
          console.error(
            "Error fetching activity logs for the week:",
            logsError
          );
          setLoading(false);
          return;
        }

        const normalizedLogs =
          logsData?.map((log: any) => ({
            created_at: log.created_at,
            carbon_saved: Number(log.carbon_saved) || 0,
            kind: log.activity_catalog?.kind ?? null,
          })) ?? [];

        // ---------- weekly chart data ----------
        const weeklyMap = new Map<
          number,
          {
            dayName: string;
            carbon: number;
          }
        >();

        for (let i = 0; i < 7; i++) {
          weeklyMap.set(i, { dayName: arabicWeekDays[i], carbon: 0 });
        }

        normalizedLogs.forEach((log) => {
          const logDayIndex = new Date(log.created_at).getDay();
          const entry = weeklyMap.get(logDayIndex)!;
          entry.carbon += log.carbon_saved;
        });

        const processedWeeklyData = Array.from(weeklyMap.values()).map((d) => ({
          day: d.dayName,
          carbon: Number(d.carbon.toFixed(2)),
        }));

        setWeeklyData(processedWeeklyData);

        // ---------- category (pie) data ----------
        const categoryMap = new Map<string, number>();
        let totalCarbonSavedWeek = 0;

        normalizedLogs.forEach((log) => {
          if (!log.kind) return;
          const current = categoryMap.get(log.kind) || 0;
          categoryMap.set(log.kind, current + log.carbon_saved);
          totalCarbonSavedWeek += log.carbon_saved;
        });

        const processedCategoryData = Array.from(categoryMap.entries()).map(
          ([name, value]) => {
            const percent =
              totalCarbonSavedWeek > 0
                ? (value / totalCarbonSavedWeek) * 100
                : 0;

            return {
              name: translateActivityKind(name),
              value: Number(percent.toFixed(1)), // %
              absolute_value: Number(value.toFixed(2)), // kg
              color: categoryColors[name] || "#64748b",
            };
          }
        );

        setCategoryData(processedCategoryData);
      } catch (e) {
        console.error("Unexpected error in fetchData:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, authLoading]);

  // ---------- loading state ----------
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="mr-4 text-lg">جارِ تحميل الإحصائيات...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-40">
        <p className="text-muted-foreground">
          يرجى تسجيل الدخول لعرض الإحصائيات.
        </p>
      </div>
    );
  }

  // ---------- UI ----------
  return (
    <div className="space-y-6" dir="rtl">
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

      {/* summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">التحسن هذا الأسبوع</p>
          <div
            className={`flex items-center gap-2 mt-1 ${
              (keyInsights.weeklyImprovement ?? 0) >= 0
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            <span className="text-2xl font-bold">
              {Number(keyInsights.weeklyImprovement ?? 0).toFixed(0)}%
            </span>
            {(keyInsights.weeklyImprovement ?? 0) >= 0 ? (
              <TrendingUp className="w-5 h-5" />
            ) : (
              <TrendingDown className="w-5 h-5" />
            )}
          </div>
        </Card>

        <Card className="p-4">
          <p className="text-sm text-muted-foreground">أفضل نشاط</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-2xl font-bold">
              {translateActivityKind(keyInsights.topActivityKind ?? null)}
            </span>
            {getActivityIcon(keyInsights.topActivityKind ?? null)}
          </div>
        </Card>

        <Card className="p-4">
          <p className="text-sm text-muted-foreground">الترتيب بين الأقران</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-2xl font-bold">
              #{keyInsights.rank ?? 0}
            </span>
            <Users className="w-4 h-4 text-purple-600" />
          </div>
        </Card>
      </div>

      {/* tabs */}
      <Tabs defaultValue="trend" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="trend">الاتجاه الأسبوعي</TabsTrigger>
          <TabsTrigger value="categories">التوزيع</TabsTrigger>
          <TabsTrigger value="comparison">المقارنة</TabsTrigger>
        </TabsList>

        {/* weekly trend */}
        <TabsContent value="trend">
          <Card className="p-6">
            <h3 className="font-semibold mb-4">توفير الكربون (هذا الأسبوع)</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis unit=" كجم" />
                  <Tooltip
                    formatter={(value: any) => [`${value} كجم`, "التوفير"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="carbon"
                    stroke="#16a34a"
                    fill="#dcfce7"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </TabsContent>

        {/* categories */}
        <TabsContent value="categories">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="font-semibold mb-4">
                التوزيع حسب الفئة (هذا الأسبوع)
              </h3>
              <div className="h-80">
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
                      label={({ name, value }) => `${name} ${value.toFixed(0)}%`}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: any, name: string, props: any) => [
                        `${props.payload.absolute_value.toFixed(2)} كجم (${Number(
                          value
                        ).toFixed(1)}%)`,
                        name,
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4">التفاصيل حسب الفئة</h3>
              <div className="space-y-4 pt-4">
                {categoryData.length > 0 ? (
                  categoryData.map((cat, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 ه-4 rounded"
                          style={{ backgroundColor: cat.color }}
                        />
                        <span className="font-medium">{cat.name}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          {cat.absolute_value.toFixed(2)} كجم
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {cat.value.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center">
                    لا توجد بيانات لهذه الفترة
                  </p>
                )}
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* comparison */}
        <TabsContent value="comparison">
          <Card className="p-6">
            <h3 className="font-semibold mb-4">مقارنة إجمالي التوفير</h3>

            {/* تقدر تحذف الـ <pre> بعد ما تخلص ديبَغ */}
            {/* <pre className="text-xs bg-slate-50 p-2 rounded mb-4 overflow-auto">
              {JSON.stringify(comparisonData, null, 2)}
            </pre> */}

            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={comparisonData}
                  layout="vertical"
                  margin={{ right: 30 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <YAxis
                    type="category"
                    dataKey="category"
                    width={80}
                    tick={{ fill: "#333" }}
                  />
                  <XAxis type="number" unit=" كجم" />
                  <Tooltip
                    formatter={(value: any) => [
                      `${Number(value).toFixed(2)} كجم`,
                      "إجمالي التوفير",
                    ]}
                    cursor={{ fill: "#f1f5f9" }}
                  />
                  <Bar
                    dataKey="value"
                    radius={[0, 4, 4, 0]}
                    label={{
                      position: "right",
                      formatter: (v: any) => `${Number(v).toFixed(2)} كجم`,
                    }}
                  >
                    {comparisonData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

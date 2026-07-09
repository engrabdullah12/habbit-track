import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, PieChart as PieIcon, TrendingUp, Trophy } from "lucide-react";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
} from "recharts";
import { useTimeTracker } from "@/hooks/useTimeTracker";
import { format, subDays, startOfDay } from "date-fns";

const CATEGORY_COLORS: Record<string, string> = {
  General: "#6366f1", Work: "#ec4899", "Video Editing": "#f59e0b",
  "Content Creation": "#14b8a6", Design: "#8b5cf6", Coding: "#06b6d4",
  Learning: "#22c55e", Other: "#ef4444",
};

const formatHrs = (secs: number) => {
  const h = secs / 3600;
  return h >= 1 ? `${h.toFixed(1)}h` : `${Math.round(secs / 60)}m`;
};

const TimeDashboard = () => {
  const { entries } = useTimeTracker();

  const { byCategory, last7Days, topTasks, totalSecs, totalSessions } = useMemo(() => {
    const secsOf = (e: typeof entries[number]) =>
      e.is_running
        ? Math.round((Date.now() - new Date(e.started_at).getTime()) / 1000)
        : e.duration_seconds || 0;

    // By category
    const catMap = new Map<string, number>();
    entries.forEach((e) => catMap.set(e.category, (catMap.get(e.category) || 0) + secsOf(e)));
    const byCategory = Array.from(catMap.entries())
      .map(([name, value]) => ({ name, value, color: CATEGORY_COLORS[name] || "#6366f1" }))
      .sort((a, b) => b.value - a.value);

    // Last 7 days
    const days: { day: string; date: string; seconds: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = startOfDay(subDays(new Date(), i));
      days.push({ day: format(d, "EEE"), date: format(d, "yyyy-MM-dd"), seconds: 0 });
    }
    entries.forEach((e) => {
      const key = format(new Date(e.started_at), "yyyy-MM-dd");
      const bucket = days.find((d) => d.date === key);
      if (bucket) bucket.seconds += secsOf(e);
    });
    const last7Days = days.map((d) => ({ day: d.day, hours: +(d.seconds / 3600).toFixed(2) }));

    // Top tasks
    const taskMap = new Map<string, { seconds: number; color: string }>();
    entries.forEach((e) => {
      const cur = taskMap.get(e.task_name) || { seconds: 0, color: e.color };
      cur.seconds += secsOf(e);
      taskMap.set(e.task_name, cur);
    });
    const topTasks = Array.from(taskMap.entries())
      .map(([name, v]) => ({ name, seconds: v.seconds, color: v.color }))
      .sort((a, b) => b.seconds - a.seconds).slice(0, 5);

    const totalSecs = entries.reduce((s, e) => s + secsOf(e), 0);
    return { byCategory, last7Days, topTasks, totalSecs, totalSessions: entries.length };
  }, [entries]);

  if (entries.length === 0) return null;

  const topCategory = byCategory[0];

  return (
    <div className="mb-10">
      <div className="flex items-center gap-2 mb-4 mt-10">
        <BarChart3 className="w-5 h-5 text-[hsl(200,80%,65%)]" />
        <h2 className="text-xl font-bold text-foreground">Time Insights</h2>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        {[
          { label: "Total Time", value: formatHrs(totalSecs), icon: TrendingUp },
          { label: "Sessions", value: String(totalSessions), icon: BarChart3 },
          { label: "Top Category", value: topCategory?.name || "—", icon: Trophy },
          { label: "Categories", value: String(byCategory.length), icon: PieIcon },
        ].map((s) => (
          <Card key={s.label} className="border-[hsl(260,30%,18%)] bg-[hsl(250,40%,10%,0.6)] backdrop-blur-lg">
            <CardContent className="py-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <s.icon className="w-3.5 h-3.5" />
                <span className="text-[11px] uppercase tracking-wide">{s.label}</span>
              </div>
              <p className="text-lg font-bold text-foreground truncate">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-4">
        {/* Category pie */}
        <Card className="border-[hsl(260,30%,18%)] bg-[hsl(250,40%,10%,0.6)] backdrop-blur-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
              <PieIcon className="w-4 h-4" /> Time by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={byCategory} dataKey="value" nameKey="name"
                  cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={2}
                >
                  {byCategory.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: "hsl(250,40%,10%)", border: "1px solid hsl(260,30%,25%)", borderRadius: 8, color: "#fff" }}
                  formatter={(v: number) => formatHrs(v)}
                />
                <Legend wrapperStyle={{ fontSize: 12, color: "#fff" }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Weekly bar */}
        <Card className="border-[hsl(260,30%,18%)] bg-[hsl(250,40%,10%,0.6)] backdrop-blur-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
              <TrendingUp className="w-4 h-4" /> Last 7 Days (hours)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={last7Days}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(260,20%,20%)" />
                <XAxis dataKey="day" stroke="hsl(260,10%,60%)" fontSize={12} />
                <YAxis stroke="hsl(260,10%,60%)" fontSize={12} />
                <Tooltip
                  contentStyle={{ background: "hsl(250,40%,10%)", border: "1px solid hsl(260,30%,25%)", borderRadius: 8, color: "#fff" }}
                  formatter={(v: number) => `${v}h`}
                />
                <Bar dataKey="hours" fill="url(#barGrad)" radius={[6, 6, 0, 0]} />
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(260,80%,65%)" />
                    <stop offset="100%" stopColor="hsl(200,80%,55%)" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top tasks */}
      <Card className="border-[hsl(260,30%,18%)] bg-[hsl(250,40%,10%,0.6)] backdrop-blur-lg">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
            <Trophy className="w-4 h-4" /> Top Tasks
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {topTasks.map((t) => {
            const pct = topTasks[0].seconds ? (t.seconds / topTasks[0].seconds) * 100 : 0;
            return (
              <div key={t.name}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: t.color }} />
                    <span className="text-foreground truncate">{t.name}</span>
                  </div>
                  <span className="font-mono text-muted-foreground text-xs ml-2">{formatHrs(t.seconds)}</span>
                </div>
                <div className="h-1.5 rounded-full bg-[hsl(250,30%,14%)] overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: t.color }} />
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
};

export default TimeDashboard;

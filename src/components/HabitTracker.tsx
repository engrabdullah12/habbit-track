import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Flame, Target, TrendingUp, Calendar, LogOut, Sparkles, Trophy } from "lucide-react";
import { format, subDays, eachDayOfInterval, startOfWeek, endOfWeek, isWithinInterval } from "date-fns";

const COLORS = ["#6366f1", "#ec4899", "#14b8a6", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#22c55e"];

const HabitTracker = () => {
  const { user, signOut } = useAuth();
  const [newHabit, setNewHabit] = useState("");
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [goalType, setGoalType] = useState<"daily" | "weekly">("daily");
  const [goalTarget, setGoalTarget] = useState(1);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const today = format(new Date(), "yyyy-MM-dd");

  const { data: habits = [] } = useQuery({
    queryKey: ["habits"],
    queryFn: async () => {
      const { data, error } = await supabase.from("habits").select("*").order("created_at");
      if (error) throw error;
      return data;
    },
  });

  const { data: completions = [] } = useQuery({
    queryKey: ["completions"],
    queryFn: async () => {
      const thirtyDaysAgo = format(subDays(new Date(), 30), "yyyy-MM-dd");
      const { data, error } = await supabase
        .from("completions")
        .select("*")
        .gte("completion_date", thirtyDaysAgo);
      if (error) throw error;
      return data;
    },
  });

  const addHabit = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("habits").insert({
        name: newHabit,
        user_id: user!.id,
        color: selectedColor,
        goal_type: goalType,
        goal_target: goalTarget,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["habits"] });
      setNewHabit("");
      setGoalTarget(1);
      toast({ title: "Habit added! 🎯" });
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const deleteHabit = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("habits").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["habits"] });
      queryClient.invalidateQueries({ queryKey: ["completions"] });
    },
  });

  const toggleCompletion = useMutation({
    mutationFn: async ({ habitId, date }: { habitId: string; date: string }) => {
      const existing = completions.find((c) => c.habit_id === habitId && c.completion_date === date);
      if (existing) {
        const { error } = await supabase.from("completions").delete().eq("id", existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("completions").insert({ habit_id: habitId, completion_date: date });
        if (error) throw error;
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["completions"] }),
  });

  const isCompleted = (habitId: string, date: string) =>
    completions.some((c) => c.habit_id === habitId && c.completion_date === date);

  // Goal progress helpers
  const getGoalProgress = (habit: typeof habits[0]) => {
    if (habit.goal_type === "daily") {
      const done = isCompleted(habit.id, today) ? 1 : 0;
      return { current: done, target: habit.goal_target, pct: Math.min(100, Math.round((done / habit.goal_target) * 100)) };
    } else {
      const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
      const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });
      const weekCompletions = completions.filter(
        (c) => c.habit_id === habit.id && isWithinInterval(new Date(c.completion_date + "T00:00:00"), { start: weekStart, end: weekEnd })
      ).length;
      return { current: weekCompletions, target: habit.goal_target, pct: Math.min(100, Math.round((weekCompletions / habit.goal_target) * 100)) };
    }
  };

  // Dashboard calculations
  const last7Days = eachDayOfInterval({ start: subDays(new Date(), 6), end: new Date() });
  const todayCompletions = habits.filter((h) => isCompleted(h.id, today)).length;
  const todayRate = habits.length > 0 ? Math.round((todayCompletions / habits.length) * 100) : 0;

  const getStreak = (habitId: string) => {
    let streak = 0;
    let d = new Date();
    while (true) {
      if (isCompleted(habitId, format(d, "yyyy-MM-dd"))) {
        streak++;
        d = subDays(d, 1);
      } else break;
    }
    return streak;
  };

  const bestStreak = habits.length > 0 ? Math.max(...habits.map((h) => getStreak(h.id))) : 0;

  const weeklyData = last7Days.map((day) => {
    const dateStr = format(day, "yyyy-MM-dd");
    const completed = habits.filter((h) => isCompleted(h.id, dateStr)).length;
    return { day: format(day, "EEE"), completed, total: habits.length, rate: habits.length > 0 ? Math.round((completed / habits.length) * 100) : 0 };
  });

  const weeklyAvg = weeklyData.length > 0 ? Math.round(weeklyData.reduce((s, d) => s + d.rate, 0) / weeklyData.length) : 0;

  const goalsMetCount = habits.filter((h) => getGoalProgress(h).pct >= 100).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(250,60%,8%)] via-[hsl(260,50%,12%)] to-[hsl(240,40%,6%)]">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/3 w-[600px] h-[600px] bg-[hsl(260,80%,50%,0.06)] rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/3 w-[500px] h-[500px] bg-[hsl(200,80%,50%,0.04)] rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[hsl(260,80%,65%)] to-[hsl(200,80%,55%)] flex items-center justify-center shadow-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">HabitFlow</h1>
          </div>
          <Button onClick={signOut} variant="ghost" size="sm" className="text-[hsl(260,20%,55%)] hover:text-white hover:bg-[hsl(260,30%,18%)]">
            <LogOut className="w-4 h-4 mr-2" /> Sign Out
          </Button>
        </div>

        {/* Add Habit */}
        <Card className="mb-8 border-[hsl(260,30%,18%)] bg-[hsl(250,40%,10%,0.6)] backdrop-blur-lg">
          <CardContent className="pt-6">
            <form onSubmit={(e) => { e.preventDefault(); if (newHabit.trim()) addHabit.mutate(); }} className="space-y-4">
              <div className="flex gap-3 items-end">
                <div className="flex-1">
                  <Input
                    placeholder="Add a new habit..."
                    value={newHabit}
                    onChange={(e) => setNewHabit(e.target.value)}
                    className="bg-[hsl(250,30%,14%)] border-[hsl(260,25%,22%)] text-white placeholder:text-[hsl(260,15%,38%)] focus-visible:ring-[hsl(260,80%,65%)] h-11"
                  />
                </div>
                <Button type="submit" disabled={!newHabit.trim()} className="bg-gradient-to-r from-[hsl(260,80%,65%)] to-[hsl(200,80%,55%)] hover:from-[hsl(260,80%,60%)] hover:to-[hsl(200,80%,50%)] h-11 px-5">
                  <Plus className="w-4 h-4 mr-1" /> Add
                </Button>
              </div>
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex gap-1.5">
                  {COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setSelectedColor(c)}
                      className="w-6 h-6 rounded-full transition-all"
                      style={{
                        backgroundColor: c,
                        outline: selectedColor === c ? `2px solid ${c}` : "none",
                        outlineOffset: "2px",
                        transform: selectedColor === c ? "scale(1.15)" : "scale(1)",
                      }}
                    />
                  ))}
                </div>
                <div className="h-5 w-px bg-[hsl(260,25%,22%)]" />
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[hsl(260,15%,50%)] font-medium">Goal:</span>
                  <div className="flex rounded-lg overflow-hidden border border-[hsl(260,25%,22%)]">
                    <button
                      type="button"
                      onClick={() => { setGoalType("daily"); setGoalTarget(1); }}
                      className={`px-3 py-1.5 text-xs font-medium transition-all ${goalType === "daily" ? "bg-[hsl(260,80%,65%)] text-white" : "bg-[hsl(250,30%,14%)] text-[hsl(260,15%,50%)]"}`}
                    >
                      Daily
                    </button>
                    <button
                      type="button"
                      onClick={() => { setGoalType("weekly"); setGoalTarget(5); }}
                      className={`px-3 py-1.5 text-xs font-medium transition-all ${goalType === "weekly" ? "bg-[hsl(260,80%,65%)] text-white" : "bg-[hsl(250,30%,14%)] text-[hsl(260,15%,50%)]"}`}
                    >
                      Weekly
                    </button>
                  </div>
                  <span className="text-xs text-[hsl(260,15%,50%)]">×</span>
                  <Input
                    type="number"
                    min={1}
                    max={goalType === "daily" ? 1 : 7}
                    value={goalTarget}
                    onChange={(e) => setGoalTarget(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-16 h-8 text-center bg-[hsl(250,30%,14%)] border-[hsl(260,25%,22%)] text-white text-xs focus-visible:ring-[hsl(260,80%,65%)]"
                  />
                  <span className="text-xs text-[hsl(260,15%,50%)]">{goalType === "daily" ? "time/day" : "days/week"}</span>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Habits List */}
        <div className="space-y-3 mb-10">
          {habits.length === 0 && (
            <div className="text-center py-16 text-[hsl(260,15%,40%)]">
              <Target className="w-12 h-12 mx-auto mb-4 opacity-40" />
              <p className="text-lg font-medium">No habits yet</p>
              <p className="text-sm mt-1">Add your first habit above to start tracking!</p>
            </div>
          )}
          {habits.map((habit) => {
            const streak = getStreak(habit.id);
            const progress = getGoalProgress(habit);
            const goalMet = progress.pct >= 100;
            return (
              <Card key={habit.id} className="border-[hsl(260,30%,18%)] bg-[hsl(250,40%,10%,0.5)] backdrop-blur-sm hover:bg-[hsl(250,40%,12%,0.6)] transition-all group">
                <CardContent className="py-4 px-5 space-y-2">
                  <div className="flex items-center gap-4">
                    <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: habit.color }} />
                    <Checkbox
                      checked={isCompleted(habit.id, today)}
                      onCheckedChange={() => toggleCompletion.mutate({ habitId: habit.id, date: today })}
                      className="border-[hsl(260,25%,30%)] data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-[hsl(260,80%,65%)] data-[state=checked]:to-[hsl(200,80%,55%)] data-[state=checked]:border-transparent w-5 h-5"
                    />
                    <span className={`flex-1 font-medium transition-all ${isCompleted(habit.id, today) ? "line-through text-[hsl(260,15%,40%)]" : "text-white"}`}>
                      {habit.name}
                    </span>
                    {goalMet && <Trophy className="w-4 h-4 text-[hsl(45,90%,55%)]" />}
                    {streak > 0 && (
                      <span className="flex items-center gap-1 text-sm text-[hsl(30,90%,55%)] font-semibold">
                        <Flame className="w-4 h-4" /> {streak}
                      </span>
                    )}
                    <span className="text-xs text-[hsl(260,15%,45%)] font-medium min-w-[60px] text-right">
                      {progress.current}/{progress.target} {habit.goal_type === "daily" ? "today" : "this week"}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteHabit.mutate(habit.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-[hsl(260,15%,40%)] hover:text-red-400 hover:bg-transparent h-8 w-8"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="ml-12">
                    <Progress
                      value={progress.pct}
                      className="h-1.5 bg-[hsl(250,30%,15%)]"
                      style={{ ["--progress-color" as string]: goalMet ? "hsl(150,70%,45%)" : habit.color }}
                    />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Dashboard */}
        {habits.length > 0 && (
          <>
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="w-5 h-5 text-[hsl(260,80%,70%)]" />
              <h2 className="text-xl font-bold text-white">Dashboard</h2>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { label: "Today", value: `${todayRate}%`, icon: Target, color: "from-[hsl(260,80%,65%)] to-[hsl(280,80%,55%)]" },
                { label: "Goals Met", value: `${goalsMetCount}/${habits.length}`, icon: Trophy, color: "from-[hsl(45,90%,50%)] to-[hsl(30,90%,50%)]" },
                { label: "Best Streak", value: `${bestStreak}d`, icon: Flame, color: "from-[hsl(20,90%,55%)] to-[hsl(40,90%,50%)]" },
                { label: "Weekly Avg", value: `${weeklyAvg}%`, icon: TrendingUp, color: "from-[hsl(160,70%,45%)] to-[hsl(180,70%,40%)]" },
              ].map((stat) => (
                <Card key={stat.label} className="border-[hsl(260,30%,18%)] bg-[hsl(250,40%,10%,0.5)] backdrop-blur-sm overflow-hidden">
                  <CardContent className="p-5 relative">
                    <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${stat.color} opacity-10 rounded-bl-full`} />
                    <stat.icon className="w-5 h-5 text-[hsl(260,20%,55%)] mb-2" />
                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                    <p className="text-xs text-[hsl(260,15%,45%)] font-medium mt-1">{stat.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Goal Progress Overview */}
            <Card className="border-[hsl(260,30%,18%)] bg-[hsl(250,40%,10%,0.5)] backdrop-blur-sm mb-8">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold text-white">Goal Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {habits.map((habit) => {
                  const progress = getGoalProgress(habit);
                  const goalMet = progress.pct >= 100;
                  return (
                    <div key={habit.id} className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: habit.color }} />
                          <span className="text-sm text-[hsl(260,15%,70%)] font-medium">{habit.name}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[hsl(250,30%,15%)] text-[hsl(260,15%,50%)] font-medium uppercase">
                            {habit.goal_type}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {goalMet && <Trophy className="w-3.5 h-3.5 text-[hsl(45,90%,55%)]" />}
                          <span className="text-sm text-[hsl(260,15%,55%)] font-semibold">{progress.current}/{progress.target}</span>
                        </div>
                      </div>
                      <Progress
                        value={progress.pct}
                        className="h-2 bg-[hsl(250,30%,15%)]"
                        style={{ ["--progress-color" as string]: goalMet ? "hsl(150,70%,45%)" : habit.color }}
                      />
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Weekly Bar Chart */}
            <Card className="border-[hsl(260,30%,18%)] bg-[hsl(250,40%,10%,0.5)] backdrop-blur-sm mb-8">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold text-white">This Week</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end justify-between gap-3 h-40">
                  {weeklyData.map((d, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2">
                      <span className="text-xs text-[hsl(260,15%,50%)] font-medium">{d.rate}%</span>
                      <div className="w-full bg-[hsl(250,30%,15%)] rounded-lg overflow-hidden" style={{ height: "100px" }}>
                        <div
                          className="w-full rounded-lg bg-gradient-to-t from-[hsl(260,80%,65%)] to-[hsl(200,80%,55%)] transition-all duration-500"
                          style={{ height: `${d.rate}%`, marginTop: `${100 - d.rate}%` }}
                        />
                      </div>
                      <span className="text-xs text-[hsl(260,15%,45%)] font-medium">{d.day}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Habit Heatmap */}
            <Card className="border-[hsl(260,30%,18%)] bg-[hsl(250,40%,10%,0.5)] backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold text-white">Last 7 Days</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr>
                        <th className="text-left text-xs text-[hsl(260,15%,45%)] font-medium pb-3 pr-4">Habit</th>
                        {last7Days.map((d, i) => (
                          <th key={i} className="text-center text-xs text-[hsl(260,15%,45%)] font-medium pb-3 px-1">
                            {format(d, "EEE")}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {habits.map((habit) => (
                        <tr key={habit.id}>
                          <td className="text-sm text-[hsl(260,15%,65%)] pr-4 py-1.5 max-w-[120px] truncate">{habit.name}</td>
                          {last7Days.map((d, i) => {
                            const dateStr = format(d, "yyyy-MM-dd");
                            const done = isCompleted(habit.id, dateStr);
                            return (
                              <td key={i} className="text-center px-1 py-1.5">
                                <button
                                  onClick={() => toggleCompletion.mutate({ habitId: habit.id, date: dateStr })}
                                  className="w-8 h-8 rounded-lg transition-all mx-auto flex items-center justify-center"
                                  style={{
                                    backgroundColor: done ? habit.color : "hsl(250,30%,14%)",
                                    opacity: done ? 1 : 0.4,
                                  }}
                                >
                                  {done && <span className="text-white text-xs">✓</span>}
                                </button>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default HabitTracker;

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { format, subDays, eachDayOfInterval, startOfWeek, endOfWeek, isWithinInterval } from "date-fns";
import { Habit, Completion } from "@/lib/habitTypes";

export const useHabits = () => {
  const { user } = useAuth();
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
      const { data, error } = await supabase.from("completions").select("*").gte("completion_date", thirtyDaysAgo);
      if (error) throw error;
      return data;
    },
  });

  const activeHabits = habits.filter((h) => !h.archived);
  const archivedHabits = habits.filter((h) => h.archived);

  const addHabit = useMutation({
    mutationFn: async (params: { name: string; color: string; goalType: string; goalTarget: number; category: string; reminderTime?: string }) => {
      const { error } = await supabase.from("habits").insert({
        name: params.name,
        user_id: user!.id,
        color: params.color,
        goal_type: params.goalType,
        goal_target: params.goalTarget,
        category: params.category,
        reminder_time: params.reminderTime || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["habits"] });
      toast({ title: "Habit added! 🎯" });
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const updateHabit = useMutation({
    mutationFn: async (params: { id: string; name?: string; color?: string; goal_type?: string; goal_target?: number; category?: string; archived?: boolean; reminder_time?: string | null }) => {
      const { id, ...updates } = params;
      const { error } = await supabase.from("habits").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["habits"] });
      toast({ title: "Habit updated! ✨" });
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
    mutationFn: async ({ habitId, date, note }: { habitId: string; date: string; note?: string }) => {
      const existing = completions.find((c) => c.habit_id === habitId && c.completion_date === date);
      if (existing) {
        const { error } = await supabase.from("completions").delete().eq("id", existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("completions").insert({ habit_id: habitId, completion_date: date, note: note || null });
        if (error) throw error;
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["completions"] }),
  });

  const isCompleted = (habitId: string, date: string) =>
    completions.some((c) => c.habit_id === habitId && c.completion_date === date);

  const getCompletionNote = (habitId: string, date: string) =>
    completions.find((c) => c.habit_id === habitId && c.completion_date === date)?.note || "";

  const getGoalProgress = (habit: Habit) => {
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

  const last7Days = eachDayOfInterval({ start: subDays(new Date(), 6), end: new Date() });
  const todayCompletions = activeHabits.filter((h) => isCompleted(h.id, today)).length;
  const todayRate = activeHabits.length > 0 ? Math.round((todayCompletions / activeHabits.length) * 100) : 0;
  const bestStreak = activeHabits.length > 0 ? Math.max(...activeHabits.map((h) => getStreak(h.id)), 0) : 0;

  const weeklyData = last7Days.map((day) => {
    const dateStr = format(day, "yyyy-MM-dd");
    const completed = activeHabits.filter((h) => isCompleted(h.id, dateStr)).length;
    return { day: format(day, "EEE"), completed, total: activeHabits.length, rate: activeHabits.length > 0 ? Math.round((completed / activeHabits.length) * 100) : 0 };
  });

  const weeklyAvg = weeklyData.length > 0 ? Math.round(weeklyData.reduce((s, d) => s + d.rate, 0) / weeklyData.length) : 0;
  const goalsMetCount = activeHabits.filter((h) => getGoalProgress(h).pct >= 100).length;

  return {
    habits, activeHabits, archivedHabits, completions, today,
    addHabit, updateHabit, deleteHabit, toggleCompletion,
    isCompleted, getCompletionNote, getGoalProgress, getStreak,
    last7Days, todayRate, bestStreak, weeklyData, weeklyAvg, goalsMetCount,
  };
};

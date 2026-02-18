import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export interface TimeEntry {
  id: string;
  user_id: string;
  task_name: string;
  category: string;
  color: string;
  started_at: string;
  ended_at: string | null;
  duration_seconds: number | null;
  is_running: boolean;
  created_at: string;
}

export const TIME_CATEGORIES = ["General", "Work", "Video Editing", "Content Creation", "Design", "Coding", "Learning", "Other"];
export const TIME_COLORS = ["#6366f1", "#ec4899", "#14b8a6", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#22c55e"];

export const useTimeTracker = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: entries = [] } = useQuery({
    queryKey: ["time_entries"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("time_entries")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data as TimeEntry[];
    },
  });

  const runningEntry = entries.find((e) => e.is_running);

  const startTimer = useMutation({
    mutationFn: async (params: { taskName: string; category: string; color: string }) => {
      // Stop any running timer first
      if (runningEntry) {
        const now = new Date().toISOString();
        const duration = Math.round((new Date(now).getTime() - new Date(runningEntry.started_at).getTime()) / 1000);
        await supabase.from("time_entries").update({ ended_at: now, duration_seconds: duration, is_running: false }).eq("id", runningEntry.id);
      }
      const { error } = await supabase.from("time_entries").insert({
        user_id: user!.id,
        task_name: params.taskName,
        category: params.category,
        color: params.color,
        is_running: true,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["time_entries"] });
      toast({ title: "Timer started! ⏱️" });
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const stopTimer = useMutation({
    mutationFn: async (id: string) => {
      const entry = entries.find((e) => e.id === id);
      if (!entry) return;
      const now = new Date().toISOString();
      const duration = Math.round((new Date(now).getTime() - new Date(entry.started_at).getTime()) / 1000);
      const { error } = await supabase.from("time_entries").update({ ended_at: now, duration_seconds: duration, is_running: false }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["time_entries"] });
      toast({ title: "Timer stopped! ✅" });
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const deleteEntry = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("time_entries").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["time_entries"] }),
  });

  // Today's total time
  const today = new Date().toISOString().split("T")[0];
  const todayEntries = entries.filter((e) => e.started_at.startsWith(today));
  const todayTotalSeconds = todayEntries.reduce((sum, e) => {
    if (e.is_running) {
      return sum + Math.round((Date.now() - new Date(e.started_at).getTime()) / 1000);
    }
    return sum + (e.duration_seconds || 0);
  }, 0);

  return { entries, runningEntry, startTimer, stopTimer, deleteEntry, todayEntries, todayTotalSeconds };
};

import { Tables } from "@/integrations/supabase/types";

export type Habit = Tables<"habits">;
export type Completion = Tables<"completions">;

export const COLORS = ["#6366f1", "#ec4899", "#14b8a6", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#22c55e"];

export const CATEGORIES = ["General", "Health", "Work", "Learning", "Fitness", "Mindfulness", "Social", "Finance"];

export interface HabitTemplate {
  name: string;
  category: string;
  color: string;
  goal_type: "daily" | "weekly";
  goal_target: number;
}

export const HABIT_TEMPLATES: HabitTemplate[] = [
  { name: "Drink 8 glasses of water", category: "Health", color: "#06b6d4", goal_type: "daily", goal_target: 1 },
  { name: "Exercise 30 minutes", category: "Fitness", color: "#ef4444", goal_type: "weekly", goal_target: 5 },
  { name: "Read for 20 minutes", category: "Learning", color: "#8b5cf6", goal_type: "daily", goal_target: 1 },
  { name: "Meditate", category: "Mindfulness", color: "#14b8a6", goal_type: "daily", goal_target: 1 },
  { name: "Journal", category: "Mindfulness", color: "#f59e0b", goal_type: "daily", goal_target: 1 },
  { name: "Walk 10,000 steps", category: "Fitness", color: "#22c55e", goal_type: "daily", goal_target: 1 },
  { name: "No social media", category: "Health", color: "#ec4899", goal_type: "daily", goal_target: 1 },
  { name: "Practice a skill", category: "Learning", color: "#6366f1", goal_type: "weekly", goal_target: 3 },
  { name: "Cook a healthy meal", category: "Health", color: "#f59e0b", goal_type: "weekly", goal_target: 4 },
  { name: "Save money", category: "Finance", color: "#22c55e", goal_type: "weekly", goal_target: 1 },
];

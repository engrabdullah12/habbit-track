import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useHabits } from "@/hooks/useHabits";
import { useTheme } from "@/hooks/useTheme";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LogOut, Sparkles, Target, Sun, Moon, Filter } from "lucide-react";
import { CATEGORIES } from "@/lib/habitTypes";
import AddHabitForm from "@/components/habits/AddHabitForm";
import HabitItem from "@/components/habits/HabitItem";
import Dashboard from "@/components/habits/Dashboard";
import Heatmap from "@/components/habits/Heatmap";
import MonthlyCalendar from "@/components/habits/MonthlyCalendar";
import HabitTemplates from "@/components/habits/HabitTemplates";
import ArchivedHabits from "@/components/habits/ArchivedHabits";
import ExportShare from "@/components/habits/ExportShare";
import TimeTracker from "@/components/habits/TimeTracker";

const HabitTracker = () => {
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [showTemplates, setShowTemplates] = useState(false);

  const {
    activeHabits, archivedHabits, completions, today,
    addHabit, updateHabit, deleteHabit, toggleCompletion,
    isCompleted, getCompletionNote, getGoalProgress, getStreak,
    last7Days, todayRate, bestStreak, weeklyData, weeklyAvg, goalsMetCount,
  } = useHabits();

  // Browser notification reminders
  useEffect(() => {
    if (!("Notification" in window)) return;
    Notification.requestPermission();

    const interval = setInterval(() => {
      const now = new Date();
      const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
      activeHabits.forEach((habit) => {
        if (habit.reminder_time === currentTime && !isCompleted(habit.id, today)) {
          if (Notification.permission === "granted") {
            new Notification("HabitFlow Reminder 🔔", { body: `Time to: ${habit.name}`, icon: "/favicon.ico" });
          }
        }
      });
    }, 60000);
    return () => clearInterval(interval);
  }, [activeHabits, today, isCompleted]);

  const filteredHabits = categoryFilter === "All" ? activeHabits : activeHabits.filter((h) => h.category === categoryFilter);

  return (
    <div className={`min-h-screen transition-colors ${theme === "dark" ? "bg-gradient-to-br from-[hsl(250,60%,8%)] via-[hsl(260,50%,12%)] to-[hsl(240,40%,6%)]" : "bg-gradient-to-br from-[hsl(220,30%,96%)] via-[hsl(240,20%,98%)] to-[hsl(260,20%,95%)]"}`}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-0 left-1/3 w-[600px] h-[600px] rounded-full blur-3xl ${theme === "dark" ? "bg-[hsl(260,80%,50%,0.06)]" : "bg-[hsl(260,80%,80%,0.15)]"}`} />
        <div className={`absolute bottom-0 right-1/3 w-[500px] h-[500px] rounded-full blur-3xl ${theme === "dark" ? "bg-[hsl(200,80%,50%,0.04)]" : "bg-[hsl(200,80%,80%,0.1)]"}`} />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[hsl(260,80%,65%)] to-[hsl(200,80%,55%)] flex items-center justify-center shadow-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">HabitFlow</h1>
          </div>
          <div className="flex items-center gap-2">
            <ExportShare habits={activeHabits} completions={completions} bestStreak={bestStreak} todayRate={todayRate} />
            <Button variant="ghost" size="icon" onClick={toggleTheme} className="text-muted-foreground hover:text-foreground">
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
            <Button onClick={signOut} variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              <LogOut className="w-4 h-4 mr-2" /> Sign Out
            </Button>
          </div>
        </div>

        {/* Add Habit */}
        <Card className="mb-6 border-[hsl(260,30%,18%)] bg-[hsl(250,40%,10%,0.6)] backdrop-blur-lg">
          <CardContent className="pt-6">
            <AddHabitForm onAdd={(p) => addHabit.mutate(p)} />
          </CardContent>
        </Card>

        {/* Templates toggle + Category filter */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setShowTemplates(!showTemplates)} className="text-muted-foreground hover:text-foreground text-xs">
              {showTemplates ? "Hide Templates" : "📋 Templates"}
            </Button>
            <div className="h-4 w-px bg-border" />
            <div className="flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-muted-foreground" />
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[110px] h-7 text-xs bg-transparent border-[hsl(260,25%,22%)] text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All</SelectItem>
                  {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Templates */}
        {showTemplates && (
          <HabitTemplates onUseTemplate={(t) => addHabit.mutate({ name: t.name, color: t.color, goalType: t.goal_type, goalTarget: t.goal_target, category: t.category })} />
        )}

        {/* Habits List */}
        <div className="space-y-3 mb-10">
          {filteredHabits.length === 0 && (
            <div className="text-center py-16 text-muted-foreground">
              <Target className="w-12 h-12 mx-auto mb-4 opacity-40" />
              <p className="text-lg font-medium">No habits yet</p>
              <p className="text-sm mt-1">Add your first habit above to start tracking!</p>
            </div>
          )}
          {filteredHabits.map((habit) => (
            <HabitItem
              key={habit.id}
              habit={habit}
              isCompleted={isCompleted(habit.id, today)}
              streak={getStreak(habit.id)}
              progress={getGoalProgress(habit)}
              completionNote={getCompletionNote(habit.id, today)}
              onToggle={(note) => toggleCompletion.mutate({ habitId: habit.id, date: today, note })}
              onDelete={() => deleteHabit.mutate(habit.id)}
              onUpdate={(params) => updateHabit.mutate({ id: habit.id, ...params })}
              onArchive={() => updateHabit.mutate({ id: habit.id, archived: true })}
            />
          ))}
        </div>

        {/* Dashboard */}
        <Dashboard
          habits={activeHabits}
          todayRate={todayRate}
          goalsMetCount={goalsMetCount}
          bestStreak={bestStreak}
          weeklyAvg={weeklyAvg}
          weeklyData={weeklyData}
          getGoalProgress={getGoalProgress}
        />

        {/* Monthly Calendar */}
        <MonthlyCalendar habits={activeHabits} isCompleted={isCompleted} />

        {/* Heatmap */}
        <Heatmap habits={activeHabits} last7Days={last7Days} isCompleted={isCompleted}
          onToggle={(habitId, date) => toggleCompletion.mutate({ habitId, date })} />

        {/* Time Tracker */}
        <TimeTracker />

        {/* Archived Habits */}
        <ArchivedHabits
          habits={archivedHabits}
          onRestore={(id) => updateHabit.mutate({ id, archived: false })}
          onDelete={(id) => deleteHabit.mutate(id)}
        />
      </div>
    </div>
  );
};

export default HabitTracker;

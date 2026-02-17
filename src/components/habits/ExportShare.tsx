import { Button } from "@/components/ui/button";
import { Download, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Habit, Completion } from "@/lib/habitTypes";
import { format } from "date-fns";

interface ExportShareProps {
  habits: Habit[];
  completions: Completion[];
  bestStreak: number;
  todayRate: number;
}

const ExportShare = ({ habits, completions, bestStreak, todayRate }: ExportShareProps) => {
  const { toast } = useToast();

  const exportCSV = () => {
    const headers = ["Habit", "Category", "Goal Type", "Goal Target", "Date", "Completed", "Note"];
    const rows: string[][] = [];
    habits.forEach((h) => {
      completions.filter((c) => c.habit_id === h.id).forEach((c) => {
        rows.push([h.name, h.category, h.goal_type, String(h.goal_target), c.completion_date, "Yes", c.note || ""]);
      });
    });
    const csv = [headers.join(","), ...rows.map((r) => r.map((v) => `"${v}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `habitflow-export-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Exported! 📊" });
  };

  const shareProgress = async () => {
    const text = `🎯 HabitFlow Progress\n📊 Today: ${todayRate}% complete\n🔥 Best Streak: ${bestStreak} days\n💪 Tracking ${habits.length} habits`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "HabitFlow Progress", text });
      } catch { /* user cancelled */ }
    } else {
      await navigator.clipboard.writeText(text);
      toast({ title: "Copied to clipboard! 📋" });
    }
  };

  return (
    <div className="flex gap-2">
      <Button variant="ghost" size="sm" onClick={exportCSV} className="text-muted-foreground hover:text-foreground">
        <Download className="w-4 h-4 mr-2" /> Export
      </Button>
      <Button variant="ghost" size="sm" onClick={shareProgress} className="text-muted-foreground hover:text-foreground">
        <Share2 className="w-4 h-4 mr-2" /> Share
      </Button>
    </div>
  );
};

export default ExportShare;

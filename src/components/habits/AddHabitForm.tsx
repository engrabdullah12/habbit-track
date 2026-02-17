import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { COLORS, CATEGORIES } from "@/lib/habitTypes";

interface AddHabitFormProps {
  onAdd: (params: { name: string; color: string; goalType: string; goalTarget: number; category: string; reminderTime?: string }) => void;
}

const AddHabitForm = ({ onAdd }: AddHabitFormProps) => {
  const [name, setName] = useState("");
  const [color, setColor] = useState(COLORS[0]);
  const [goalType, setGoalType] = useState<"daily" | "weekly">("daily");
  const [goalTarget, setGoalTarget] = useState(1);
  const [category, setCategory] = useState("General");
  const [reminderTime, setReminderTime] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAdd({ name, color, goalType, goalTarget, category, reminderTime: reminderTime || undefined });
    setName("");
    setGoalTarget(1);
    setReminderTime("");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex gap-3 items-end">
        <div className="flex-1">
          <Input
            placeholder="Add a new habit..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-[hsl(250,30%,14%)] dark:bg-[hsl(250,30%,14%)] light:bg-white border-[hsl(260,25%,22%)] dark:border-[hsl(260,25%,22%)] text-foreground placeholder:text-muted-foreground focus-visible:ring-[hsl(260,80%,65%)] h-11"
          />
        </div>
        <Button type="submit" disabled={!name.trim()} className="bg-gradient-to-r from-[hsl(260,80%,65%)] to-[hsl(200,80%,55%)] hover:from-[hsl(260,80%,60%)] hover:to-[hsl(200,80%,50%)] h-11 px-5 text-white">
          <Plus className="w-4 h-4 mr-1" /> Add
        </Button>
      </div>
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex gap-1.5">
          {COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className="w-6 h-6 rounded-full transition-all"
              style={{
                backgroundColor: c,
                outline: color === c ? `2px solid ${c}` : "none",
                outlineOffset: "2px",
                transform: color === c ? "scale(1.15)" : "scale(1)",
              }}
            />
          ))}
        </div>
        <div className="h-5 w-px bg-border" />
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-[120px] h-8 text-xs bg-[hsl(250,30%,14%)] border-[hsl(260,25%,22%)] text-foreground">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="h-5 w-px bg-border" />
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground font-medium">Goal:</span>
          <div className="flex rounded-lg overflow-hidden border border-[hsl(260,25%,22%)]">
            <button type="button" onClick={() => { setGoalType("daily"); setGoalTarget(1); }}
              className={`px-3 py-1.5 text-xs font-medium transition-all ${goalType === "daily" ? "bg-[hsl(260,80%,65%)] text-white" : "bg-[hsl(250,30%,14%)] text-muted-foreground"}`}>Daily</button>
            <button type="button" onClick={() => { setGoalType("weekly"); setGoalTarget(5); }}
              className={`px-3 py-1.5 text-xs font-medium transition-all ${goalType === "weekly" ? "bg-[hsl(260,80%,65%)] text-white" : "bg-[hsl(250,30%,14%)] text-muted-foreground"}`}>Weekly</button>
          </div>
          <span className="text-xs text-muted-foreground">×</span>
          <Input type="number" min={1} max={goalType === "daily" ? 1 : 7} value={goalTarget}
            onChange={(e) => setGoalTarget(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-16 h-8 text-center bg-[hsl(250,30%,14%)] border-[hsl(260,25%,22%)] text-foreground text-xs focus-visible:ring-[hsl(260,80%,65%)]" />
          <span className="text-xs text-muted-foreground">{goalType === "daily" ? "time/day" : "days/week"}</span>
        </div>
        <div className="h-5 w-px bg-border" />
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground font-medium">Remind:</span>
          <Input type="time" value={reminderTime} onChange={(e) => setReminderTime(e.target.value)}
            className="w-[100px] h-8 text-xs bg-[hsl(250,30%,14%)] border-[hsl(260,25%,22%)] text-foreground focus-visible:ring-[hsl(260,80%,65%)]" />
        </div>
      </div>
    </form>
  );
};

export default AddHabitForm;

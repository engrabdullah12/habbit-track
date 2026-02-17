import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, Flame, Trophy, Pencil, Archive, MessageSquare, Bell } from "lucide-react";
import { Habit } from "@/lib/habitTypes";
import { COLORS, CATEGORIES } from "@/lib/habitTypes";

interface HabitItemProps {
  habit: Habit;
  isCompleted: boolean;
  streak: number;
  progress: { current: number; target: number; pct: number };
  completionNote: string;
  onToggle: (note?: string) => void;
  onDelete: () => void;
  onUpdate: (params: Partial<Habit>) => void;
  onArchive: () => void;
}

const HabitItem = ({ habit, isCompleted, streak, progress, completionNote, onToggle, onDelete, onUpdate, onArchive }: HabitItemProps) => {
  const [editOpen, setEditOpen] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);
  const [editName, setEditName] = useState(habit.name);
  const [editColor, setEditColor] = useState(habit.color);
  const [editCategory, setEditCategory] = useState(habit.category);
  const [editGoalType, setEditGoalType] = useState(habit.goal_type);
  const [editGoalTarget, setEditGoalTarget] = useState(habit.goal_target);
  const [editReminder, setEditReminder] = useState(habit.reminder_time || "");
  const [note, setNote] = useState("");
  const goalMet = progress.pct >= 100;

  const handleSaveEdit = () => {
    onUpdate({ name: editName, color: editColor, category: editCategory, goal_type: editGoalType, goal_target: editGoalTarget, reminder_time: editReminder || null });
    setEditOpen(false);
  };

  const handleToggleWithNote = () => {
    if (!isCompleted && note.trim()) {
      onToggle(note);
      setNote("");
      setNoteOpen(false);
    } else {
      onToggle();
    }
  };

  return (
    <Card className="border-[hsl(260,30%,18%)] bg-[hsl(250,40%,10%,0.5)] backdrop-blur-sm hover:bg-[hsl(250,40%,12%,0.6)] transition-all group">
      <CardContent className="py-4 px-5 space-y-2">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: habit.color }} />
          <Checkbox
            checked={isCompleted}
            onCheckedChange={handleToggleWithNote}
            className="border-[hsl(260,25%,30%)] data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-[hsl(260,80%,65%)] data-[state=checked]:to-[hsl(200,80%,55%)] data-[state=checked]:border-transparent w-5 h-5"
          />
          <span className={`flex-1 font-medium transition-all ${isCompleted ? "line-through text-muted-foreground" : "text-foreground"}`}>
            {habit.name}
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[hsl(250,30%,15%)] text-muted-foreground font-medium">{habit.category}</span>
          {habit.reminder_time && <Bell className="w-3.5 h-3.5 text-muted-foreground" />}
          {goalMet && <Trophy className="w-4 h-4 text-[hsl(45,90%,55%)]" />}
          {streak > 0 && (
            <span className="flex items-center gap-1 text-sm text-[hsl(30,90%,55%)] font-semibold">
              <Flame className="w-4 h-4" /> {streak}
            </span>
          )}
          <span className="text-xs text-muted-foreground font-medium min-w-[60px] text-right">
            {progress.current}/{progress.target} {habit.goal_type === "daily" ? "today" : "this week"}
          </span>

          {/* Note button */}
          <Dialog open={noteOpen} onOpenChange={setNoteOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground hover:bg-transparent h-8 w-8">
                <MessageSquare className="w-4 h-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[hsl(250,40%,10%)] border-[hsl(260,30%,18%)]">
              <DialogHeader><DialogTitle className="text-foreground">Add note & complete</DialogTitle></DialogHeader>
              <Textarea placeholder="How did it go?" value={note} onChange={(e) => setNote(e.target.value)}
                className="bg-[hsl(250,30%,14%)] border-[hsl(260,25%,22%)] text-foreground" />
              {completionNote && <p className="text-xs text-muted-foreground">Previous note: {completionNote}</p>}
              <Button onClick={handleToggleWithNote} className="bg-gradient-to-r from-[hsl(260,80%,65%)] to-[hsl(200,80%,55%)] text-white">
                {isCompleted ? "Uncomplete" : "Complete with note"}
              </Button>
            </DialogContent>
          </Dialog>

          {/* Edit button */}
          <Dialog open={editOpen} onOpenChange={setEditOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground hover:bg-transparent h-8 w-8">
                <Pencil className="w-4 h-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[hsl(250,40%,10%)] border-[hsl(260,30%,18%)]">
              <DialogHeader><DialogTitle className="text-foreground">Edit Habit</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <Input value={editName} onChange={(e) => setEditName(e.target.value)}
                  className="bg-[hsl(250,30%,14%)] border-[hsl(260,25%,22%)] text-foreground" />
                <div className="flex gap-1.5">
                  {COLORS.map((c) => (
                    <button key={c} type="button" onClick={() => setEditColor(c)}
                      className="w-6 h-6 rounded-full transition-all"
                      style={{ backgroundColor: c, outline: editColor === c ? `2px solid ${c}` : "none", outlineOffset: "2px" }} />
                  ))}
                </div>
                <Select value={editCategory} onValueChange={setEditCategory}>
                  <SelectTrigger className="bg-[hsl(250,30%,14%)] border-[hsl(260,25%,22%)] text-foreground"><SelectValue /></SelectTrigger>
                  <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
                <div className="flex items-center gap-2">
                  <div className="flex rounded-lg overflow-hidden border border-[hsl(260,25%,22%)]">
                    <button type="button" onClick={() => setEditGoalType("daily")}
                      className={`px-3 py-1.5 text-xs font-medium ${editGoalType === "daily" ? "bg-[hsl(260,80%,65%)] text-white" : "bg-[hsl(250,30%,14%)] text-muted-foreground"}`}>Daily</button>
                    <button type="button" onClick={() => setEditGoalType("weekly")}
                      className={`px-3 py-1.5 text-xs font-medium ${editGoalType === "weekly" ? "bg-[hsl(260,80%,65%)] text-white" : "bg-[hsl(250,30%,14%)] text-muted-foreground"}`}>Weekly</button>
                  </div>
                  <Input type="number" min={1} max={7} value={editGoalTarget}
                    onChange={(e) => setEditGoalTarget(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-16 h-8 text-center bg-[hsl(250,30%,14%)] border-[hsl(260,25%,22%)] text-foreground text-xs" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Reminder:</span>
                  <Input type="time" value={editReminder} onChange={(e) => setEditReminder(e.target.value)}
                    className="w-[120px] h-8 text-xs bg-[hsl(250,30%,14%)] border-[hsl(260,25%,22%)] text-foreground" />
                </div>
                <Button onClick={handleSaveEdit} className="w-full bg-gradient-to-r from-[hsl(260,80%,65%)] to-[hsl(200,80%,55%)] text-white">Save</Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Archive button */}
          <Button variant="ghost" size="icon" onClick={onArchive}
            className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-[hsl(45,90%,55%)] hover:bg-transparent h-8 w-8">
            <Archive className="w-4 h-4" />
          </Button>

          {/* Delete button */}
          <Button variant="ghost" size="icon" onClick={onDelete}
            className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive hover:bg-transparent h-8 w-8">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
        <div className="ml-12">
          <Progress value={progress.pct} className="h-1.5 bg-[hsl(250,30%,15%)]"
            style={{ ["--progress-color" as string]: goalMet ? "hsl(150,70%,45%)" : habit.color }} />
        </div>
      </CardContent>
    </Card>
  );
};

export default HabitItem;

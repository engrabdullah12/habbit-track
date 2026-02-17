import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArchiveRestore, Trash2 } from "lucide-react";
import { Habit } from "@/lib/habitTypes";

interface ArchivedHabitsProps {
  habits: Habit[];
  onRestore: (id: string) => void;
  onDelete: (id: string) => void;
}

const ArchivedHabits = ({ habits, onRestore, onDelete }: ArchivedHabitsProps) => {
  if (habits.length === 0) return null;

  return (
    <Card className="border-[hsl(260,30%,18%)] bg-[hsl(250,40%,10%,0.5)] backdrop-blur-sm mb-8">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold text-foreground">Archived Habits</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {habits.map((habit) => (
          <div key={habit.id} className="flex items-center gap-3 p-3 rounded-lg bg-[hsl(250,30%,14%)]">
            <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: habit.color }} />
            <span className="flex-1 text-sm text-muted-foreground">{habit.name}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[hsl(250,30%,18%)] text-muted-foreground">{habit.category}</span>
            <Button variant="ghost" size="icon" onClick={() => onRestore(habit.id)} className="h-8 w-8 text-muted-foreground hover:text-[hsl(150,70%,50%)]">
              <ArchiveRestore className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => onDelete(habit.id)} className="h-8 w-8 text-muted-foreground hover:text-destructive">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default ArchivedHabits;

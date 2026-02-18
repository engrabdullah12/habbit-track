import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { Habit } from "@/lib/habitTypes";

interface HeatmapProps {
  habits: Habit[];
  last7Days: Date[];
  isCompleted: (habitId: string, date: string) => boolean;
  onToggle: (habitId: string, date: string) => void;
}

const Heatmap = ({ habits, last7Days, isCompleted, onToggle }: HeatmapProps) => {
  if (habits.length === 0) return null;

  return (
    <Card className="border-[hsl(260,30%,18%)] bg-[hsl(250,40%,10%,0.5)] backdrop-blur-sm">
      <CardHeader className="pb-2"><CardTitle className="text-base font-semibold text-foreground">Last 7 Days</CardTitle></CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left text-xs text-foreground/70 font-semibold pb-3 pr-4">Habit</th>
                {last7Days.map((d, i) => (
                  <th key={i} className="text-center text-xs text-foreground/70 font-semibold pb-3 px-1">{format(d, "EEE")}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {habits.map((habit) => (
                <tr key={habit.id}>
                  <td className="text-sm text-foreground/80 font-medium pr-4 py-1.5 max-w-[120px] truncate">{habit.name}</td>
                  {last7Days.map((d, i) => {
                    const dateStr = format(d, "yyyy-MM-dd");
                    const done = isCompleted(habit.id, dateStr);
                    return (
                      <td key={i} className="text-center px-1 py-1.5">
                        <button onClick={() => onToggle(habit.id, dateStr)}
                          className="w-8 h-8 rounded-lg transition-all mx-auto flex items-center justify-center"
                          style={{ backgroundColor: done ? habit.color : "hsl(250,30%,18%)", opacity: done ? 1 : 0.5 }}>
                          {done && <span className="text-white text-sm font-bold">✓</span>}
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
  );
};

export default Heatmap;

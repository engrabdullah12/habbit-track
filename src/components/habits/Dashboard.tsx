import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Target, Flame, TrendingUp, Trophy } from "lucide-react";
import { Habit } from "@/lib/habitTypes";

interface DashboardProps {
  habits: Habit[];
  todayRate: number;
  goalsMetCount: number;
  bestStreak: number;
  weeklyAvg: number;
  weeklyData: { day: string; rate: number }[];
  getGoalProgress: (h: Habit) => { current: number; target: number; pct: number };
}

const Dashboard = ({ habits, todayRate, goalsMetCount, bestStreak, weeklyAvg, weeklyData, getGoalProgress }: DashboardProps) => {
  if (habits.length === 0) return null;

  const stats = [
    { label: "Today", value: `${todayRate}%`, icon: Target, color: "from-[hsl(260,80%,65%)] to-[hsl(280,80%,55%)]" },
    { label: "Goals Met", value: `${goalsMetCount}/${habits.length}`, icon: Trophy, color: "from-[hsl(45,90%,50%)] to-[hsl(30,90%,50%)]" },
    { label: "Best Streak", value: `${bestStreak}d`, icon: Flame, color: "from-[hsl(20,90%,55%)] to-[hsl(40,90%,50%)]" },
    { label: "Weekly Avg", value: `${weeklyAvg}%`, icon: TrendingUp, color: "from-[hsl(160,70%,45%)] to-[hsl(180,70%,40%)]" },
  ];

  return (
    <>
      <div className="flex items-center gap-2 mb-6">
        <TrendingUp className="w-5 h-5 text-[hsl(260,80%,70%)]" />
        <h2 className="text-xl font-bold text-foreground">Dashboard</h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-[hsl(260,30%,18%)] bg-[hsl(250,40%,10%,0.5)] backdrop-blur-sm overflow-hidden">
            <CardContent className="p-5 relative">
              <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${stat.color} opacity-10 rounded-bl-full`} />
              <stat.icon className="w-5 h-5 text-muted-foreground mb-2" />
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground font-medium mt-1">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Goal Progress */}
      <Card className="border-[hsl(260,30%,18%)] bg-[hsl(250,40%,10%,0.5)] backdrop-blur-sm mb-8">
        <CardHeader className="pb-2"><CardTitle className="text-base font-semibold text-foreground">Goal Progress</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {habits.map((habit) => {
            const progress = getGoalProgress(habit);
            const goalMet = progress.pct >= 100;
            return (
              <div key={habit.id} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: habit.color }} />
                    <span className="text-sm text-muted-foreground font-medium">{habit.name}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[hsl(250,30%,15%)] text-muted-foreground font-medium uppercase">{habit.goal_type}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {goalMet && <Trophy className="w-3.5 h-3.5 text-[hsl(45,90%,55%)]" />}
                    <span className="text-sm text-muted-foreground font-semibold">{progress.current}/{progress.target}</span>
                  </div>
                </div>
                <Progress value={progress.pct} className="h-2 bg-[hsl(250,30%,15%)]"
                  style={{ ["--progress-color" as string]: goalMet ? "hsl(150,70%,45%)" : habit.color }} />
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Weekly Chart */}
      <Card className="border-[hsl(260,30%,18%)] bg-[hsl(250,40%,10%,0.5)] backdrop-blur-sm mb-8">
        <CardHeader className="pb-2"><CardTitle className="text-base font-semibold text-foreground">This Week</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-end justify-between gap-3 h-40">
            {weeklyData.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <span className="text-xs text-muted-foreground font-medium">{d.rate}%</span>
                <div className="w-full bg-[hsl(250,30%,15%)] rounded-lg overflow-hidden" style={{ height: "100px" }}>
                  <div className="w-full rounded-lg bg-gradient-to-t from-[hsl(260,80%,65%)] to-[hsl(200,80%,55%)] transition-all duration-500"
                    style={{ height: `${d.rate}%`, marginTop: `${100 - d.rate}%` }} />
                </div>
                <span className="text-xs text-muted-foreground font-medium">{d.day}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default Dashboard;

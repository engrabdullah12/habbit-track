import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock, Play, Square, Trash2, Timer } from "lucide-react";
import { useTimeTracker, TIME_CATEGORIES, TIME_COLORS, TimeEntry } from "@/hooks/useTimeTracker";
import { format } from "date-fns";

const formatDuration = (seconds: number) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};

const LiveTimer = ({ startedAt }: { startedAt: string }) => {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const calc = () => Math.round((Date.now() - new Date(startedAt).getTime()) / 1000);
    setElapsed(calc());
    const interval = setInterval(() => setElapsed(calc()), 1000);
    return () => clearInterval(interval);
  }, [startedAt]);
  return <span className="font-mono text-2xl font-bold text-foreground">{formatDuration(elapsed)}</span>;
};

const TimeTracker = () => {
  const { entries, runningEntry, startTimer, stopTimer, deleteEntry, todayTotalSeconds } = useTimeTracker();
  const [taskName, setTaskName] = useState("");
  const [category, setCategory] = useState("General");
  const [color, setColor] = useState(TIME_COLORS[0]);

  const handleStart = () => {
    if (!taskName.trim()) return;
    startTimer.mutate({ taskName: taskName.trim(), category, color });
    setTaskName("");
  };

  const completedEntries = entries.filter((e) => !e.is_running).slice(0, 10);

  return (
    <>
      <div className="flex items-center gap-2 mb-6 mt-10">
        <Timer className="w-5 h-5 text-[hsl(260,80%,70%)]" />
        <h2 className="text-xl font-bold text-foreground">Time Tracker</h2>
      </div>

      {/* Running Timer */}
      {runningEntry && (
        <Card className="mb-4 border-[hsl(260,30%,18%)] bg-[hsl(250,40%,10%,0.6)] backdrop-blur-lg overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[hsl(260,80%,65%)] to-[hsl(200,80%,55%)] animate-pulse" />
          <CardContent className="pt-6 relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full animate-pulse" style={{ backgroundColor: runningEntry.color }} />
                <div>
                  <p className="font-semibold text-foreground">{runningEntry.task_name}</p>
                  <p className="text-xs text-muted-foreground">{runningEntry.category}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <LiveTimer startedAt={runningEntry.started_at} />
                <Button size="sm" variant="destructive" onClick={() => stopTimer.mutate(runningEntry.id)} className="gap-1.5">
                  <Square className="w-3.5 h-3.5" /> Stop
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Start New Timer */}
      {!runningEntry && (
        <Card className="mb-4 border-[hsl(260,30%,18%)] bg-[hsl(250,40%,10%,0.6)] backdrop-blur-lg">
          <CardContent className="pt-6">
            <div className="flex gap-2 items-end flex-wrap">
              <div className="flex-1 min-w-[180px]">
                <Input
                  placeholder="What are you working on?"
                  value={taskName}
                  onChange={(e) => setTaskName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleStart()}
                  className="bg-[hsl(250,30%,14%)] border-[hsl(260,25%,22%)] text-foreground placeholder:text-muted-foreground"
                />
              </div>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-[140px] bg-[hsl(250,30%,14%)] border-[hsl(260,25%,22%)] text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIME_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
              <div className="flex gap-1">
                {TIME_COLORS.map((c) => (
                  <button key={c} onClick={() => setColor(c)}
                    className={`w-6 h-6 rounded-full transition-transform ${color === c ? "scale-125 ring-2 ring-white/40" : "hover:scale-110"}`}
                    style={{ backgroundColor: c }} />
                ))}
              </div>
              <Button onClick={handleStart} disabled={!taskName.trim()} className="bg-gradient-to-r from-[hsl(260,80%,65%)] to-[hsl(200,80%,55%)] text-white gap-1.5">
                <Play className="w-3.5 h-3.5" /> Start
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Today's Summary */}
      <Card className="mb-4 border-[hsl(260,30%,18%)] bg-[hsl(250,40%,10%,0.5)] backdrop-blur-sm">
        <CardContent className="py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground font-medium">Today's Total</span>
          </div>
          <span className="font-mono text-lg font-bold text-foreground">{formatDuration(todayTotalSeconds)}</span>
        </CardContent>
      </Card>

      {/* Recent Entries */}
      {completedEntries.length > 0 && (
        <Card className="mb-8 border-[hsl(260,30%,18%)] bg-[hsl(250,40%,10%,0.5)] backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-foreground">Recent Sessions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {completedEntries.map((entry) => (
              <div key={entry.id} className="flex items-center justify-between py-2 px-3 rounded-lg bg-[hsl(250,30%,12%,0.5)] group">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                  <div>
                    <p className="text-sm font-medium text-foreground">{entry.task_name}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {entry.category} · {format(new Date(entry.started_at), "MMM d, h:mm a")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm text-muted-foreground">{formatDuration(entry.duration_seconds || 0)}</span>
                  <Button variant="ghost" size="icon" className="w-7 h-7 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive"
                    onClick={() => deleteEntry.mutate(entry.id)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default TimeTracker;

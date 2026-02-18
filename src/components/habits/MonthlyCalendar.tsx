import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths, isSameMonth } from "date-fns";
import { Habit } from "@/lib/habitTypes";

interface MonthlyCalendarProps {
  habits: Habit[];
  isCompleted: (habitId: string, date: string) => boolean;
}

const MonthlyCalendar = ({ habits, isCompleted }: MonthlyCalendarProps) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDay = getDay(monthStart); // 0=Sun

  const getDayRate = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    if (habits.length === 0) return 0;
    const completed = habits.filter((h) => isCompleted(h.id, dateStr)).length;
    return Math.round((completed / habits.length) * 100);
  };

  const getColor = (rate: number) => {
    if (rate === 0) return "hsl(250,30%,18%)";
    if (rate < 33) return "hsl(270,50%,40%)";
    if (rate < 66) return "hsl(260,65%,55%)";
    if (rate < 100) return "hsl(255,75%,62%)";
    return "hsl(150,65%,42%)";
  };

  const getTextColor = (rate: number) => {
    if (rate === 0) return "hsl(260,15%,55%)";
    return "hsl(0,0%,100%)";
  };

  return (
    <Card className="border-[hsl(260,30%,18%)] bg-[hsl(250,40%,10%,0.5)] backdrop-blur-sm mb-8">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold text-foreground">Monthly View</CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="h-8 w-8 text-muted-foreground hover:text-foreground">
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm font-medium text-foreground min-w-[120px] text-center">{format(currentMonth, "MMMM yyyy")}</span>
            <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="h-8 w-8 text-muted-foreground hover:text-foreground">
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div key={d} className="text-center text-xs text-muted-foreground font-medium py-2">{d}</div>
          ))}
          {Array.from({ length: startDay }).map((_, i) => <div key={`empty-${i}`} />)}
          {days.map((day) => {
            const rate = getDayRate(day);
            const isToday = format(day, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");
            return (
              <div key={day.toISOString()} className="aspect-square flex items-center justify-center relative">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-semibold transition-all ${isToday ? "ring-2 ring-[hsl(260,80%,65%)]" : ""}`}
                  style={{ backgroundColor: getColor(rate), color: getTextColor(rate) }}>
                  {format(day, "d")}
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex items-center gap-2 mt-4 justify-center">
          <span className="text-xs text-muted-foreground">Less</span>
          {[0, 25, 50, 75, 100].map((r) => (
            <div key={r} className="w-4 h-4 rounded" style={{ backgroundColor: getColor(r) }} />
          ))}
          <span className="text-xs text-muted-foreground">More</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default MonthlyCalendar;

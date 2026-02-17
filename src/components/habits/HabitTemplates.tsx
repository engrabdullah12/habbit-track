import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HABIT_TEMPLATES } from "@/lib/habitTypes";
import { Plus, Zap } from "lucide-react";

interface HabitTemplatesProps {
  onUseTemplate: (t: typeof HABIT_TEMPLATES[0]) => void;
}

const HabitTemplates = ({ onUseTemplate }: HabitTemplatesProps) => {
  return (
    <Card className="border-[hsl(260,30%,18%)] bg-[hsl(250,40%,10%,0.5)] backdrop-blur-sm mb-8">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-[hsl(45,90%,55%)]" />
          <CardTitle className="text-base font-semibold text-foreground">Quick Start Templates</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {HABIT_TEMPLATES.map((t, i) => (
            <button key={i} onClick={() => onUseTemplate(t)}
              className="flex items-center gap-3 p-3 rounded-lg bg-[hsl(250,30%,14%)] hover:bg-[hsl(250,30%,18%)] transition-all text-left group">
              <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: t.color }} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.category} · {t.goal_type} × {t.goal_target}</p>
              </div>
              <Plus className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default HabitTemplates;

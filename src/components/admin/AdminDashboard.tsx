import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Users, Clock, Play } from "lucide-react";
import { format } from "date-fns";
import { useMemo, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AdminUser { id: string; email: string; created_at: string; }
interface TimeEntry {
  id: string; user_id: string; task_name: string; category: string; color: string;
  started_at: string; ended_at: string | null; duration_seconds: number | null; is_running: boolean;
}

const formatDuration = (seconds: number) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};

const AdminDashboard = () => {
  const [userFilter, setUserFilter] = useState<string>("all");

  const { data: users = [] } = useQuery({
    queryKey: ["admin_users"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("admin_list_users");
      if (error) throw error;
      return (data ?? []) as AdminUser[];
    },
  });

  const { data: entries = [] } = useQuery({
    queryKey: ["admin_time_entries"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("time_entries")
        .select("*")
        .order("started_at", { ascending: false })
        .limit(500);
      if (error) throw error;
      return data as TimeEntry[];
    },
    refetchInterval: 15000,
  });

  const emailById = useMemo(() => {
    const map = new Map<string, string>();
    users.forEach((u) => map.set(u.id, u.email));
    return map;
  }, [users]);

  const filtered = userFilter === "all" ? entries : entries.filter((e) => e.user_id === userFilter);
  const runningNow = entries.filter((e) => e.is_running);

  // Per-user aggregates
  const perUser = useMemo(() => {
    const agg = new Map<string, { total: number; count: number }>();
    entries.forEach((e) => {
      const secs = e.is_running
        ? Math.round((Date.now() - new Date(e.started_at).getTime()) / 1000)
        : e.duration_seconds || 0;
      const cur = agg.get(e.user_id) || { total: 0, count: 0 };
      cur.total += secs;
      cur.count += 1;
      agg.set(e.user_id, cur);
    });
    return Array.from(agg.entries()).map(([uid, v]) => ({
      userId: uid,
      email: emailById.get(uid) || uid.slice(0, 8),
      total: v.total,
      count: v.count,
    })).sort((a, b) => b.total - a.total);
  }, [entries, emailById]);

  return (
    <div className="mb-10">
      <div className="flex items-center gap-2 mb-4">
        <Shield className="w-5 h-5 text-[hsl(45,90%,60%)]" />
        <h2 className="text-xl font-bold text-foreground">Admin — All Users</h2>
        <span className="text-xs px-2 py-0.5 rounded-full bg-[hsl(45,80%,20%)] text-[hsl(45,90%,70%)] border border-[hsl(45,60%,30%)]">
          {users.length} users
        </span>
      </div>

      {/* Currently Running */}
      <Card className="mb-4 border-[hsl(260,30%,18%)] bg-[hsl(250,40%,10%,0.6)] backdrop-blur-lg">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
            <Play className="w-4 h-4 text-emerald-400 animate-pulse" /> Currently Working ({runningNow.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {runningNow.length === 0 && <p className="text-sm text-muted-foreground">No one is running a timer right now.</p>}
          {runningNow.map((e) => (
            <div key={e.id} className="flex items-center justify-between py-2 px-3 rounded-lg bg-[hsl(250,30%,12%,0.5)]">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ backgroundColor: e.color }} />
                <div>
                  <p className="text-sm font-medium text-foreground">{e.task_name}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {emailById.get(e.user_id) || "Unknown"} · {e.category} · started {format(new Date(e.started_at), "h:mm a")}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Per-user totals */}
      <Card className="mb-4 border-[hsl(260,30%,18%)] bg-[hsl(250,40%,10%,0.6)] backdrop-blur-lg">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
            <Users className="w-4 h-4" /> Time by User
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {perUser.length === 0 && <p className="text-sm text-muted-foreground">No time entries yet.</p>}
          {perUser.map((u) => (
            <div key={u.userId} className="flex items-center justify-between py-2 px-3 rounded-lg bg-[hsl(250,30%,12%,0.5)]">
              <div>
                <p className="text-sm font-medium text-foreground">{u.email}</p>
                <p className="text-[11px] text-muted-foreground">{u.count} sessions</p>
              </div>
              <span className="font-mono text-sm text-foreground">{formatDuration(u.total)}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* All sessions with filter */}
      <Card className="border-[hsl(260,30%,18%)] bg-[hsl(250,40%,10%,0.6)] backdrop-blur-lg">
        <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
            <Clock className="w-4 h-4" /> All Sessions
          </CardTitle>
          <Select value={userFilter} onValueChange={setUserFilter}>
            <SelectTrigger className="w-[220px] h-8 text-xs bg-[hsl(250,30%,14%)] border-[hsl(260,25%,22%)] text-foreground">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All users</SelectItem>
              {users.map((u) => <SelectItem key={u.id} value={u.id}>{u.email}</SelectItem>)}
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent className="space-y-1.5 max-h-[500px] overflow-y-auto">
          {filtered.length === 0 && <p className="text-sm text-muted-foreground">No entries.</p>}
          {filtered.map((e) => (
            <div key={e.id} className="flex items-center justify-between py-2 px-3 rounded-lg bg-[hsl(250,30%,12%,0.5)]">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: e.color }} />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{e.task_name}</p>
                  <p className="text-[11px] text-muted-foreground truncate">
                    {emailById.get(e.user_id) || "Unknown"} · {e.category} · {format(new Date(e.started_at), "MMM d, h:mm a")}
                  </p>
                </div>
              </div>
              <span className="font-mono text-sm text-muted-foreground flex-shrink-0 ml-3">
                {e.is_running ? "running…" : formatDuration(e.duration_seconds || 0)}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;

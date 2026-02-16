import { useAuth } from "@/hooks/useAuth";
import Auth from "@/pages/Auth";
import HabitTracker from "@/components/HabitTracker";

const Index = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[hsl(250,60%,8%)] via-[hsl(260,50%,12%)] to-[hsl(240,40%,6%)]">
        <div className="w-8 h-8 border-2 border-[hsl(260,80%,65%)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return <Auth />;
  return <HabitTracker />;
};

export default Index;

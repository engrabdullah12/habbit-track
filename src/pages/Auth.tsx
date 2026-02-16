import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Zap, Mail, Lock, ArrowRight } from "lucide-react";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        toast({ title: "Login failed", description: error.message, variant: "destructive" });
      }
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: window.location.origin },
      });
      if (error) {
        toast({ title: "Signup failed", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Check your email", description: "We sent you a confirmation link." });
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[hsl(250,60%,8%)] via-[hsl(260,50%,12%)] to-[hsl(240,40%,6%)] p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[hsl(260,80%,50%,0.08)] rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[hsl(200,80%,50%,0.06)] rounded-full blur-3xl" />
      </div>

      <Card className="w-full max-w-md border-[hsl(260,30%,20%)] bg-[hsl(250,40%,10%,0.8)] backdrop-blur-xl shadow-2xl relative z-10">
        <CardHeader className="text-center space-y-3 pb-2">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br from-[hsl(260,80%,65%)] to-[hsl(200,80%,55%)] flex items-center justify-center shadow-lg shadow-[hsl(260,80%,50%,0.3)]">
            <Zap className="w-7 h-7 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-white tracking-tight">
            {isLogin ? "Welcome back" : "Create account"}
          </CardTitle>
          <CardDescription className="text-[hsl(260,20%,60%)]">
            {isLogin ? "Sign in to track your habits" : "Start building better habits today"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAuth} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-4 h-4 text-[hsl(260,20%,50%)]" />
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="pl-10 bg-[hsl(250,30%,15%)] border-[hsl(260,25%,22%)] text-white placeholder:text-[hsl(260,15%,40%)] focus-visible:ring-[hsl(260,80%,65%)]"
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-4 h-4 text-[hsl(260,20%,50%)]" />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="pl-10 bg-[hsl(250,30%,15%)] border-[hsl(260,25%,22%)] text-white placeholder:text-[hsl(260,15%,40%)] focus-visible:ring-[hsl(260,80%,65%)]"
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[hsl(260,80%,65%)] to-[hsl(200,80%,55%)] hover:from-[hsl(260,80%,60%)] hover:to-[hsl(200,80%,50%)] text-white font-semibold h-11 shadow-lg shadow-[hsl(260,80%,50%,0.25)]"
            >
              {loading ? "Loading..." : isLogin ? "Sign In" : "Sign Up"}
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </form>
          <p className="text-center text-sm text-[hsl(260,15%,50%)] mt-6">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-[hsl(260,80%,70%)] hover:text-[hsl(260,80%,80%)] font-medium transition-colors"
            >
              {isLogin ? "Sign Up" : "Sign In"}
            </button>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;

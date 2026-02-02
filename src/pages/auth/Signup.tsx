import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MessageSquare, Eye, EyeOff, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

const features = ["Pre-built WhatsApp bots", "AI-powered responses", "Order management", "Analytics dashboard"];

export default function Signup() {
  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    
    setIsLoading(true);
    const { error } = await signUp(email, password, businessName);
    
    if (error) {
      toast.error(error.message || "Failed to create account");
      setIsLoading(false);
    } else {
      // Create the business for this user
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('businesses').insert({ user_id: user.id, name: businessName });
      }
      toast.success("Account created! Please check your email to verify.");
      navigate("/dashboard");
    }
  };

  return (
    <div className="flex min-h-screen">
      <div className="hidden lg:flex lg:w-1/2 lg:flex-col lg:justify-center gradient-hero p-12">
        <div className="mx-auto max-w-md">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-foreground/20 backdrop-blur-sm">
              <MessageSquare className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-primary-foreground">Whatsbott</span>
          </div>
          <h1 className="text-3xl font-bold text-primary-foreground">Start automating your WhatsApp business today</h1>
          <p className="mt-4 text-lg text-primary-foreground/80">Join hundreds of businesses using our platform to handle customer conversations.</p>
          <div className="mt-8 space-y-3">
            {features.map((feature) => (
              <div key={feature} className="flex items-center gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-foreground/20">
                  <Check className="h-4 w-4 text-primary-foreground" />
                </div>
                <span className="text-primary-foreground">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex w-full flex-col justify-center px-4 py-12 sm:px-6 lg:w-1/2 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm">
          <div className="flex items-center gap-3 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
              <MessageSquare className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">Whatsbott</span>
          </div>

          <h2 className="mt-8 text-2xl font-bold tracking-tight text-foreground lg:mt-0">Create your account</h2>
          <p className="mt-2 text-sm text-muted-foreground">Start your 14-day free trial. No credit card required.</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="businessName">Business name</Label>
                <Input id="businessName" type="text" value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder="Your Business Name" className="mt-2" required />
              </div>
              <div>
                <Label htmlFor="email">Email address</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="mt-2" required />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <div className="relative mt-2">
                  <Input id="password" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Create a strong password" required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <p className="mt-1.5 text-xs text-muted-foreground">Must be at least 8 characters</p>
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>{isLoading ? "Creating account..." : "Create account"}</Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account? <Link to="/login" className="font-medium text-primary hover:text-primary/80">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

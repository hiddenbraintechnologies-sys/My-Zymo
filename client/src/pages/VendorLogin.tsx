import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Eye, EyeOff, Store } from "lucide-react";
import { SiGoogle } from "react-icons/si";
import logoUrl from "@assets/generated_images/myzymo_celebration_app_logo.png";

export default function VendorLogin() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  const loginMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      await apiRequest("/api/vendor/login", "POST", data);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Welcome back!",
        description: "You have successfully logged in to your vendor dashboard.",
      });
      navigate("/vendor/dashboard");
    },
    onError: (error: any) => {
      toast({
        title: "Login failed",
        description: error.message || "Invalid username or password.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSocialLogin = () => {
    window.location.href = "/api/vendor/auth/login";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/10 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4 text-center">
          <div className="flex flex-col items-center">
            <div className="relative">
              <img src={logoUrl} alt="Myzymo" className="w-24 h-24" />
              <div className="absolute -bottom-2 -right-2 bg-primary rounded-full p-2">
                <Store className="h-4 w-4 text-primary-foreground" />
              </div>
            </div>
            <span className="font-heading font-bold text-2xl mt-2">Myzymo</span>
            <span className="text-sm text-primary font-medium">Bringing People Together</span>
          </div>
          <CardTitle className="text-3xl font-heading">Vendor Login</CardTitle>
          <CardDescription>
            Log in to manage your vendor dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleSocialLogin}
                data-testid="button-social-login"
              >
                <SiGoogle className="mr-2 h-4 w-4" />
                Continue with Social Login
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                Google • GitHub • X (Twitter) • Apple • Email
              </p>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username or Email</Label>
                <Input
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  data-testid="input-username"
                  placeholder="Enter your username or email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    required
                    data-testid="input-password"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-transparent text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                    data-testid="button-toggle-password"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={loginMutation.isPending}
                data-testid="button-login"
              >
                {loginMutation.isPending ? "Logging in..." : "Log In to Vendor Dashboard"}
              </Button>
            </form>

            <div className="text-center text-sm">
              Don't have a vendor account?{" "}
              <Button
                variant="ghost"
                className="p-0 h-auto"
                onClick={() => navigate("/vendor/signup")}
                data-testid="link-signup"
              >
                Register as vendor
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

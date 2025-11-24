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
import { startAuthentication } from "@simplewebauthn/browser";
import { SiGoogle, SiFacebook } from "react-icons/si";
import { Fingerprint, Eye, EyeOff } from "lucide-react";
import { FaXTwitter } from "react-icons/fa6";
import logoUrl from "@assets/generated_images/myzymo_celebration_app_logo.png";

export default function Login() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [email, setEmail] = useState("");
  const [showBiometric, setShowBiometric] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const loginMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      await apiRequest("/api/auth/login", "POST", data);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Welcome back!",
        description: "You have successfully logged in.",
      });
      navigate("/");
    },
    onError: (error: any) => {
      toast({
        title: "Login failed",
        description: error.message || "Invalid username or password.",
        variant: "destructive",
      });
    },
  });

  const biometricLoginMutation = useMutation({
    mutationFn: async (email: string) => {
      // Get authentication options
      const options = await apiRequest<any>("/api/webauthn/auth/options", "POST", { email });
      
      // Start biometric authentication
      const authResponse = await startAuthentication(options);
      
      // Verify authentication
      await apiRequest("/api/webauthn/auth/verify", "POST", authResponse);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Welcome back!",
        description: "Biometric authentication successful.",
      });
      navigate("/");
    },
    onError: (error: any) => {
      toast({
        title: "Biometric login failed",
        description: error.message || "Failed to authenticate with biometrics.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate(formData);
  };

  const handleBiometricLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({
        title: "Email required",
        description: "Please enter your email to use biometric login.",
        variant: "destructive",
      });
      return;
    }
    biometricLoginMutation.mutate(email);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSocialLogin = (provider: string) => {
    window.location.href = `/api/auth/${provider}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/10 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4 text-center">
          <div className="flex justify-center">
            <img src={logoUrl} alt="Myzymo" className="w-20 h-20" />
          </div>
          <CardTitle className="text-3xl font-heading">Welcome Back</CardTitle>
          <CardDescription>
            Log in to continue planning your celebrations
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!showBiometric ? (
            <div className="space-y-4">
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
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                      data-testid="button-toggle-password"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={loginMutation.isPending}
                  data-testid="button-login"
                >
                  {loginMutation.isPending ? "Logging in..." : "Log In"}
                </Button>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant="outline"
                  onClick={() => handleSocialLogin("google")}
                  data-testid="button-google-login"
                  className="gap-1"
                >
                  <SiGoogle className="h-4 w-4" />
                  <span className="sr-only">Google</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleSocialLogin("facebook")}
                  data-testid="button-facebook-login"
                  className="gap-1"
                >
                  <SiFacebook className="h-4 w-4" />
                  <span className="sr-only">Facebook</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleSocialLogin("twitter")}
                  data-testid="button-twitter-login"
                  className="gap-1"
                >
                  <FaXTwitter className="h-4 w-4" />
                  <span className="sr-only">Twitter</span>
                </Button>
              </div>

              <Button
                variant="ghost"
                onClick={() => setShowBiometric(true)}
                className="w-full gap-2"
                data-testid="button-show-biometric"
              >
                <Fingerprint className="h-4 w-4" />
                Use Biometric Login
              </Button>

              <div className="text-center text-sm">
                Don't have an account?{" "}
                <Button
                  variant="link"
                  className="p-0"
                  onClick={() => navigate("/signup")}
                  data-testid="link-signup"
                >
                  Sign up
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <form onSubmit={handleBiometricLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    data-testid="input-email-biometric"
                    placeholder="Enter your email"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full gap-2"
                  disabled={biometricLoginMutation.isPending}
                  data-testid="button-biometric-login"
                >
                  {biometricLoginMutation.isPending ? (
                    "Authenticating..."
                  ) : (
                    <>
                      <Fingerprint className="h-4 w-4" />
                      Login with Biometrics
                    </>
                  )}
                </Button>
              </form>

              <Button
                variant="ghost"
                onClick={() => setShowBiometric(false)}
                className="w-full"
                data-testid="button-back-to-password"
              >
                Back to password login
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

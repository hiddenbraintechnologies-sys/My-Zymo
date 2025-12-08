import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { SiGoogle } from "react-icons/si";
import { Eye, EyeOff } from "lucide-react";
import logoUrl from "@assets/generated_images/myzymo_celebration_app_logo.png";

// Common email domain typos and their corrections
const EMAIL_DOMAIN_TYPOS: Record<string, string> = {
  // Gmail typos
  "gmaill.com": "gmail.com",
  "gmial.com": "gmail.com",
  "gmal.com": "gmail.com",
  "gmali.com": "gmail.com",
  "gmai.com": "gmail.com",
  "gmailcom": "gmail.com",
  "gmail.co": "gmail.com",
  "gmail.om": "gmail.com",
  "gmaik.com": "gmail.com",
  "gamil.com": "gmail.com",
  "gnail.com": "gmail.com",
  "gimail.com": "gmail.com",
  "gemail.com": "gmail.com",
  "g]mail.com": "gmail.com",
  // Yahoo typos
  "yaho.com": "yahoo.com",
  "yahooo.com": "yahoo.com",
  "yahho.com": "yahoo.com",
  "yaoo.com": "yahoo.com",
  "yhoo.com": "yahoo.com",
  "yhaoo.com": "yahoo.com",
  "yahoo.co": "yahoo.com",
  "yahoo.om": "yahoo.com",
  "yahooo.co.in": "yahoo.co.in",
  "yaho.co.in": "yahoo.co.in",
  // Hotmail typos
  "hotmal.com": "hotmail.com",
  "hotmial.com": "hotmail.com",
  "hotmai.com": "hotmail.com",
  "hotmaill.com": "hotmail.com",
  "hotmil.com": "hotmail.com",
  "hotamail.com": "hotmail.com",
  "homail.com": "hotmail.com",
  "htmail.com": "hotmail.com",
  "hotmail.co": "hotmail.com",
  // Outlook typos
  "outlok.com": "outlook.com",
  "outloo.com": "outlook.com",
  "outloook.com": "outlook.com",
  "outlookk.com": "outlook.com",
  "oulook.com": "outlook.com",
  "outllook.com": "outlook.com",
  "outlook.co": "outlook.com",
  // Rediffmail typos (popular in India)
  "redifmail.com": "rediffmail.com",
  "rediff.com": "rediffmail.com",
  "redifmaill.com": "rediffmail.com",
  // iCloud typos
  "icoud.com": "icloud.com",
  "iclod.com": "icloud.com",
  "icloudd.com": "icloud.com",
  // Live.com typos
  "liv.com": "live.com",
  "livee.com": "live.com",
  // Common TLD typos
  ".con": ".com",
  ".cpm": ".com",
  ".vom": ".com",
  ".xom": ".com",
};

// Function to check for email domain typos
function checkEmailTypo(email: string): string | null {
  if (!email.includes("@")) return null;
  
  const domain = email.split("@")[1]?.toLowerCase();
  if (!domain) return null;
  
  // Check exact domain match
  if (EMAIL_DOMAIN_TYPOS[domain]) {
    return `Did you mean ${email.split("@")[0]}@${EMAIL_DOMAIN_TYPOS[domain]}?`;
  }
  
  // Check TLD typos
  for (const [typo, correct] of Object.entries(EMAIL_DOMAIN_TYPOS)) {
    if (typo.startsWith(".") && domain.endsWith(typo)) {
      const correctedDomain = domain.slice(0, -typo.length) + correct;
      return `Did you mean ${email.split("@")[0]}@${correctedDomain}?`;
    }
  }
  
  return null;
}

// Zod schema for signup validation
const signupFormSchema = z.object({
  firstName: z.string()
    .min(1, "First name is required")
    .min(2, "First name must be at least 2 characters")
    .regex(/^[a-zA-Z\s'-]+$/, "First name can only contain letters, spaces, hyphens, and apostrophes"),
  lastName: z.string()
    .min(1, "Last name is required")
    .min(2, "Last name must be at least 2 characters")
    .regex(/^[a-zA-Z\s'-]+$/, "Last name can only contain letters, spaces, hyphens, and apostrophes"),
  email: z.string()
    .min(1, "Email is required")
    .email("Please enter a valid email address")
    .refine((email) => {
      const typoSuggestion = checkEmailTypo(email);
      return !typoSuggestion;
    }, {
      message: "This email domain appears to have a typo. Please check and correct it.",
    }),
  username: z.string()
    .min(1, "Username is required")
    .min(4, "Username must be at least 4 characters")
    .max(30, "Username cannot exceed 30 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  password: z.string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters")
    .refine((password) => !password.includes(" "), {
      message: "Password cannot contain spaces",
    }),
});

type SignupFormData = z.infer<typeof signupFormSchema>;

export default function Signup() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      username: "",
      password: "",
    },
  });

  const signupMutation = useMutation({
    mutationFn: async (data: SignupFormData) => {
      await apiRequest("/api/auth/signup", "POST", data);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Account created!",
        description: "Welcome to Myzymo!",
      });
      navigate("/onboarding/preferences");
    },
    onError: (error: any) => {
      toast({
        title: "Signup failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: SignupFormData) => {
    signupMutation.mutate(data);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/10 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4 text-center">
          <div className="flex flex-col items-center">
            <img src={logoUrl} alt="Myzymo" className="w-24 h-24" />
            <span className="font-heading font-bold text-2xl mt-2">Myzymo</span>
            <span className="text-sm text-primary font-medium">Bringing People Together</span>
          </div>
          <CardTitle className="text-3xl font-heading">Create Account</CardTitle>
          <CardDescription>
            Join Myzymo to plan amazing celebrations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button
              variant="outline"
              onClick={() => window.location.href = "/api/login"}
              data-testid="button-replit-signup"
              className="w-full gap-2"
            >
              <SiGoogle className="h-4 w-4" />
              Continue with Social Login
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or sign up with email</span>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    {...register("firstName")}
                    data-testid="input-firstName"
                    className={errors.firstName ? "border-red-500" : ""}
                  />
                  {errors.firstName && (
                    <p className="text-sm text-red-500" data-testid="error-firstName">
                      {errors.firstName.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    {...register("lastName")}
                    data-testid="input-lastName"
                    className={errors.lastName ? "border-red-500" : ""}
                  />
                  {errors.lastName && (
                    <p className="text-sm text-red-500" data-testid="error-lastName">
                      {errors.lastName.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="text"
                  {...register("email")}
                  data-testid="input-email"
                  className={errors.email ? "border-red-500" : ""}
                  placeholder="your@email.com"
                />
                {errors.email && (
                  <p className="text-sm text-red-500" data-testid="error-email">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  {...register("username")}
                  data-testid="input-username"
                  className={errors.username ? "border-red-500" : ""}
                />
                {errors.username && (
                  <p className="text-sm text-red-500" data-testid="error-username">
                    {errors.username.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    {...register("password")}
                    data-testid="input-password"
                    className={`pr-10 ${errors.password ? "border-red-500" : ""}`}
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
                {errors.password && (
                  <p className="text-sm text-red-500" data-testid="error-password">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={signupMutation.isPending}
                data-testid="button-signup"
              >
                {signupMutation.isPending ? "Creating account..." : "Sign Up"}
              </Button>

              <div className="text-center text-sm">
                Already have an account?{" "}
                <Button
                  variant="ghost"
                  className="p-0 h-auto underline text-primary"
                  onClick={() => navigate("/login")}
                  data-testid="link-login"
                >
                  Log in
                </Button>
              </div>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

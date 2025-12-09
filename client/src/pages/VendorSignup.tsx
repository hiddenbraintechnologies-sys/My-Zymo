import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { Eye, EyeOff, Store, Sparkles } from "lucide-react";
import { SiGoogle } from "react-icons/si";
import logoUrl from "@assets/generated_images/myzymo_celebration_app_logo.png";

export default function VendorSignup() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    email: "",
    firstName: "",
    lastName: "",
    businessName: "",
    category: "",
    description: "",
    location: "",
    priceRange: "",
    imageUrl: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  // Check if user is already authenticated (from social login)
  const isAuthenticatedUser = !!user;

  const signupMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      // If already authenticated, use profile completion endpoint
      if (isAuthenticatedUser) {
        await apiRequest("/api/vendor/complete-profile", "POST", {
          businessName: data.businessName,
          category: data.category,
          description: data.description,
          location: data.location,
          priceRange: data.priceRange,
          imageUrl: data.imageUrl,
        });
      } else {
        await apiRequest("/api/vendor/signup", "POST", data);
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Vendor account created!",
        description: "Your account is pending admin approval. You'll be able to access your dashboard once approved.",
      });
      navigate("/vendor/dashboard");
    },
    onError: (error: any) => {
      toast({
        title: "Vendor registration failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    signupMutation.mutate(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleCategoryChange = (value: string) => {
    setFormData(prev => ({ ...prev, category: value }));
  };

  const handlePriceRangeChange = (value: string) => {
    setFormData(prev => ({ ...prev, priceRange: value }));
  };

  const handleSocialLogin = () => {
    window.location.href = "/api/vendor/auth/login";
  };

  const generateDescriptionMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("/api/vendor/generate-description", "POST", {
        businessName: formData.businessName,
        category: formData.category,
        location: formData.location,
        priceRange: formData.priceRange,
        existingDescription: formData.description,
      });
      return await response.json();
    },
    onSuccess: (data: any) => {
      setFormData(prev => ({ ...prev, description: data.description }));
      toast({
        title: "Description Generated!",
        description: "AI has created a professional description for your business.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Generation Failed",
        description: error.message || "Please try again or write your own description.",
        variant: "destructive",
      });
    },
  });

  const handleGenerateDescription = () => {
    if (!formData.businessName || !formData.category) {
      toast({
        title: "Missing Information",
        description: "Please fill in your business name and category first.",
        variant: "destructive",
      });
      return;
    }
    generateDescriptionMutation.mutate();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/10 p-4 py-12">
      <Card className="w-full max-w-2xl">
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
          <CardTitle className="text-3xl font-heading">Vendor Registration</CardTitle>
          <CardDescription>
            Join Myzymo as a vendor and grow your celebration business
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!isAuthenticatedUser && (
            <div className="space-y-4 mb-6">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleSocialLogin}
                data-testid="button-social-login"
              >
                <SiGoogle className="mr-2 h-4 w-4" />
                Sign up with Social Login
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                Google • GitHub • X (Twitter) • Apple • Email
              </p>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Or sign up with details</span>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Only show personal info if not authenticated */}
            {!isAuthenticatedUser && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Personal Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    maxLength={50}
                    data-testid="input-firstName"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    maxLength={50}
                    data-testid="input-lastName"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  data-testid="input-email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  maxLength={30}
                  data-testid="input-username"
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
                    maxLength={128}
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
            </div>
            )}

            {!isAuthenticatedUser && <Separator />}

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Business Information</h3>
              
              <div className="space-y-2">
                <Label htmlFor="businessName">Business Name</Label>
                <Input
                  id="businessName"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleChange}
                  required
                  data-testid="input-businessName"
                  placeholder="e.g., Royal Banquet Hall"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select onValueChange={handleCategoryChange} required>
                  <SelectTrigger data-testid="select-category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="venue">Venue</SelectItem>
                    <SelectItem value="catering">Catering</SelectItem>
                    <SelectItem value="photography">Photography</SelectItem>
                    <SelectItem value="decoration">Decoration</SelectItem>
                    <SelectItem value="entertainment">Entertainment</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                  data-testid="input-location"
                  placeholder="e.g., Mumbai, Maharashtra"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="priceRange">Price Range</Label>
                <Select onValueChange={handlePriceRangeChange} required>
                  <SelectTrigger data-testid="select-priceRange">
                    <SelectValue placeholder="Select price range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="₹">₹ - Budget Friendly</SelectItem>
                    <SelectItem value="₹₹">₹₹ - Moderate</SelectItem>
                    <SelectItem value="₹₹₹">₹₹₹ - Premium</SelectItem>
                    <SelectItem value="₹₹₹₹">₹₹₹₹ - Luxury</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="description">Business Description</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleGenerateDescription}
                    disabled={generateDescriptionMutation.isPending || !formData.businessName || !formData.category}
                    data-testid="button-generate-description"
                    className="h-8"
                  >
                    {generateDescriptionMutation.isPending ? (
                      <>
                        <Sparkles className="h-3 w-3 mr-1 animate-pulse" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-3 w-3 mr-1" />
                        Generate with AI
                      </>
                    )}
                  </Button>
                </div>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  data-testid="input-description"
                  placeholder="Describe your services..."
                  rows={4}
                />
                <p className="text-xs text-muted-foreground">
                  Fill in your business name and category, then click "Generate with AI" for a professional description
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="imageUrl">Business Image URL (Optional)</Label>
                <Input
                  id="imageUrl"
                  name="imageUrl"
                  type="url"
                  value={formData.imageUrl}
                  onChange={handleChange}
                  data-testid="input-imageUrl"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={signupMutation.isPending}
              data-testid="button-signup"
            >
              {signupMutation.isPending ? "Creating Account..." : "Create Vendor Account"}
            </Button>

            <div className="text-center text-sm">
              Already have a vendor account?{" "}
              <Button
                variant="ghost"
                className="p-0 h-auto"
                onClick={() => navigate("/vendor/login")}
                data-testid="link-login"
              >
                Log in
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

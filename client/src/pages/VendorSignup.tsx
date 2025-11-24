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
import { Eye, EyeOff, Store } from "lucide-react";
import logoUrl from "@assets/generated_images/myzymo_celebration_app_logo.png";

export default function VendorSignup() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
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

  const signupMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      await apiRequest("/api/vendor/signup", "POST", data);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Vendor account created!",
        description: "Welcome to Myzymo Vendor Dashboard!",
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/10 p-4 py-12">
      <Card className="w-full max-w-2xl">
        <CardHeader className="space-y-4 text-center">
          <div className="flex justify-center">
            <div className="relative">
              <img src={logoUrl} alt="Myzymo" className="w-20 h-20" />
              <div className="absolute -bottom-2 -right-2 bg-primary rounded-full p-2">
                <Store className="h-4 w-4 text-primary-foreground" />
              </div>
            </div>
          </div>
          <CardTitle className="text-3xl font-heading">Vendor Registration</CardTitle>
          <CardDescription>
            Join Myzymo as a vendor and grow your celebration business
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
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

            <Separator />

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
                <Label htmlFor="description">Business Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  data-testid="input-description"
                  placeholder="Describe your services..."
                  rows={4}
                />
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
                variant="link"
                className="p-0"
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

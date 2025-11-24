import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Star, LogOut } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import type { Vendor } from "@shared/schema";
import logoUrl from "@assets/generated_images/myzymo_celebration_app_logo.png";

export default function Vendors() {
  const { user, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [category, setCategory] = useState<string>("all");
  
  const { data: vendors, isLoading } = useQuery<Vendor[]>({
    queryKey: category === "all" ? ["/api/vendors"] : ["/api/vendors", { category }],
    enabled: true,
  });

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Skeleton className="h-8 w-48" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50/40 via-background to-amber-50/40 dark:from-background dark:via-background dark:to-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" data-testid="link-home">
            <div className="flex items-center gap-2 cursor-pointer hover-elevate active-elevate-2 rounded-md px-2 py-1 -ml-2">
              <img src={logoUrl} alt="Myzymo" className="w-10 h-10" />
              <span className="font-heading font-bold text-xl bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">Myzymo</span>
            </div>
          </Link>
          
          <div className="flex items-center gap-4">
            {user && (
              <Link href="/dashboard" data-testid="link-dashboard">
                <Button variant="ghost">Dashboard</Button>
              </Link>
            )}
            <Link href="/events" data-testid="link-events">
              <Button variant="ghost">Events</Button>
            </Link>
            <Link href="/vendors" data-testid="link-vendors">
              <Button variant="ghost">Vendors</Button>
            </Link>
            {user && (
              <>
                <Link href="/messages" data-testid="link-messages">
                  <Button variant="ghost">Messages</Button>
                </Link>
                <Link href="/ai-assistant" data-testid="link-ai-assistant">
                  <Button variant="ghost">AI Assistant</Button>
                </Link>
                <Link href="/profile" data-testid="link-profile">
                  <Button variant="ghost">Profile</Button>
                </Link>
                <div className="flex items-center gap-2">
                  <span className="text-sm" data-testid="text-user-name">
                    {user.firstName} {user.lastName}
                  </span>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={handleLogout}
                    data-testid="button-logout"
                  >
                    <LogOut className="w-4 h-4" />
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Hero Banner */}
        <div className="mb-8 relative overflow-hidden rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 p-8 text-white shadow-xl">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20"></div>
          <div className="relative z-10">
            <h1 className="text-4xl font-heading font-bold mb-2 flex items-center gap-2">
              <MapPin className="w-8 h-8" />
              Vendor Marketplace
            </h1>
            <p className="text-white/90 text-lg">Find and book trusted vendors for your events</p>
          </div>
        </div>

        {/* Category Filter */}
        <div className="mb-8">          
          <div className="flex items-center gap-4">
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-48" data-testid="select-category">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="venue">Venues</SelectItem>
                <SelectItem value="catering">Catering</SelectItem>
                <SelectItem value="photography">Photography</SelectItem>
                <SelectItem value="decoration">Decoration</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-80" />
            ))}
          </div>
        ) : vendors && vendors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vendors.map((vendor) => (
              <Card 
                key={vendor.id} 
                className="hover-elevate cursor-pointer"
                onClick={() => setLocation(`/vendors/${vendor.id}`)}
                data-testid={`card-vendor-${vendor.id}`}
              >
                {vendor.imageUrl && (
                  <div className="aspect-video w-full overflow-hidden rounded-t-md">
                    <img 
                      src={vendor.imageUrl} 
                      alt={vendor.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardHeader>
                  <CardTitle data-testid={`text-vendor-name-${vendor.id}`}>
                    {vendor.name}
                  </CardTitle>
                  <CardDescription className="capitalize">
                    {vendor.category}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Star className="w-4 h-4 fill-primary text-primary" />
                    <span className="font-medium">
                      {vendor.rating} ({vendor.reviewCount} reviews)
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>{vendor.location}</span>
                  </div>
                  <div className="text-sm font-medium text-primary">
                    {vendor.priceRange}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">
              No vendors found in this category
            </p>
          </Card>
        )}
      </main>
    </div>
  );
}

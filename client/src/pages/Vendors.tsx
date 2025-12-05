import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Star, LogOut, Store, Camera, Utensils, Sparkles, Palette } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import type { Vendor } from "@shared/schema";
import logoUrl from "@assets/generated_images/myzymo_celebration_app_logo.png";
import heroImage from "@assets/generated_images/homepage_hero_celebration_image.png";
import Navbar from "@/components/Navbar";

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
    <div className="min-h-screen bg-gradient-to-br from-orange-50/40 via-background to-amber-50/40 dark:from-background dark:via-background dark:to-background pb-20 md:pb-0">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Hero Banner - Enhanced Design with Floating Icons */}
        <div className="mb-8 relative overflow-hidden rounded-2xl shadow-xl">
          <img 
            src={heroImage} 
            alt="Celebration" 
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/40" />
          
          {/* Floating Decorative Icons */}
          <div className="absolute top-4 left-4 md:top-6 md:left-8 z-10">
            <div className="bg-gradient-to-br from-teal-500/30 to-cyan-500/30 backdrop-blur-sm rounded-xl p-2 border border-white/20 animate-bounce" style={{ animationDuration: '3s' }}>
              <Store className="w-4 h-4 md:w-5 md:h-5 text-white" />
            </div>
          </div>
          <div className="absolute top-8 right-4 md:top-4 md:right-[200px] z-10 hidden sm:block">
            <div className="bg-gradient-to-br from-pink-500/30 to-rose-500/30 backdrop-blur-sm rounded-xl p-2 border border-white/20 animate-bounce" style={{ animationDuration: '2.5s', animationDelay: '0.5s' }}>
              <Camera className="w-4 h-4 md:w-5 md:h-5 text-white" />
            </div>
          </div>
          <div className="absolute bottom-16 left-8 md:bottom-4 md:left-[120px] z-10 hidden md:block">
            <div className="bg-gradient-to-br from-amber-500/30 to-orange-500/30 backdrop-blur-sm rounded-xl p-2 border border-white/20 animate-bounce" style={{ animationDuration: '2.8s', animationDelay: '1s' }}>
              <Utensils className="w-4 h-4 md:w-5 md:h-5 text-white" />
            </div>
          </div>
          <div className="absolute bottom-4 right-4 md:bottom-6 md:right-8 z-10 hidden sm:block">
            <div className="bg-gradient-to-br from-violet-500/30 to-purple-500/30 backdrop-blur-sm rounded-xl p-2 border border-white/20 animate-bounce" style={{ animationDuration: '3.2s', animationDelay: '0.3s' }}>
              <Palette className="w-4 h-4 md:w-5 md:h-5 text-white" />
            </div>
          </div>
          
          <div className="relative z-10 p-4 md:p-8 min-h-[140px] md:min-h-[180px] flex items-center">
            <div>
              {/* Category Badge */}
              <div className="mb-2 inline-flex px-3 py-1 rounded-full bg-gradient-to-r from-teal-500/40 to-cyan-500/40 backdrop-blur-sm border border-teal-300/50 text-xs font-medium text-white">
                <Store className="w-3 h-3 mr-1.5" />
                Marketplace
              </div>
              <h1 className="text-2xl md:text-4xl font-heading font-bold mb-1 md:mb-2 text-white">
                Vendor Marketplace
              </h1>
              <p className="text-white/80 text-sm md:text-lg mb-3">Find and book trusted vendors for your events</p>
              {/* Quick Action Pills */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1.5 border border-white/20">
                  <MapPin className="w-3.5 h-3.5 text-teal-300" />
                  <span className="text-xs text-white">Venues</span>
                </div>
                <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1.5 border border-white/20">
                  <Utensils className="w-3.5 h-3.5 text-orange-300" />
                  <span className="text-xs text-white">Catering</span>
                </div>
                <div className="hidden md:flex items-center gap-1.5 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1.5 border border-white/20">
                  <Camera className="w-3.5 h-3.5 text-pink-300" />
                  <span className="text-xs text-white">Photography</span>
                </div>
                <div className="hidden md:flex items-center gap-1.5 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1.5 border border-white/20">
                  <Palette className="w-3.5 h-3.5 text-violet-300" />
                  <span className="text-xs text-white">Decor</span>
                </div>
              </div>
            </div>
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

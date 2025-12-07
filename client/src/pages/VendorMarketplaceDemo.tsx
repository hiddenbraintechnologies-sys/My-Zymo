import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { 
  Store, 
  Search, 
  Star, 
  MapPin, 
  Phone,
  Heart,
  ArrowRight,
  UserPlus,
  Lock,
  Camera,
  Utensils,
  Music,
  Palette,
  Building,
  Sparkles,
  IndianRupee,
  Calendar,
  MessageCircle,
  Clock,
  CheckCircle,
  Filter,
  X
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import logoUrl from "@assets/generated_images/myzymo_celebration_app_logo.png";

interface Vendor {
  id: string;
  name: string;
  category: string;
  description: string;
  rating: number;
  reviewCount: number;
  priceRange: string;
  location: string;
  image: string;
  featured: boolean;
  verified: boolean;
  services: string[];
}

const CATEGORIES = [
  { value: "all", label: "All Categories", icon: Store },
  { value: "venue", label: "Venues", icon: Building },
  { value: "catering", label: "Catering", icon: Utensils },
  { value: "photography", label: "Photography", icon: Camera },
  { value: "decoration", label: "Decorations", icon: Palette },
  { value: "music", label: "Music & DJ", icon: Music },
];

const DEMO_VENDORS: Vendor[] = [
  {
    id: "1",
    name: "The Grand Ballroom",
    category: "venue",
    description: "Elegant banquet hall perfect for weddings, corporate events, and grand celebrations. Capacity: 500 guests.",
    rating: 4.8,
    reviewCount: 156,
    priceRange: "₹50,000 - ₹2,00,000",
    location: "Bandra West, Mumbai",
    image: "",
    featured: true,
    verified: true,
    services: ["Indoor Venue", "AC", "Parking", "Catering Available"],
  },
  {
    id: "2",
    name: "Sharma Caterers",
    category: "catering",
    description: "Award-winning catering service specializing in North Indian, South Indian, and Continental cuisines. Minimum 100 guests.",
    rating: 4.9,
    reviewCount: 289,
    priceRange: "₹800 - ₹2,500 per plate",
    location: "Andheri, Mumbai",
    image: "",
    featured: true,
    verified: true,
    services: ["Veg & Non-Veg", "Live Counters", "Custom Menu", "Staff Included"],
  },
  {
    id: "3",
    name: "Capture Moments Studio",
    category: "photography",
    description: "Professional photography and videography for all occasions. Drone shots, candid photography, and cinematic videos.",
    rating: 4.7,
    reviewCount: 98,
    priceRange: "₹25,000 - ₹1,50,000",
    location: "Powai, Mumbai",
    image: "",
    featured: false,
    verified: true,
    services: ["Photo", "Video", "Drone", "Same-day Edit"],
  },
  {
    id: "4",
    name: "Dream Decor",
    category: "decoration",
    description: "Transform your venue into a magical space. Specializing in floral arrangements, lighting, and themed decorations.",
    rating: 4.6,
    reviewCount: 72,
    priceRange: "₹30,000 - ₹3,00,000",
    location: "Juhu, Mumbai",
    image: "",
    featured: false,
    verified: true,
    services: ["Flowers", "Lighting", "Stage Setup", "Entry Gates"],
  },
  {
    id: "5",
    name: "DJ Rhythm",
    category: "music",
    description: "High-energy DJ and sound system rental. Bollywood, EDM, Hip-hop, and custom playlists. Equipment included.",
    rating: 4.5,
    reviewCount: 134,
    priceRange: "₹15,000 - ₹75,000",
    location: "Malad, Mumbai",
    image: "",
    featured: false,
    verified: false,
    services: ["DJ Services", "Sound System", "Lights", "Fog Machine"],
  },
  {
    id: "6",
    name: "Garden Paradise",
    category: "venue",
    description: "Beautiful outdoor garden venue for intimate gatherings and cocktail parties. Capacity: 200 guests.",
    rating: 4.4,
    reviewCount: 45,
    priceRange: "₹40,000 - ₹1,20,000",
    location: "Goregaon, Mumbai",
    image: "",
    featured: false,
    verified: true,
    services: ["Outdoor", "Garden", "Parking", "Generator"],
  },
];

const CATEGORY_COLORS: Record<string, string> = {
  venue: "bg-blue-500",
  catering: "bg-orange-500",
  photography: "bg-purple-500",
  decoration: "bg-pink-500",
  music: "bg-cyan-500",
};

export default function VendorMarketplaceDemo() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("rating");

  const getCategoryIcon = (category: string) => {
    const cat = CATEGORIES.find(c => c.value === category);
    return cat?.icon || Store;
  };

  const getCategoryLabel = (category: string) => {
    const cat = CATEGORIES.find(c => c.value === category);
    return cat?.label || "Other";
  };

  const filteredVendors = DEMO_VENDORS
    .filter(vendor => {
      const matchesCategory = selectedCategory === "all" || vendor.category === selectedCategory;
      const matchesSearch = vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           vendor.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           vendor.location.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === "rating") return b.rating - a.rating;
      if (sortBy === "reviews") return b.reviewCount - a.reviewCount;
      if (sortBy === "featured") return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
      return 0;
    });

  const toggleFavorite = (vendorId: string) => {
    setFavorites(prev => 
      prev.includes(vendorId) 
        ? prev.filter(id => id !== vendorId)
        : [...prev, vendorId]
    );
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star 
            key={star} 
            className={`w-4 h-4 ${star <= Math.round(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50/50 to-background dark:from-teal-950/20 dark:via-cyan-950/10 dark:to-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-teal-500 via-cyan-500 to-teal-600 text-white py-12 px-4">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yIDItNCAyLTRzMiAyIDIgNC0yIDQtMiA0LTItMi0yLTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
        
        <div className="max-w-5xl mx-auto relative">
          <div className="flex items-center gap-3 mb-4">
            <img src={logoUrl} alt="Myzymo" className="w-12 h-12" />
            <div>
              <span className="font-heading font-bold text-xl">Myzymo</span>
              <span className="block text-sm text-white/80">Bringing People Together</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 mb-3">
            <Badge className="bg-white/20 text-white border-white/30">
              <Store className="w-3 h-3 mr-1" />
              Try It Free
            </Badge>
          </div>
          
          <h1 className="font-heading font-bold text-3xl md:text-4xl mb-3">
            Vendor Marketplace
          </h1>
          <p className="text-white/90 text-lg max-w-xl mb-6">
            Discover and book trusted vendors for venues, catering, photography, decorations, and more.
          </p>
          
          {/* Search Bar */}
          <div className="flex flex-col sm:flex-row gap-3 max-w-2xl">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-teal-600" />
              <Input
                placeholder="Search vendors, locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white text-foreground border-0 h-12"
                data-testid="input-vendor-search"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-48 bg-white text-foreground border-0 h-12" data-testid="select-category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map(cat => (
                  <SelectItem key={cat.value} value={cat.value}>
                    <div className="flex items-center gap-2">
                      <cat.icon className="w-4 h-4" />
                      {cat.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {/* Category Pills */}
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(cat => (
            <Button
              key={cat.value}
              variant={selectedCategory === cat.value ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(cat.value)}
              className="gap-2"
              data-testid={`button-category-${cat.value}`}
            >
              <cat.icon className="w-4 h-4" />
              {cat.label}
            </Button>
          ))}
        </div>
        
        {/* Results Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="text-muted-foreground">
            Showing <span className="font-semibold text-foreground">{filteredVendors.length}</span> vendors
            {selectedCategory !== "all" && (
              <span> in <span className="font-semibold text-foreground">{getCategoryLabel(selectedCategory)}</span></span>
            )}
          </p>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40" data-testid="select-sort">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="reviews">Most Reviews</SelectItem>
                <SelectItem value="featured">Featured First</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Vendor Grid - Always Full Width */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredVendors.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground col-span-full">
              <Store className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium">No vendors found</p>
              <p className="text-sm">Try adjusting your search or filters</p>
            </div>
          ) : (
            filteredVendors.map((vendor) => {
              const CategoryIcon = getCategoryIcon(vendor.category);
              const isFavorite = favorites.includes(vendor.id);
              
              return (
                <Card 
                  key={vendor.id}
                  className={`overflow-hidden cursor-pointer transition-all hover:border-primary/50 ${vendor.featured ? 'border-amber-300 dark:border-amber-700' : ''}`}
                  onClick={() => setSelectedVendor(vendor)}
                  data-testid={`vendor-card-${vendor.id}`}
                >
                  {/* Vendor Image Placeholder */}
                  <div className={`h-32 ${CATEGORY_COLORS[vendor.category]} flex items-center justify-center relative`}>
                    <CategoryIcon className="w-12 h-12 text-white/50" />
                    {vendor.featured && (
                      <Badge className="absolute top-2 left-2 bg-amber-500 text-white">
                        <Sparkles className="w-3 h-3 mr-1" />
                        Featured
                      </Badge>
                    )}
                    <Button
                      size="icon"
                      variant="ghost"
                      className="absolute top-2 right-2 h-8 w-8 bg-white/20 hover:bg-white/40"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(vendor.id);
                      }}
                      data-testid={`button-favorite-${vendor.id}`}
                    >
                      <Heart className={`w-4 h-4 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-white'}`} />
                    </Button>
                  </div>
                  
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <h4 className="font-semibold line-clamp-1 flex items-center gap-2">
                          {vendor.name}
                          {vendor.verified && (
                            <CheckCircle className="w-4 h-4 text-teal-500 flex-shrink-0" />
                          )}
                        </h4>
                        <Badge variant="outline" className="text-xs mt-1">
                          {getCategoryLabel(vendor.category)}
                        </Badge>
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {vendor.description}
                    </p>
                    
                    <div className="flex items-center gap-2 mb-2">
                      {renderStars(vendor.rating)}
                      <span className="text-sm font-medium">{vendor.rating}</span>
                      <span className="text-sm text-muted-foreground">({vendor.reviewCount})</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-3 h-3" />
                      <span>{vendor.location}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm font-medium mt-2 text-teal-600 dark:text-teal-400">
                      <IndianRupee className="w-3 h-3" />
                      <span>{vendor.priceRange}</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* Vendor Detail Dialog */}
        <Dialog open={!!selectedVendor} onOpenChange={(open) => !open && setSelectedVendor(null)}>
          <DialogContent 
            className="max-w-2xl max-h-[90vh] overflow-y-auto" 
            data-testid="dialog-vendor-detail"
            onOpenAutoFocus={(e) => {
              e.preventDefault();
              const closeBtn = e.currentTarget.querySelector('[data-testid="button-favorite-detail"]');
              if (closeBtn instanceof HTMLElement) {
                closeBtn.focus();
              }
            }}
          >
            {selectedVendor && (
              <>
                <DialogHeader>
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-3">
                      <div className={`w-14 h-14 rounded-xl ${CATEGORY_COLORS[selectedVendor.category]} flex items-center justify-center`}>
                        {(() => {
                          const Icon = getCategoryIcon(selectedVendor.category);
                          return <Icon className="w-7 h-7 text-white" />;
                        })()}
                      </div>
                      <div>
                        <DialogTitle className="flex items-center gap-2">
                          {selectedVendor.name}
                          {selectedVendor.verified && (
                            <CheckCircle className="w-5 h-5 text-teal-500" />
                          )}
                        </DialogTitle>
                        <DialogDescription className="flex items-center gap-2 mt-1">
                          <Badge variant="outline">{getCategoryLabel(selectedVendor.category)}</Badge>
                          {selectedVendor.featured && (
                            <Badge className="bg-amber-500 text-white">
                              <Sparkles className="w-3 h-3 mr-1" />
                              Featured
                            </Badge>
                          )}
                        </DialogDescription>
                      </div>
                    </div>
                    <Button
                      size="icon"
                      variant={favorites.includes(selectedVendor.id) ? "default" : "outline"}
                      onClick={() => toggleFavorite(selectedVendor.id)}
                      data-testid="button-favorite-detail"
                    >
                      <Heart className={`w-4 h-4 ${favorites.includes(selectedVendor.id) ? 'fill-current' : ''}`} />
                    </Button>
                  </div>
                </DialogHeader>
                
                <div className="space-y-6 mt-4">
                  {/* Rating & Reviews */}
                  <div className="flex items-center gap-4">
                    {renderStars(selectedVendor.rating)}
                    <span className="text-lg font-semibold">{selectedVendor.rating}</span>
                    <span className="text-muted-foreground">({selectedVendor.reviewCount} reviews)</span>
                  </div>
                  
                  {/* Description */}
                  <p className="text-muted-foreground">{selectedVendor.description}</p>
                  
                  {/* Details Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <MapPin className="w-5 h-5 text-teal-500" />
                      <div>
                        <p className="text-sm text-muted-foreground">Location</p>
                        <p className="font-medium">{selectedVendor.location}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <IndianRupee className="w-5 h-5 text-teal-500" />
                      <div>
                        <p className="text-sm text-muted-foreground">Price Range</p>
                        <p className="font-medium">{selectedVendor.priceRange}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Services */}
                  <div>
                    <h4 className="font-semibold mb-3">Services Offered</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedVendor.services.map((service, index) => (
                        <Badge key={index} variant="secondary">
                          {service}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Premium Features Locked with Signup Link */}
                  {!user && (
                    <div className="bg-muted/30 rounded-lg p-4">
                      <p className="text-sm font-medium mb-2 text-center">
                        Create a free account to unlock these features for {selectedVendor.name}:
                      </p>
                      <div className="flex flex-wrap gap-2 justify-center mb-4">
                        <button 
                          type="button"
                          className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-muted text-muted-foreground text-sm cursor-not-allowed"
                          disabled
                          aria-disabled="true"
                          aria-label="Contact Vendor - requires signup"
                          data-testid="button-locked-contact"
                        >
                          <Lock className="w-3 h-3" aria-hidden="true" />
                          Contact Vendor
                        </button>
                        <button 
                          type="button"
                          className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-muted text-muted-foreground text-sm cursor-not-allowed"
                          disabled
                          aria-disabled="true"
                          aria-label="Request Quote - requires signup"
                          data-testid="button-locked-quote"
                        >
                          <Lock className="w-3 h-3" aria-hidden="true" />
                          Request Quote
                        </button>
                        <button 
                          type="button"
                          className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-muted text-muted-foreground text-sm cursor-not-allowed"
                          disabled
                          aria-disabled="true"
                          aria-label="Book Now - requires signup"
                          data-testid="button-locked-book"
                        >
                          <Lock className="w-3 h-3" aria-hidden="true" />
                          Book Now
                        </button>
                        <button 
                          type="button"
                          className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-muted text-muted-foreground text-sm cursor-not-allowed"
                          disabled
                          aria-disabled="true"
                          aria-label="Read Reviews - requires signup"
                          data-testid="button-locked-reviews"
                        >
                          <Lock className="w-3 h-3" aria-hidden="true" />
                          Read Reviews
                        </button>
                      </div>
                      <p className="text-xs text-muted-foreground text-center mb-3">
                        Sign up to contact vendors, request quotes, make bookings, and read reviews.
                      </p>
                      <Button 
                        className="w-full bg-teal-600 hover:bg-teal-700"
                        onClick={() => navigate("/signup")}
                        aria-label={`Sign up free to unlock features for ${selectedVendor.name}`}
                        data-testid="button-dialog-signup"
                      >
                        <UserPlus className="w-4 h-4 mr-2" />
                        Sign Up Free to Unlock
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  )}
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>

        <Separator />

        {/* CTA Section */}
        <Card className="border-2 border-teal-300 dark:border-teal-700 bg-gradient-to-br from-teal-50 via-cyan-50 to-teal-100 dark:from-teal-950/30 dark:via-cyan-950/20 dark:to-teal-950/30" data-testid="card-cta">
          <CardContent className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-400 to-cyan-400 flex items-center justify-center flex-shrink-0">
                <Store className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="font-heading font-bold text-2xl mb-2">
                  Unlock Full Vendor Access
                </h3>
                <p className="text-muted-foreground mb-4">
                  Sign up to contact vendors directly, request quotes, read full reviews, 
                  book services, and save your favorites!
                </p>
                <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                  {user ? (
                    <Button 
                      size="lg" 
                      onClick={() => navigate("/vendors")}
                      className="bg-teal-600 hover:bg-teal-700"
                      data-testid="button-go-to-vendors"
                    >
                      <Store className="w-4 h-4 mr-2" />
                      Browse Full Marketplace
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  ) : (
                    <>
                      <Button 
                        size="lg" 
                        onClick={() => navigate("/signup")}
                        className="bg-teal-600 hover:bg-teal-700"
                        data-testid="button-signup-cta"
                      >
                        <UserPlus className="w-4 h-4 mr-2" />
                        Sign Up Free
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                      <Button 
                        size="lg" 
                        variant="outline" 
                        onClick={() => navigate("/login")}
                        data-testid="button-login-cta"
                      >
                        Already have an account? Log in
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            {/* Feature highlights */}
            <div className="mt-6 pt-6 border-t grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: Phone, label: "Direct Contact" },
                { icon: Calendar, label: "Easy Booking" },
                { icon: MessageCircle, label: "Chat with Vendors" },
                { icon: CheckCircle, label: "Verified Vendors" },
              ].map((feature, index) => (
                <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <feature.icon className="w-4 h-4 text-teal-500" />
                  <span>{feature.label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

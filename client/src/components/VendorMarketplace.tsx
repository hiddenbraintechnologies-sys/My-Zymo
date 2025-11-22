import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";
import VendorCard from "./VendorCard";
import venueImage from "@assets/generated_images/wedding_venue_category_image.png";
import cateringImage from "@assets/generated_images/catering_food_category_image.png";
import photographyImage from "@assets/generated_images/photography_service_category_image.png";
import decorationImage from "@assets/generated_images/decoration_service_category_image.png";

const categories = ["All", "Venues", "Catering", "Photography", "Decoration"];

// TODO: Remove mock data
const vendors = [
  {
    id: "1",
    name: "The Grand Ballroom",
    category: "Venue",
    image: venueImage,
    rating: 4.8,
    reviewCount: 124,
    priceRange: "₹25,000 - ₹50,000",
    location: "South Delhi",
    responseTime: "2 hours",
  },
  {
    id: "2",
    name: "Spice Kitchen Catering",
    category: "Catering",
    image: cateringImage,
    rating: 4.9,
    reviewCount: 89,
    priceRange: "₹500 - ₹800 per plate",
    location: "Mumbai Central",
    responseTime: "4 hours",
  },
  {
    id: "3",
    name: "Moments Photography",
    category: "Photography",
    image: photographyImage,
    rating: 4.7,
    reviewCount: 156,
    priceRange: "₹15,000 - ₹30,000",
    location: "Bangalore",
    responseTime: "1 hour",
  },
  {
    id: "4",
    name: "Elegant Decor Studio",
    category: "Decoration",
    image: decorationImage,
    rating: 4.6,
    reviewCount: 78,
    priceRange: "₹10,000 - ₹25,000",
    location: "Pune",
    responseTime: "3 hours",
  },
];

export default function VendorMarketplace() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredVendors = vendors.filter((vendor) => {
    const matchesCategory = selectedCategory === "All" || vendor.category === selectedCategory.slice(0, -1);
    const matchesSearch = vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         vendor.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="font-heading font-bold text-3xl md:text-4xl mb-2">
            Vendor Marketplace
          </h1>
          <p className="text-muted-foreground">
            Find trusted professionals for your celebration
          </p>
        </div>
        
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search vendors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="input-search-vendors"
            />
          </div>
        </div>
        
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {categories.map((category) => (
            <Badge
              key={category}
              variant={selectedCategory === category ? "default" : "secondary"}
              className="cursor-pointer whitespace-nowrap hover-elevate"
              onClick={() => setSelectedCategory(category)}
              data-testid={`badge-category-${category.toLowerCase()}`}
            >
              {category}
            </Badge>
          ))}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredVendors.map((vendor) => (
            <VendorCard key={vendor.id} {...vendor} />
          ))}
        </div>
        
        {filteredVendors.length === 0 && (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg">
              No vendors found matching your criteria
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

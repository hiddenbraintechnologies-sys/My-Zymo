import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Clock, MapPin } from "lucide-react";

interface VendorCardProps {
  name: string;
  category: string;
  image: string;
  rating: number;
  reviewCount: number;
  priceRange: string;
  location: string;
  responseTime: string;
}

export default function VendorCard({
  name,
  category,
  image,
  rating,
  reviewCount,
  priceRange,
  location,
  responseTime,
}: VendorCardProps) {
  return (
    <Card 
      className="overflow-hidden hover-elevate cursor-pointer group"
      data-testid="card-vendor"
      onClick={() => console.log(`Vendor ${name} clicked`)}
    >
      <div className="aspect-[4/3] overflow-hidden">
        <img 
          src={image} 
          alt={name}
          className="w-full h-full object-cover transition-transform group-hover:scale-105"
        />
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h3 className="font-heading font-semibold text-lg mb-1">
              {name}
            </h3>
            <Badge variant="secondary" className="text-xs">
              {category}
            </Badge>
          </div>
          <div className="flex items-center gap-1 ml-2">
            <Star className="w-4 h-4 fill-primary text-primary" />
            <span className="font-semibold text-sm">{rating}</span>
            <span className="text-xs text-muted-foreground">({reviewCount})</span>
          </div>
        </div>
        
        <div className="space-y-2 text-sm text-muted-foreground mb-4">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            <span>{location}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>Responds in {responseTime}</span>
          </div>
          <div className="font-semibold text-foreground">
            {priceRange}
          </div>
        </div>
        
        <Button 
          className="w-full"
          data-testid="button-request-booking"
          onClick={(e) => {
            e.stopPropagation();
            console.log(`Request booking for ${name}`);
          }}
        >
          Request Booking
        </Button>
      </div>
    </Card>
  );
}

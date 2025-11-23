import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Star, IndianRupee } from "lucide-react";
import { Link } from "wouter";
import type { Vendor } from "@shared/schema";

interface EventVendorsProps {
  eventId: string;
}

export default function EventVendors({ eventId }: EventVendorsProps) {
  const { data: vendors = [], isLoading } = useQuery<Vendor[]>({
    queryKey: ["/api/vendors"],
  });

  // Show top vendors from different categories
  const featuredVendors = vendors.slice(0, 6);

  if (isLoading) {
    return <div className="text-center py-8">Loading vendors...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Book Vendors</h3>
          <p className="text-sm text-muted-foreground">Find trusted service providers for your event</p>
        </div>
        <Link href="/vendors">
          <Button variant="outline" data-testid="button-view-all-vendors">
            View All
          </Button>
        </Link>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {featuredVendors.map((vendor) => (
          <Card key={vendor.id} className="hover-elevate" data-testid={`vendor-card-${vendor.id}`}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <CardTitle className="text-base line-clamp-1">{vendor.name}</CardTitle>
                  <CardDescription className="flex items-center gap-1 mt-1">
                    <MapPin className="w-3 h-3" />
                    <span className="text-xs">{vendor.location}</span>
                  </CardDescription>
                </div>
                <Badge>{vendor.category}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{parseFloat(vendor.rating).toFixed(1)}</span>
                  <span className="text-muted-foreground">({vendor.reviewCount})</span>
                </div>
                <div className="flex items-center font-semibold">
                  <IndianRupee className="w-4 h-4" />
                  <span>{vendor.priceRange}</span>
                </div>
              </div>
              <Button 
                className="w-full" 
                size="sm"
                data-testid={`button-book-${vendor.id}`}
              >
                Book Now
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {featuredVendors.length === 0 && (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">No vendors available at the moment</p>
          <Link href="/vendors">
            <Button variant="outline" className="mt-4">
              Explore Vendors
            </Button>
          </Link>
        </Card>
      )}
    </div>
  );
}

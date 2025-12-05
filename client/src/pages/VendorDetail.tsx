import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, MapPin, Star, Clock, IndianRupee, Store } from "lucide-react";
import type { Vendor } from "@shared/schema";
import Navbar from "@/components/Navbar";

export default function VendorDetail() {
  const [, params] = useRoute<{ id: string }>("/vendors/:id");
  const vendorId = params?.id;

  const { data: vendor, isLoading, error } = useQuery<Vendor>({
    queryKey: ["/api/vendors", vendorId],
    queryFn: async () => {
      const res = await fetch(`/api/vendors/${vendorId}`);
      if (!res.ok) throw new Error("Failed to fetch vendor");
      return res.json();
    },
    enabled: !!vendorId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50/40 via-background to-amber-50/40 dark:from-background dark:via-background dark:to-background">
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 py-8">
          <Skeleton className="h-10 w-32 mb-6" />
          <Skeleton className="h-64 w-full mb-6" />
          <Skeleton className="h-40 w-full" />
        </main>
      </div>
    );
  }

  if (error || !vendor) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50/40 via-background to-amber-50/40 dark:from-background dark:via-background dark:to-background">
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 py-8">
          <Link href="/vendors">
            <Button variant="ghost" className="gap-2 mb-6" data-testid="button-back">
              <ArrowLeft className="w-4 h-4" />
              Back to Vendors
            </Button>
          </Link>
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Store className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="font-semibold mb-2">Vendor Not Found</h3>
              <p className="text-muted-foreground text-center">
                The vendor you're looking for doesn't exist or has been removed.
              </p>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50/40 via-background to-amber-50/40 dark:from-background dark:via-background dark:to-background pb-20 md:pb-0">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 py-8">
        <Link href="/vendors">
          <Button variant="ghost" className="gap-2 mb-6" data-testid="button-back">
            <ArrowLeft className="w-4 h-4" />
            Back to Vendors
          </Button>
        </Link>

        <div className="grid gap-6">
          {vendor.imageUrl && (
            <div className="aspect-video w-full overflow-hidden rounded-xl shadow-lg">
              <img
                src={vendor.imageUrl}
                alt={vendor.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <Card>
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <CardTitle className="text-2xl" data-testid="text-vendor-name">
                    {vendor.name}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-2">
                    <Badge variant="secondary" className="capitalize">
                      {vendor.category}
                    </Badge>
                  </CardDescription>
                </div>
                <div className="flex items-center gap-1 px-3 py-1 bg-amber-100 dark:bg-amber-900/30 rounded-full">
                  <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
                  <span className="font-semibold text-amber-700 dark:text-amber-400">
                    {vendor.rating}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    ({vendor.reviewCount} reviews)
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-muted-foreground" data-testid="text-vendor-description">
                {vendor.description}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <MapPin className="w-5 h-5 text-orange-500" />
                  <div>
                    <p className="text-xs text-muted-foreground">Location</p>
                    <p className="font-medium" data-testid="text-vendor-location">{vendor.location}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <IndianRupee className="w-5 h-5 text-orange-500" />
                  <div>
                    <p className="text-xs text-muted-foreground">Price Range</p>
                    <p className="font-medium" data-testid="text-vendor-price">{vendor.priceRange}</p>
                  </div>
                </div>

                {vendor.responseTime && (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <Clock className="w-5 h-5 text-orange-500" />
                    <div>
                      <p className="text-xs text-muted-foreground">Response Time</p>
                      <p className="font-medium">{vendor.responseTime}</p>
                    </div>
                  </div>
                )}
              </div>


              <div className="pt-4 border-t">
                <Button 
                  className="w-full md:w-auto bg-gradient-to-r from-orange-500 to-amber-500"
                  data-testid="button-contact-vendor"
                >
                  Contact Vendor
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

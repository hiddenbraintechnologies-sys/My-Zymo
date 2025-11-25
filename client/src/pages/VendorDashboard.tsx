import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { Store, Package, Star, Calendar, MapPin, DollarSign, Clock, Sparkles, Home } from "lucide-react";
import type { Vendor, Booking, User } from "@shared/schema";

export default function VendorDashboard() {
  const { user } = useAuth();
  const [, navigate] = useLocation();

  // Fetch vendor profile (protected endpoint)
  const { data: myVendor, isLoading: isLoadingVendor, error: vendorError } = useQuery<Vendor, { approvalStatus?: string }>({
    queryKey: ["/api/vendor/profile"],
    enabled: !!user && user.role === "vendor",
  });

  // Fetch bookings for this vendor (protected endpoint)
  const { data: myBookings = [], isLoading: isLoadingBookings } = useQuery<(Booking & { user: User; vendor: Vendor })[]>({
    queryKey: ["/api/vendor/bookings"],
    enabled: !!myVendor,
  });

  const pendingBookings = myBookings.filter(b => b.status === "pending");
  const confirmedBookings = myBookings.filter(b => b.status === "confirmed");

  if (!user || user.role !== "vendor") {
    navigate("/vendor/login");
    return null;
  }

  if (isLoadingVendor) {
    return (
      <div className="container mx-auto py-8 space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-64" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  // Handle approval status errors
  if (vendorError && (vendorError as any).approvalStatus) {
    const approvalStatus = (vendorError as any).approvalStatus;
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>
              {approvalStatus === 'pending' ? '⏳ Approval Pending' : '❌ Account Rejected'}
            </CardTitle>
            <CardDescription>
              {approvalStatus === 'pending' 
                ? 'Your vendor account is currently under review. Our admin team will review your application and approve it soon. You will be able to access your dashboard once approved.'
                : 'Your vendor account has been rejected. Please contact support for more information.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/")} variant="outline" data-testid="button-home">
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!myVendor) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>No Vendor Profile Found</CardTitle>
            <CardDescription>
              Your vendor profile is being set up. Please contact support if this persists.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50/40 via-background to-amber-50/40 dark:from-background dark:via-background dark:to-background">
      <div className="container mx-auto py-8 space-y-6">
        {/* Welcome Banner - Warm Cream Design */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-orange-50 via-amber-50/80 to-orange-50 dark:from-orange-950/20 dark:via-amber-950/15 dark:to-orange-950/20 border border-orange-100 dark:border-orange-900/30 p-8 shadow-sm">
          <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-heading font-bold mb-2 flex items-center gap-3 text-foreground">
                <Sparkles className="w-7 h-7 text-orange-500" />
                Welcome back, {user.firstName}!
              </h1>
              <p className="text-muted-foreground text-base md:text-lg">Manage your business and bookings</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-center bg-white dark:bg-card border border-orange-200 dark:border-orange-800 rounded-xl p-4 min-w-[90px] shadow-sm">
                <div className="text-2xl md:text-3xl font-bold text-orange-600 dark:text-orange-400">{myBookings.length}</div>
                <div className="text-xs md:text-sm text-orange-600/80 dark:text-orange-400/80">Bookings</div>
              </div>
              <div className="text-center bg-white dark:bg-card border border-orange-200 dark:border-orange-800 rounded-xl p-4 min-w-[90px] shadow-sm">
                <div className="text-2xl md:text-3xl font-bold text-orange-600 dark:text-orange-400">{pendingBookings.length}</div>
                <div className="text-xs md:text-sm text-orange-600/80 dark:text-orange-400/80">Pending</div>
              </div>
              <Button onClick={() => navigate("/")} variant="outline" data-testid="button-home" className="hidden sm:flex">
                <Home className="w-4 h-4 mr-2" />
                Home
              </Button>
            </div>
          </div>
        </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border border-orange-100 dark:border-orange-900/30" data-testid="card-total-bookings">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <Package className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{myBookings.length}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card className="border border-orange-100 dark:border-orange-900/30" data-testid="card-pending-bookings">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{pendingBookings.length}</div>
            <p className="text-xs text-muted-foreground">Awaiting response</p>
          </CardContent>
        </Card>

        <Card className="border border-orange-100 dark:border-orange-900/30" data-testid="card-rating">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{myVendor.rating}/5.0</div>
            <p className="text-xs text-muted-foreground">{myVendor.reviewCount} reviews</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile" data-testid="tab-profile">Business Profile</TabsTrigger>
          <TabsTrigger value="bookings" data-testid="tab-bookings">
            Bookings ({myBookings.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                {myVendor.imageUrl && (
                  <img
                    src={myVendor.imageUrl}
                    alt={myVendor.name}
                    className="w-20 h-20 rounded-lg object-cover"
                  />
                )}
                <div>
                  <CardTitle className="text-2xl">{myVendor.name}</CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-2">
                    <Badge variant="secondary">{myVendor.category}</Badge>
                    <span className="text-muted-foreground">{myVendor.priceRange}</span>
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 mt-1 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Location</p>
                    <p className="text-sm text-muted-foreground">{myVendor.location}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Clock className="h-4 w-4 mt-1 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Response Time</p>
                    <p className="text-sm text-muted-foreground">{myVendor.responseTime}</p>
                  </div>
                </div>
              </div>

              {myVendor.description && (
                <div>
                  <p className="text-sm font-medium mb-2">About</p>
                  <p className="text-sm text-muted-foreground">{myVendor.description}</p>
                </div>
              )}

              <div className="pt-4">
                <Button variant="outline" data-testid="button-edit-profile">
                  Edit Profile
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bookings" className="space-y-4">
          {isLoadingBookings ? (
            <div className="space-y-4">
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
            </div>
          ) : myBookings.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Bookings Yet</h3>
                <p className="text-sm text-muted-foreground text-center max-w-md">
                  When customers request your services, their bookings will appear here.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {myBookings.map((booking) => (
                <Card key={booking.id} data-testid={`booking-${booking.id}`}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">
                          Booking from {booking.user.firstName} {booking.user.lastName}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {booking.user.email}
                        </CardDescription>
                      </div>
                      <Badge
                        variant={
                          booking.status === "confirmed"
                            ? "default"
                            : booking.status === "pending"
                            ? "secondary"
                            : "outline"
                        }
                      >
                        {booking.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  {booking.message && (
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{booking.message}</p>
                      <div className="flex gap-2 mt-4">
                        {booking.status === "pending" && (
                          <>
                            <Button size="sm" data-testid={`button-accept-${booking.id}`}>
                              Accept
                            </Button>
                            <Button size="sm" variant="outline" data-testid={`button-decline-${booking.id}`}>
                              Decline
                            </Button>
                          </>
                        )}
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
      </div>
    </div>
  );
}

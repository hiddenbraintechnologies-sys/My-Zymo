import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calendar, 
  Users, 
  MapPin, 
  Clock, 
  IndianRupee, 
  Store,
  CheckCircle,
  XCircle,
  AlertCircle,
  CreditCard,
  Receipt
} from "lucide-react";
import { format } from "date-fns";
import type { Booking, Vendor } from "@shared/schema";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import Navbar from "@/components/Navbar";

type BookingWithVendor = Booking & { vendor: Vendor };

const STATUS_CONFIG: Record<string, { label: string; icon: typeof CheckCircle; color: string }> = {
  pending: { label: "Pending", icon: Clock, color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400" },
  confirmed: { label: "Confirmed", icon: CheckCircle, color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" },
  cancelled: { label: "Cancelled", icon: XCircle, color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" },
  completed: { label: "Completed", icon: CheckCircle, color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400" },
};

const PAYMENT_STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  pending: { label: "Payment Pending", color: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400" },
  advance_paid: { label: "Advance Paid", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400" },
  fully_paid: { label: "Paid", color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" },
  refunded: { label: "Refunded", color: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400" },
};

export default function Bookings() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<BookingWithVendor | null>(null);
  const [cancelReason, setCancelReason] = useState("");

  const { data: bookings, isLoading } = useQuery<BookingWithVendor[]>({
    queryKey: ["/api/bookings"],
    enabled: isAuthenticated,
  });

  const cancelMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason?: string }) => {
      const res = await apiRequest(`/api/bookings/${id}/cancel`, "PATCH", { reason });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      toast({
        title: "Booking Cancelled",
        description: "Your booking has been cancelled successfully.",
      });
      setCancelDialogOpen(false);
      setSelectedBooking(null);
      setCancelReason("");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to cancel booking",
        variant: "destructive",
      });
    },
  });

  const handleCancelClick = (booking: BookingWithVendor) => {
    setSelectedBooking(booking);
    setCancelDialogOpen(true);
  };

  const handleConfirmCancel = () => {
    if (selectedBooking) {
      cancelMutation.mutate({ id: selectedBooking.id, reason: cancelReason });
    }
  };

  const upcomingBookings = bookings?.filter(b => 
    b.status !== "cancelled" && b.status !== "completed" && new Date(b.bookingDate) >= new Date()
  ) || [];

  const pastBookings = bookings?.filter(b => 
    b.status === "completed" || new Date(b.bookingDate) < new Date()
  ) || [];

  const cancelledBookings = bookings?.filter(b => b.status === "cancelled") || [];

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50/40 via-background to-amber-50/40 dark:from-background dark:via-background dark:to-background">
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 py-8">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Receipt className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="font-semibold mb-2">Login Required</h3>
              <p className="text-muted-foreground text-center mb-4">
                Please login to view your bookings
              </p>
              <Link href="/login">
                <Button className="bg-gradient-to-r from-orange-500 to-amber-500">
                  Login
                </Button>
              </Link>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  const renderBookingCard = (booking: BookingWithVendor) => {
    const statusConfig = STATUS_CONFIG[booking.status] || STATUS_CONFIG.pending;
    const paymentConfig = PAYMENT_STATUS_CONFIG[booking.paymentStatus] || PAYMENT_STATUS_CONFIG.pending;
    const StatusIcon = statusConfig.icon;

    return (
      <Card key={booking.id} className="hover-elevate">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {booking.vendor?.imageUrl && (
              <div className="w-full md:w-32 h-24 rounded-lg overflow-hidden shrink-0">
                <img
                  src={booking.vendor.imageUrl}
                  alt={booking.vendor.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <Link href={`/vendors/${booking.vendorId}`}>
                    <h3 className="font-semibold hover:text-orange-500 transition-colors cursor-pointer">
                      {booking.vendor?.name || "Unknown Vendor"}
                    </h3>
                  </Link>
                  <p className="text-sm text-muted-foreground capitalize">
                    {booking.vendor?.category}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge className={statusConfig.color}>
                    <StatusIcon className="w-3 h-3 mr-1" />
                    {statusConfig.label}
                  </Badge>
                  <Badge className={paymentConfig.color} variant="outline">
                    {paymentConfig.label}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>{format(new Date(booking.bookingDate), "PPP")}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="w-4 h-4" />
                  <span>{booking.guestCount} guests</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span>{booking.vendor?.location}</span>
                </div>
                <div className="flex items-center gap-2 font-medium text-orange-600 dark:text-orange-400">
                  <IndianRupee className="w-4 h-4" />
                  <span>{Number(booking.amount).toLocaleString("en-IN")}</span>
                </div>
              </div>

              {booking.specialRequests && (
                <p className="text-sm text-muted-foreground mt-2 line-clamp-1">
                  Note: {booking.specialRequests}
                </p>
              )}

              {booking.status === "pending" && (
                <div className="flex gap-2 mt-3">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600 border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-950/30"
                    onClick={() => handleCancelClick(booking)}
                    data-testid={`button-cancel-booking-${booking.id}`}
                  >
                    Cancel Booking
                  </Button>
                </div>
              )}

              {booking.status === "cancelled" && booking.cancellationReason && (
                <p className="text-sm text-red-600 dark:text-red-400 mt-2">
                  Reason: {booking.cancellationReason}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50/40 via-background to-amber-50/40 dark:from-background dark:via-background dark:to-background pb-20 md:pb-0">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-heading font-bold flex items-center gap-2">
            <Receipt className="w-6 h-6 text-orange-500" />
            My Bookings
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your vendor bookings and payments
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-40 w-full" />
            ))}
          </div>
        ) : bookings && bookings.length > 0 ? (
          <Tabs defaultValue="upcoming" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="upcoming" className="gap-2">
                <Clock className="w-4 h-4" />
                Upcoming ({upcomingBookings.length})
              </TabsTrigger>
              <TabsTrigger value="past" className="gap-2">
                <CheckCircle className="w-4 h-4" />
                Past ({pastBookings.length})
              </TabsTrigger>
              <TabsTrigger value="cancelled" className="gap-2">
                <XCircle className="w-4 h-4" />
                Cancelled ({cancelledBookings.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming" className="space-y-4">
              {upcomingBookings.length > 0 ? (
                upcomingBookings.map(renderBookingCard)
              ) : (
                <Card className="border-dashed">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Calendar className="w-12 h-12 text-muted-foreground mb-4" />
                    <h3 className="font-semibold mb-2">No Upcoming Bookings</h3>
                    <p className="text-muted-foreground text-center mb-4">
                      Browse vendors to book services for your events
                    </p>
                    <Link href="/vendors">
                      <Button className="bg-gradient-to-r from-orange-500 to-amber-500">
                        <Store className="w-4 h-4 mr-2" />
                        Browse Vendors
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="past" className="space-y-4">
              {pastBookings.length > 0 ? (
                pastBookings.map(renderBookingCard)
              ) : (
                <Card className="border-dashed">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <CheckCircle className="w-12 h-12 text-muted-foreground mb-4" />
                    <h3 className="font-semibold mb-2">No Past Bookings</h3>
                    <p className="text-muted-foreground text-center">
                      Your completed bookings will appear here
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="cancelled" className="space-y-4">
              {cancelledBookings.length > 0 ? (
                cancelledBookings.map(renderBookingCard)
              ) : (
                <Card className="border-dashed">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <XCircle className="w-12 h-12 text-muted-foreground mb-4" />
                    <h3 className="font-semibold mb-2">No Cancelled Bookings</h3>
                    <p className="text-muted-foreground text-center">
                      Cancelled bookings will appear here
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        ) : (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Receipt className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="font-semibold mb-2">No Bookings Yet</h3>
              <p className="text-muted-foreground text-center mb-4">
                Start by browsing vendors to book services for your events
              </p>
              <Link href="/vendors">
                <Button className="bg-gradient-to-r from-orange-500 to-amber-500">
                  <Store className="w-4 h-4 mr-2" />
                  Browse Vendors
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Cancel Confirmation Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-5 h-5" />
              Cancel Booking
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this booking? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {selectedBooking && (
            <div className="p-3 rounded-lg bg-muted/50 space-y-1">
              <p className="font-medium">{selectedBooking.vendor?.name}</p>
              <p className="text-sm text-muted-foreground">
                {format(new Date(selectedBooking.bookingDate), "PPP")} • {selectedBooking.guestCount} guests
              </p>
              <p className="text-sm font-medium text-orange-600">
                ₹{Number(selectedBooking.amount).toLocaleString("en-IN")}
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="cancelReason">Reason for cancellation (optional)</Label>
            <Textarea
              id="cancelReason"
              placeholder="Tell us why you're cancelling..."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="resize-none"
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>
              Keep Booking
            </Button>
            <Button 
              variant="destructive"
              onClick={handleConfirmCancel}
              disabled={cancelMutation.isPending}
              data-testid="button-confirm-cancel"
            >
              {cancelMutation.isPending ? "Cancelling..." : "Yes, Cancel Booking"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

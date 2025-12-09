import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute, Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowLeft, MapPin, Star, Clock, IndianRupee, Store, Calendar, Users, CreditCard, CheckCircle, Wallet, Smartphone } from "lucide-react";
import { format } from "date-fns";
import type { Vendor, Event } from "@shared/schema";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import Navbar from "@/components/Navbar";

export default function VendorDetail() {
  const [, params] = useRoute<{ id: string }>("/vendors/:id");
  const [, navigate] = useLocation();
  const vendorId = params?.id;
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [bookingComplete, setBookingComplete] = useState(false);
  const [createdBookingId, setCreatedBookingId] = useState<string | null>(null);
  
  const [bookingForm, setBookingForm] = useState({
    bookingDate: "",
    guestCount: "10",
    specialRequests: "",
    eventId: "",
    amount: "",
  });

  const [paymentMethod, setPaymentMethod] = useState<"card" | "upi" | "bank_transfer">("upi");

  const { data: vendor, isLoading, error } = useQuery<Vendor>({
    queryKey: ["/api/vendors", vendorId],
    queryFn: async () => {
      const res = await fetch(`/api/vendors/${vendorId}`);
      if (!res.ok) throw new Error("Failed to fetch vendor");
      return res.json();
    },
    enabled: !!vendorId,
  });

  const { data: userEvents } = useQuery<Event[]>({
    queryKey: ["/api/events/user"],
    enabled: isAuthenticated,
  });

  const createBookingMutation = useMutation({
    mutationFn: async (data: typeof bookingForm) => {
      const res = await apiRequest("/api/bookings", "POST", {
        vendorId,
        bookingDate: data.bookingDate,
        guestCount: parseInt(data.guestCount) || 10,
        specialRequests: data.specialRequests || null,
        eventId: data.eventId || null,
        amount: parseFloat(data.amount) || 5000,
      });
      return await res.json();
    },
    onSuccess: (booking) => {
      setCreatedBookingId(booking.id);
      setBookingDialogOpen(false);
      setPaymentDialogOpen(true);
    },
    onError: (error: any) => {
      toast({
        title: "Booking Failed",
        description: error.message || "Failed to create booking",
        variant: "destructive",
      });
    },
  });

  const processPaymentMutation = useMutation({
    mutationFn: async () => {
      if (!createdBookingId) throw new Error("No booking to pay for");
      const res = await apiRequest(`/api/bookings/${createdBookingId}/payment`, "PATCH", {
        paymentMethod,
        amountPaid: parseFloat(bookingForm.amount) || 5000,
        isAdvance: false,
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      setPaymentDialogOpen(false);
      setBookingComplete(true);
      toast({
        title: "Payment Successful!",
        description: "Your booking has been confirmed. The vendor will contact you soon.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Payment Failed",
        description: error.message || "Failed to process payment",
        variant: "destructive",
      });
    },
  });

  const handleBookNow = () => {
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please login to book this vendor",
        variant: "destructive",
      });
      return;
    }
    setBookingDialogOpen(true);
  };

  const handleSubmitBooking = () => {
    if (!bookingForm.bookingDate) {
      toast({
        title: "Date Required",
        description: "Please select a booking date",
        variant: "destructive",
      });
      return;
    }
    if (!bookingForm.amount || parseFloat(bookingForm.amount) <= 0) {
      toast({
        title: "Amount Required",
        description: "Please enter the booking amount",
        variant: "destructive",
      });
      return;
    }
    createBookingMutation.mutate(bookingForm);
  };

  const resetBookingFlow = () => {
    setBookingComplete(false);
    setCreatedBookingId(null);
    setBookingForm({
      bookingDate: "",
      guestCount: "10",
      specialRequests: "",
      eventId: "",
      amount: "",
    });
  };

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

              <div className="pt-4 border-t flex flex-col sm:flex-row gap-3">
                <Button 
                  className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500"
                  onClick={handleBookNow}
                  data-testid="button-book-vendor"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Book Now
                </Button>
                <Button 
                  variant="outline"
                  className="flex-1"
                  data-testid="button-contact-vendor"
                >
                  Contact Vendor
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Booking Dialog */}
      <Dialog open={bookingDialogOpen} onOpenChange={setBookingDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-orange-500" />
              Book {vendor.name}
            </DialogTitle>
            <DialogDescription>
              Fill in the details below to book this vendor for your event.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="bookingDate">Event Date *</Label>
              <Input
                id="bookingDate"
                type="date"
                value={bookingForm.bookingDate}
                onChange={(e) => setBookingForm({ ...bookingForm, bookingDate: e.target.value })}
                min={format(new Date(), "yyyy-MM-dd")}
                data-testid="input-booking-date"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="guestCount">Number of Guests</Label>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-muted-foreground" />
                <Input
                  id="guestCount"
                  type="number"
                  value={bookingForm.guestCount}
                  onChange={(e) => setBookingForm({ ...bookingForm, guestCount: e.target.value })}
                  min="1"
                  max="1000"
                  data-testid="input-guest-count"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Booking Amount (₹) *</Label>
              <div className="flex items-center gap-2">
                <IndianRupee className="w-4 h-4 text-muted-foreground" />
                <Input
                  id="amount"
                  type="number"
                  value={bookingForm.amount}
                  onChange={(e) => setBookingForm({ ...bookingForm, amount: e.target.value })}
                  placeholder="Enter amount"
                  min="1"
                  data-testid="input-booking-amount"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Price range: {vendor.priceRange}
              </p>
            </div>

            {userEvents && userEvents.length > 0 && (
              <div className="space-y-2">
                <Label>Link to Event (Optional)</Label>
                <Select
                  value={bookingForm.eventId}
                  onValueChange={(value) => setBookingForm({ ...bookingForm, eventId: value })}
                >
                  <SelectTrigger data-testid="select-event">
                    <SelectValue placeholder="Select an event" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No event</SelectItem>
                    {userEvents.map((event) => (
                      <SelectItem key={event.id} value={event.id}>
                        {event.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="specialRequests">Special Requests</Label>
              <Textarea
                id="specialRequests"
                placeholder="Any special requirements or notes..."
                value={bookingForm.specialRequests}
                onChange={(e) => setBookingForm({ ...bookingForm, specialRequests: e.target.value })}
                className="resize-none"
                rows={3}
                data-testid="input-special-requests"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setBookingDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              className="bg-gradient-to-r from-orange-500 to-amber-500"
              onClick={handleSubmitBooking}
              disabled={createBookingMutation.isPending}
              data-testid="button-submit-booking"
            >
              {createBookingMutation.isPending ? "Creating..." : "Proceed to Payment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-orange-500" />
              Complete Payment
            </DialogTitle>
            <DialogDescription>
              Choose your preferred payment method to confirm your booking.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="p-4 rounded-lg bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 border">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground">Amount to Pay</p>
                  <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    ₹{parseFloat(bookingForm.amount || "0").toLocaleString("en-IN")}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Vendor</p>
                  <p className="font-medium">{vendor.name}</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Label>Payment Method</Label>
              <RadioGroup value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as typeof paymentMethod)}>
                <div className="flex items-center space-x-3 p-3 rounded-lg border hover-elevate cursor-pointer" onClick={() => setPaymentMethod("upi")}>
                  <RadioGroupItem value="upi" id="upi" />
                  <Smartphone className="w-5 h-5 text-purple-500" />
                  <Label htmlFor="upi" className="flex-1 cursor-pointer">
                    <span className="font-medium">UPI</span>
                    <span className="block text-xs text-muted-foreground">Pay using GPay, PhonePe, Paytm</span>
                  </Label>
                </div>
                <div className="flex items-center space-x-3 p-3 rounded-lg border hover-elevate cursor-pointer" onClick={() => setPaymentMethod("card")}>
                  <RadioGroupItem value="card" id="card" />
                  <CreditCard className="w-5 h-5 text-blue-500" />
                  <Label htmlFor="card" className="flex-1 cursor-pointer">
                    <span className="font-medium">Credit/Debit Card</span>
                    <span className="block text-xs text-muted-foreground">Visa, Mastercard, Rupay</span>
                  </Label>
                </div>
                <div className="flex items-center space-x-3 p-3 rounded-lg border hover-elevate cursor-pointer" onClick={() => setPaymentMethod("bank_transfer")}>
                  <RadioGroupItem value="bank_transfer" id="bank_transfer" />
                  <Wallet className="w-5 h-5 text-green-500" />
                  <Label htmlFor="bank_transfer" className="flex-1 cursor-pointer">
                    <span className="font-medium">Net Banking</span>
                    <span className="block text-xs text-muted-foreground">All major banks supported</span>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <p className="text-xs text-muted-foreground text-center">
              By clicking Pay Now, you agree to our terms and conditions. Payments are secured and encrypted.
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setPaymentDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              className="bg-gradient-to-r from-green-500 to-emerald-500"
              onClick={() => processPaymentMutation.mutate()}
              disabled={processPaymentMutation.isPending}
              data-testid="button-pay-now"
            >
              {processPaymentMutation.isPending ? "Processing..." : `Pay ₹${parseFloat(bookingForm.amount || "0").toLocaleString("en-IN")}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success Dialog */}
      <Dialog open={bookingComplete} onOpenChange={(open) => { if (!open) resetBookingFlow(); setBookingComplete(open); }}>
        <DialogContent className="sm:max-w-md text-center">
          <div className="flex flex-col items-center py-6">
            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <DialogTitle className="text-xl mb-2">Booking Confirmed!</DialogTitle>
            <DialogDescription className="text-center">
              Your booking with <strong>{vendor.name}</strong> has been confirmed. 
              You'll receive a confirmation email shortly.
            </DialogDescription>
          </div>

          <div className="p-4 rounded-lg bg-muted/50 text-left space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Date</span>
              <span className="font-medium">{bookingForm.bookingDate ? format(new Date(bookingForm.bookingDate), "PPP") : "-"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Guests</span>
              <span className="font-medium">{bookingForm.guestCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Amount Paid</span>
              <span className="font-medium text-green-600">₹{parseFloat(bookingForm.amount || "0").toLocaleString("en-IN")}</span>
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => navigate("/bookings")}
              data-testid="button-view-bookings"
            >
              View My Bookings
            </Button>
            <Button 
              className="w-full bg-gradient-to-r from-orange-500 to-amber-500"
              onClick={() => { resetBookingFlow(); setBookingComplete(false); }}
              data-testid="button-close-success"
            >
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

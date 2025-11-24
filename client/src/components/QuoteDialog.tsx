import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Download, Save, Sparkles, IndianRupee, Calendar, MapPin, Users, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { format } from "date-fns";

const quoteFormSchema = z.object({
  guestName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  eventType: z.string().min(1, "Please select an event type"),
  eventDateTime: z.string().min(1, "Please select event date and time"),
  locationCity: z.string().min(2, "City is required"),
  locationState: z.string().optional(),
  guestCount: z.coerce.number().min(1, "Guest count must be at least 1").optional(),
});

type QuoteFormData = z.infer<typeof quoteFormSchema>;

interface QuoteEstimate {
  totalEstimate: number;
  breakdown: {
    venue: number;
    catering: number;
    decoration: number;
    photography: number;
    entertainment: number;
    miscellaneous: number;
  };
  perGuestCost: number;
  cityTier: string;
  seasonalFactor: string;
  recommendations: string[];
  notes: string;
}

interface QuoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function QuoteDialog({ open, onOpenChange }: QuoteDialogProps) {
  const { toast } = useToast();
  const [estimate, setEstimate] = useState<QuoteEstimate | null>(null);
  const [quoteId, setQuoteId] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const { data: user } = useQuery({
    queryKey: ["/api/auth/user"],
    enabled: open,
  });

  const form = useForm<QuoteFormData>({
    resolver: zodResolver(quoteFormSchema),
    defaultValues: {
      guestName: "",
      email: "",
      phone: "",
      eventType: "",
      eventDateTime: "",
      locationCity: "",
      locationState: "",
      guestCount: undefined,
    },
  });

  const generateEstimateMutation = useMutation({
    mutationFn: async (data: QuoteFormData) => {
      const response = await apiRequest("/api/quotes/estimate", "POST", data);
      return await response.json();
    },
    onSuccess: (data: any) => {
      setEstimate(data.estimate);
      setQuoteId(data.quoteId);
      toast({
        title: "Estimate Generated!",
        description: "Your AI-powered cost estimate is ready.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to generate estimate",
        variant: "destructive",
      });
    },
  });

  const saveQuoteMutation = useMutation({
    mutationFn: async () => {
      if (!quoteId) throw new Error("No quote to save");
      const response = await apiRequest("/api/quotes", "POST", { quoteId });
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Quote Saved!",
        description: "Your quote has been saved to your account.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/quotes"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save quote",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: QuoteFormData) => {
    generateEstimateMutation.mutate(data);
  };

  const handleSaveQuote = () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to save your quote.",
        variant: "destructive",
      });
      return;
    }
    saveQuoteMutation.mutate();
  };

  const handleDownload = () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to download your quote.",
        variant: "destructive",
      });
      return;
    }

    if (!estimate || !quoteId) return;

    const quoteData = {
      ...form.getValues(),
      estimate,
      generatedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(quoteData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `myzymo-quote-${quoteId}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Quote Downloaded!",
      description: "Your quote has been downloaded as a JSON file.",
    });
  };

  const handleReset = () => {
    setEstimate(null);
    setQuoteId(null);
    form.reset();
  };

  const formatINR = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Sparkles className="h-6 w-6 text-primary" />
            Get a Free AI-Powered Quote
          </DialogTitle>
          <DialogDescription>
            Fill in your event details and get an instant cost estimate powered by AI
          </DialogDescription>
        </DialogHeader>

        {!estimate ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="guestName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your Name</FormLabel>
                      <FormControl>
                        <Input data-testid="input-guest-name" placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input data-testid="input-email" type="email" placeholder="john@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input data-testid="input-phone" placeholder="+91 98765 43210" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="eventType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-event-type">
                            <SelectValue placeholder="Select event type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Wedding">Wedding</SelectItem>
                          <SelectItem value="Birthday Party">Birthday Party</SelectItem>
                          <SelectItem value="College Reunion">College Reunion</SelectItem>
                          <SelectItem value="Corporate Event">Corporate Event</SelectItem>
                          <SelectItem value="Engagement">Engagement</SelectItem>
                          <SelectItem value="Anniversary">Anniversary</SelectItem>
                          <SelectItem value="Baby Shower">Baby Shower</SelectItem>
                          <SelectItem value="Housewarming">Housewarming</SelectItem>
                          <SelectItem value="Festival Celebration">Festival Celebration</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="eventDateTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event Date & Time</FormLabel>
                      <FormControl>
                        <Input data-testid="input-event-datetime" type="datetime-local" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="locationCity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input data-testid="input-location-city" placeholder="Mumbai" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="locationState"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State (Optional)</FormLabel>
                      <FormControl>
                        <Input data-testid="input-location-state" placeholder="Maharashtra" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="guestCount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expected Guest Count (Optional)</FormLabel>
                      <FormControl>
                        <Input data-testid="input-guest-count" type="number" placeholder="100" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button
                data-testid="button-generate-estimate"
                type="submit"
                className="w-full"
                disabled={generateEstimateMutation.isPending}
              >
                {generateEstimateMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Estimate...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate AI Estimate
                  </>
                )}
              </Button>
            </form>
          </Form>
        ) : (
          <div className="space-y-6" data-testid="quote-estimate-display">
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <IndianRupee className="h-5 w-5" />
                    Total Estimate
                  </span>
                  <span className="text-3xl font-bold text-primary">
                    {formatINR(estimate.totalEstimate)}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Date:</span>
                    <span className="font-medium">
                      {format(new Date(form.getValues("eventDateTime")), "MMM dd, yyyy")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Location:</span>
                    <span className="font-medium">{form.getValues("locationCity")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Guests:</span>
                    <span className="font-medium">{form.getValues("guestCount") || "50-100"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <IndianRupee className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Per Guest:</span>
                    <span className="font-medium">{formatINR(estimate.perGuestCost)}</span>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-3">Cost Breakdown</h4>
                  <div className="space-y-2">
                    {Object.entries(estimate.breakdown).map(([category, amount]) => (
                      <div key={category} className="flex justify-between items-center">
                        <span className="text-sm capitalize text-muted-foreground">{category}</span>
                        <span className="font-medium">{formatINR(amount)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-muted/50 p-4 rounded-md space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <AlertCircle className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Market Insights</span>
                  </div>
                  <div className="text-sm space-y-1">
                    <p>City Tier: <span className="font-medium">{estimate.cityTier}</span></p>
                    <p>Season: <span className="font-medium">{estimate.seasonalFactor}</span></p>
                  </div>
                </div>

                {estimate.recommendations && estimate.recommendations.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-semibold">Recommendations</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                      {estimate.recommendations.map((rec: string, idx: number) => (
                        <li key={idx}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {estimate.notes && (
                  <div className="text-sm text-muted-foreground italic border-l-2 border-primary/20 pl-3">
                    {estimate.notes}
                  </div>
                )}
              </CardContent>
            </Card>

            {!user && (
              <div className="bg-muted/50 p-4 rounded-md flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-primary mt-0.5" />
                <div className="flex-1 text-sm">
                  <p className="font-medium">Login to Save & Download</p>
                  <p className="text-muted-foreground mt-1">
                    Create an account or log in to save this quote and download it for your records.
                  </p>
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              {user && (
                <>
                  <Button
                    data-testid="button-save-quote"
                    onClick={handleSaveQuote}
                    disabled={saveQuoteMutation.isPending}
                  >
                    {saveQuoteMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Quote
                      </>
                    )}
                  </Button>
                  <Button
                    data-testid="button-download-quote"
                    variant="outline"
                    onClick={handleDownload}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                </>
              )}
              <Button
                data-testid="button-new-quote"
                variant="outline"
                onClick={handleReset}
              >
                New Quote
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

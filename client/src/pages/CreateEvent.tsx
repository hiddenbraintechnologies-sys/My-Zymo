import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, ArrowLeft, Globe, Lock, Image, Receipt, IndianRupee, Users, Percent, X, Plus } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { insertEventSchema, type InsertEvent } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { z } from "zod";
import { EventFieldSuggestions } from "@/components/EventFieldSuggestions";
import { InvitationCardCreator } from "@/components/InvitationCardCreator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

const EXPENSE_CATEGORIES = [
  "Venue",
  "Food & Catering",
  "Decorations",
  "Photography",
  "Music & DJ",
  "Transportation",
  "Gifts & Favors",
  "Entertainment",
  "Other",
];

// Form schema with string date (for datetime-local input)
// Omit creatorId since backend sets it from session
const formSchema = insertEventSchema.omit({ creatorId: true }).extend({
  date: z.string(),
});

type FormData = z.infer<typeof formSchema>;

const EVENT_TYPES = [
  "Birthday Party",
  "Wedding",
  "College Reunion",
  "School Reunion",
  "Corporate Event",
  "Engagement",
  "Anniversary",
  "Baby Shower",
  "Housewarming",
  "Festival Celebration",
  "Diwali Celebration",
  "Holi Celebration",
  "Eid Celebration",
  "Christmas Party",
  "New Year Party",
  "Other",
];

export default function CreateEvent() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [eventType, setEventType] = useState<string>("");
  const [customEventType, setCustomEventType] = useState<string>("");
  const [invitationCardUrl, setInvitationCardUrl] = useState<string>("");
  const [isCardSectionOpen, setIsCardSectionOpen] = useState(false);
  const [isExpenseSectionOpen, setIsExpenseSectionOpen] = useState(false);
  const [enableExpenseSplit, setEnableExpenseSplit] = useState(false);
  const [expenseSplitType, setExpenseSplitType] = useState<string>("equal");
  const [estimatedBudget, setEstimatedBudget] = useState<string>("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [customCategory, setCustomCategory] = useState<string>("");

  // Get the effective event type (custom if "Other" is selected)
  const effectiveEventType = eventType === "Other" ? customEventType : eventType;

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
      location: "",
      imageUrl: "",
      isPublic: false,
    },
  });

  const createEventMutation = useMutation({
    mutationFn: async (data: { 
      title: string; 
      description?: string | null; 
      location: string; 
      imageUrl?: string | null; 
      invitationCardUrl?: string | null; 
      date: string; 
      isPublic?: boolean;
      enableExpenseSplit?: boolean;
      expenseSplitType?: string;
      estimatedBudget?: string | null;
      expenseCategories?: string[];
    }) => {
      console.log("[CreateEvent] Mutation starting with data:", data);
      try {
        const response = await apiRequest("/api/events", "POST", data);
        const createdEvent = await response.json();
        console.log("[CreateEvent] API request succeeded:", createdEvent);
        return createdEvent;
      } catch (error) {
        console.error("[CreateEvent] API request failed:", error);
        throw error;
      }
    },
    onSuccess: (createdEvent: any) => {
      console.log("[CreateEvent] Mutation success, created event:", createdEvent);
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      toast({
        title: "Event created!",
        description: "Your event has been created successfully.",
      });
      setLocation(`/events`);
    },
    onError: (error: any) => {
      console.error("[CreateEvent] Mutation error:", error);
      toast({
        title: "Error",
        description: "Failed to create event. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    console.log("Form submitted with data:", data);
    console.log("Form errors:", form.formState.errors);
    
    // Transform form data to match backend schema
    // Backend sets creatorId from session, so we don't send it
    const payload = {
      title: data.title,
      description: data.description || null,
      location: data.location,
      imageUrl: data.imageUrl?.trim() ? data.imageUrl : null,
      invitationCardUrl: invitationCardUrl || null,
      date: new Date(data.date).toISOString(),
      isPublic: data.isPublic || false,
      enableExpenseSplit: enableExpenseSplit,
      expenseSplitType: enableExpenseSplit ? expenseSplitType : undefined,
      estimatedBudget: enableExpenseSplit && estimatedBudget ? estimatedBudget : undefined,
      expenseCategories: enableExpenseSplit && selectedCategories.length > 0 ? selectedCategories : undefined,
    };
    
    console.log("Payload to send:", payload);
    createEventMutation.mutate(payload);
  };

  const handleAddCategory = (category: string) => {
    if (category && !selectedCategories.includes(category)) {
      setSelectedCategories([...selectedCategories, category]);
    }
    setCustomCategory("");
  };

  const handleRemoveCategory = (category: string) => {
    setSelectedCategories(selectedCategories.filter(c => c !== category));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50/40 via-background to-amber-50/40 dark:from-background dark:via-background dark:to-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-4">
          <Link href="/events" data-testid="link-back-events">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Calendar className="w-6 h-6 text-orange-400" />
            <span className="font-heading font-bold text-xl bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">Create Event</span>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Event Type Selector - for AI suggestions */}
            <div className="space-y-2">
              <label htmlFor="event-type" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Event Type (Optional - helps with AI suggestions)
              </label>
              <Select value={eventType} onValueChange={(value) => {
                setEventType(value);
                if (value !== "Other") {
                  setCustomEventType("");
                }
              }}>
                <SelectTrigger id="event-type" data-testid="select-event-type">
                  <SelectValue placeholder="Select event type for AI suggestions" />
                </SelectTrigger>
                <SelectContent>
                  {EVENT_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {/* Custom Event Type Input - shown when "Other" is selected */}
              {eventType === "Other" && (
                <Input
                  placeholder="Enter your custom event type (e.g., Retirement Party, Farewell)"
                  value={customEventType}
                  onChange={(e) => setCustomEventType(e.target.value)}
                  className="mt-2"
                  data-testid="input-custom-event-type"
                />
              )}
            </div>

            {/* AI Suggestions - shown when event type is selected */}
            {effectiveEventType && (
              <EventFieldSuggestions
                eventType={effectiveEventType}
                date={form.watch("date")}
                location={form.watch("location")}
                onSelectTitle={(title) => form.setValue("title", title)}
                onSelectDescription={(description) => form.setValue("description", description)}
              />
            )}

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event Title</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g., Diwali Celebration 2025" 
                      {...field}
                      data-testid="input-event-title"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Tell your guests about the event..."
                      rows={4}
                      {...field}
                      value={field.value || ""}
                      data-testid="input-event-description"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <Input 
                      type="datetime-local"
                      {...field}
                      data-testid="input-event-date"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g., Mumbai, Maharashtra"
                      {...field}
                      data-testid="input-event-location"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image URL (Optional)</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="https://example.com/image.jpg"
                      {...field}
                      value={field.value || ""}
                      data-testid="input-event-image"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isPublic"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-md border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base flex items-center gap-2">
                      {field.value ? (
                        <>
                          <Globe className="w-4 h-4" />
                          Public Event
                        </>
                      ) : (
                        <>
                          <Lock className="w-4 h-4" />
                          Private Event
                        </>
                      )}
                    </FormLabel>
                    <FormDescription>
                      {field.value 
                        ? "This event will be visible to all visitors on the home page" 
                        : "This event is private and invite-only"}
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      data-testid="switch-event-visibility"
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Dynamic Expense Split Section */}
            <Collapsible 
              open={isExpenseSectionOpen} 
              onOpenChange={setIsExpenseSectionOpen}
              className="border rounded-lg overflow-hidden"
            >
              <CollapsibleTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full flex items-center justify-between gap-2 p-4 hover:bg-orange-50 dark:hover:bg-orange-950"
                  data-testid="button-toggle-expense-split"
                >
                  <div className="flex items-center gap-2">
                    <Receipt className="w-5 h-5 text-orange-500" />
                    <span className="font-medium">Expense Splitting</span>
                    {enableExpenseSplit && (
                      <span className="text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-0.5 rounded-full">
                        Enabled
                      </span>
                    )}
                  </div>
                  <span className="text-muted-foreground text-sm">
                    {isExpenseSectionOpen ? "Hide" : "Show"}
                  </span>
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="p-4 space-y-4">
                {/* Enable Expense Split Toggle */}
                <div className="flex items-center justify-between rounded-md border p-4 bg-orange-50/50 dark:bg-orange-950/20">
                  <div className="space-y-0.5">
                    <Label className="text-base flex items-center gap-2">
                      <IndianRupee className="w-4 h-4 text-orange-500" />
                      Enable Expense Splitting
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Allow participants to split event costs
                    </p>
                  </div>
                  <Switch
                    checked={enableExpenseSplit}
                    onCheckedChange={setEnableExpenseSplit}
                    data-testid="switch-enable-expense-split"
                  />
                </div>

                {enableExpenseSplit && (
                  <div className="space-y-4 pt-2">
                    {/* Split Type Selection */}
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">Split Type</Label>
                      <RadioGroup 
                        value={expenseSplitType} 
                        onValueChange={setExpenseSplitType}
                        className="grid grid-cols-1 sm:grid-cols-3 gap-3"
                      >
                        <div className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-orange-50 dark:hover:bg-orange-950/30">
                          <RadioGroupItem value="equal" id="split-equal" data-testid="radio-split-equal" />
                          <Label htmlFor="split-equal" className="flex items-center gap-2 cursor-pointer">
                            <Users className="w-4 h-4 text-blue-500" />
                            <div>
                              <div className="font-medium">Equal Split</div>
                              <div className="text-xs text-muted-foreground">Split equally among all</div>
                            </div>
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-orange-50 dark:hover:bg-orange-950/30">
                          <RadioGroupItem value="percentage" id="split-percentage" data-testid="radio-split-percentage" />
                          <Label htmlFor="split-percentage" className="flex items-center gap-2 cursor-pointer">
                            <Percent className="w-4 h-4 text-purple-500" />
                            <div>
                              <div className="font-medium">Percentage</div>
                              <div className="text-xs text-muted-foreground">Custom % per person</div>
                            </div>
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-orange-50 dark:hover:bg-orange-950/30">
                          <RadioGroupItem value="custom" id="split-custom" data-testid="radio-split-custom" />
                          <Label htmlFor="split-custom" className="flex items-center gap-2 cursor-pointer">
                            <IndianRupee className="w-4 h-4 text-green-500" />
                            <div>
                              <div className="font-medium">Custom Amount</div>
                              <div className="text-xs text-muted-foreground">Set exact amounts</div>
                            </div>
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>

                    {/* Estimated Budget */}
                    <div className="space-y-2">
                      <Label htmlFor="estimated-budget" className="text-sm font-medium">
                        Estimated Budget (Optional)
                      </Label>
                      <div className="relative">
                        <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="estimated-budget"
                          type="number"
                          placeholder="e.g., 50000"
                          value={estimatedBudget}
                          onChange={(e) => setEstimatedBudget(e.target.value)}
                          className="pl-9"
                          data-testid="input-estimated-budget"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Helps participants understand the expected contribution
                      </p>
                    </div>

                    {/* Expense Categories */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Expense Categories</Label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {selectedCategories.map((category) => (
                          <span
                            key={category}
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800"
                          >
                            {category}
                            <button
                              type="button"
                              onClick={() => handleRemoveCategory(category)}
                              className="hover:bg-orange-200 dark:hover:bg-orange-800 rounded-full p-0.5"
                              data-testid={`button-remove-category-${category.toLowerCase().replace(/\s+/g, '-')}`}
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Select 
                          value=""
                          onValueChange={(value) => handleAddCategory(value)}
                        >
                          <SelectTrigger className="flex-1" data-testid="select-expense-category">
                            <SelectValue placeholder="Add expense category" />
                          </SelectTrigger>
                          <SelectContent>
                            {EXPENSE_CATEGORIES.filter(cat => !selectedCategories.includes(cat)).map((category) => (
                              <SelectItem key={category} value={category}>
                                {category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex gap-2 mt-2">
                        <Input
                          placeholder="Or add custom category..."
                          value={customCategory}
                          onChange={(e) => setCustomCategory(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddCategory(customCategory);
                            }
                          }}
                          className="flex-1"
                          data-testid="input-custom-category"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => handleAddCategory(customCategory)}
                          disabled={!customCategory.trim()}
                          data-testid="button-add-custom-category"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Summary */}
                    {(estimatedBudget || selectedCategories.length > 0) && (
                      <div className="rounded-lg bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 p-4 border border-orange-200 dark:border-orange-800">
                        <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                          <Receipt className="w-4 h-4 text-orange-500" />
                          Expense Split Summary
                        </h4>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <p>Split Type: <span className="font-medium text-foreground capitalize">{expenseSplitType}</span></p>
                          {estimatedBudget && (
                            <p>Estimated Budget: <span className="font-medium text-foreground">₹{parseInt(estimatedBudget).toLocaleString('en-IN')}</span></p>
                          )}
                          {selectedCategories.length > 0 && (
                            <p>Categories: <span className="font-medium text-foreground">{selectedCategories.join(', ')}</span></p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CollapsibleContent>
            </Collapsible>

            {/* Invitation Card Section */}
            <Collapsible 
              open={isCardSectionOpen} 
              onOpenChange={setIsCardSectionOpen}
              className="border rounded-lg overflow-hidden"
            >
              <CollapsibleTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full flex items-center justify-between gap-2 p-4 hover:bg-orange-50 dark:hover:bg-orange-950"
                  data-testid="button-toggle-invitation-card"
                >
                  <div className="flex items-center gap-2">
                    <Image className="w-5 h-5 text-orange-500" />
                    <span className="font-medium">Create Invitation Card</span>
                    {invitationCardUrl && (
                      <span className="text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-0.5 rounded-full">
                        Card Selected
                      </span>
                    )}
                  </div>
                  <span className="text-muted-foreground text-sm">
                    {isCardSectionOpen ? "Hide" : "Show"}
                  </span>
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="p-4 pt-0">
                <InvitationCardCreator
                  eventType={effectiveEventType}
                  eventTitle={form.watch("title")}
                  eventDate={form.watch("date")}
                  eventLocation={form.watch("location")}
                  onSelectCard={setInvitationCardUrl}
                  selectedCard={invitationCardUrl}
                />
              </CollapsibleContent>
            </Collapsible>

            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setLocation("/events")}
                data-testid="button-cancel"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createEventMutation.isPending}
                data-testid="button-submit"
              >
                {createEventMutation.isPending ? "Creating..." : "Create Event"}
              </Button>
            </div>
          </form>
        </Form>
      </main>
    </div>
  );
}

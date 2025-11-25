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
import { Calendar, ArrowLeft, Globe, Lock, Image } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { insertEventSchema, type InsertEvent } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { z } from "zod";
import { EventFieldSuggestions } from "@/components/EventFieldSuggestions";
import { InvitationCardCreator } from "@/components/InvitationCardCreator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

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
  const [invitationCardUrl, setInvitationCardUrl] = useState<string>("");
  const [isCardSectionOpen, setIsCardSectionOpen] = useState(false);

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
    mutationFn: async (data: { title: string; description?: string | null; location: string; imageUrl?: string | null; invitationCardUrl?: string | null; date: string; isPublic?: boolean }) => {
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
      invitationCardUrl: invitationCardUrl || null, // Include invitation card
      date: new Date(data.date).toISOString(), // Backend expects ISO string
      isPublic: data.isPublic || false,
    };
    
    console.log("Payload to send:", payload);
    createEventMutation.mutate(payload);
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
              <Select value={eventType} onValueChange={setEventType}>
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
            </div>

            {/* AI Suggestions - shown when event type is selected */}
            {eventType && (
              <EventFieldSuggestions
                eventType={eventType}
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
                  eventType={eventType}
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

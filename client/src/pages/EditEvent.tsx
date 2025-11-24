import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocation, useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, ArrowLeft } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { insertEventSchema, type Event } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { z } from "zod";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";

// Form schema with string date (for datetime-local input)
// Omit creatorId since backend doesn't allow updating it
const formSchema = insertEventSchema.omit({ creatorId: true }).extend({
  date: z.string(),
});

type FormData = z.infer<typeof formSchema>;

export default function EditEvent() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/events/:id/edit");
  const { toast } = useToast();
  const { user } = useAuth();

  const { data: event, isLoading } = useQuery<Event>({
    queryKey: ["/api/events", params?.id],
    enabled: !!params?.id,
  });

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      date: "",
      location: "",
      imageUrl: "",
    },
  });

  // Update form when event data is loaded
  useEffect(() => {
    if (event) {
      // Check if user is the creator
      if (event.creatorId !== user?.id) {
        toast({
          title: "Access denied",
          description: "You can only edit events you created.",
          variant: "destructive",
        });
        setLocation("/dashboard");
        return;
      }

      form.reset({
        title: event.title,
        description: event.description || "",
        date: new Date(event.date).toISOString().slice(0, 16),
        location: event.location,
        imageUrl: event.imageUrl || "",
      });
    }
  }, [event, form, user?.id, setLocation, toast]);

  const updateEventMutation = useMutation({
    mutationFn: async (data: { title: string; description?: string | null; location: string; imageUrl?: string | null; date: string }) => {
      const response = await apiRequest(`/api/events/${params?.id}`, "PATCH", data);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      queryClient.invalidateQueries({ queryKey: ["/api/events", params?.id] });
      toast({
        title: "Event updated!",
        description: "Your event has been updated successfully.",
      });
      setLocation(`/events/${params?.id}`);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update event. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    // Transform form data to match backend schema
    const payload = {
      title: data.title,
      description: data.description || null,
      location: data.location,
      imageUrl: data.imageUrl?.trim() ? data.imageUrl : null,
      date: new Date(data.date).toISOString(),
    };
    
    updateEventMutation.mutate(payload);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
          <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-4">
            <Skeleton className="h-10 w-10" />
            <Skeleton className="h-6 w-32" />
          </div>
        </header>
        <main className="max-w-2xl mx-auto px-4 py-8">
          <div className="space-y-6">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </main>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Event not found</h2>
          <Button onClick={() => setLocation("/dashboard")}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-4">
          <Link href={`/events/${event.id}`} data-testid="link-back-event">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Calendar className="w-6 h-6 text-primary" />
            <span className="font-heading font-bold text-xl">Edit Event</span>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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

            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setLocation(`/events/${event.id}`)}
                data-testid="button-cancel"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={updateEventMutation.isPending}
                data-testid="button-submit"
              >
                {updateEventMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </Form>
      </main>
    </div>
  );
}

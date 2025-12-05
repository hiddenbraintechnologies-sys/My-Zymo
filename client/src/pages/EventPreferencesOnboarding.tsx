import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, 
  PartyPopper, 
  Dumbbell, 
  ArrowRight, 
  Check,
  Bike,
  GraduationCap,
  Heart,
  Cake,
  Mountain,
  Calendar
} from "lucide-react";
import logoUrl from "@assets/generated_images/myzymo_celebration_app_logo.png";

type PreferenceType = "group_planning" | "private_events" | "public_events";

interface PreferenceOption {
  id: PreferenceType;
  title: string;
  description: string;
  icon: typeof Users;
  examples: { icon: typeof Bike; label: string }[];
  gradient: string;
  borderColor: string;
  redirectTo: string;
}

const preferenceOptions: PreferenceOption[] = [
  {
    id: "group_planning",
    title: "Group Planning",
    description: "Plan trips, rides, and reunions with friends. Coordinate schedules, split expenses, and make group decisions together.",
    icon: Users,
    examples: [
      { icon: Bike, label: "Group Rides" },
      { icon: GraduationCap, label: "Reunions" },
      { icon: Mountain, label: "Adventure Trips" },
    ],
    gradient: "from-blue-500 to-indigo-600",
    borderColor: "border-blue-500/50",
    redirectTo: "/groups",
  },
  {
    id: "private_events",
    title: "Private Events",
    description: "Create invite-only celebrations for birthdays, weddings, anniversaries, and family gatherings with loved ones.",
    icon: PartyPopper,
    examples: [
      { icon: Cake, label: "Birthday Parties" },
      { icon: Heart, label: "Weddings" },
      { icon: Calendar, label: "Anniversaries" },
    ],
    gradient: "from-orange-500 to-amber-500",
    borderColor: "border-orange-500/50",
    redirectTo: "/events/create",
  },
  {
    id: "public_events",
    title: "Public Events",
    description: "Discover and join fitness sessions, marathons, yoga classes, and community activities open to everyone.",
    icon: Dumbbell,
    examples: [
      { icon: Dumbbell, label: "Fitness Bootcamps" },
      { icon: Users, label: "Yoga Sessions" },
      { icon: Mountain, label: "Marathons" },
    ],
    gradient: "from-green-500 to-emerald-600",
    borderColor: "border-green-500/50",
    redirectTo: "/events",
  },
];

export default function EventPreferencesOnboarding() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [selectedPreferences, setSelectedPreferences] = useState<PreferenceType[]>([]);

  const { data: user } = useQuery<{ id: string; firstName?: string; onboardingCompleted?: boolean }>({
    queryKey: ["/api/auth/user"],
  });

  const savePreferencesMutation = useMutation({
    mutationFn: async (preferences: PreferenceType[]) => {
      await apiRequest("/api/user/preferences", "POST", { 
        eventPreferences: preferences,
        onboardingCompleted: true 
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Preferences saved!",
        description: "Your experience has been personalized.",
      });
      
      if (selectedPreferences.length === 1) {
        const pref = preferenceOptions.find(p => p.id === selectedPreferences[0]);
        if (pref) {
          setLocation(pref.redirectTo);
          return;
        }
      }
      setLocation("/dashboard");
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to save preferences",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const togglePreference = (prefId: PreferenceType) => {
    setSelectedPreferences(prev => 
      prev.includes(prefId) 
        ? prev.filter(p => p !== prefId)
        : [...prev, prefId]
    );
  };

  const handleContinue = () => {
    if (selectedPreferences.length === 0) {
      toast({
        title: "Please select at least one preference",
        description: "This helps us personalize your experience.",
        variant: "destructive",
      });
      return;
    }
    savePreferencesMutation.mutate(selectedPreferences);
  };

  const handleSkip = () => {
    savePreferencesMutation.mutate([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-background to-amber-50 dark:from-orange-950/20 dark:via-background dark:to-amber-950/20 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8 md:mb-12">
          <div className="flex justify-center mb-4">
            <img src={logoUrl} alt="Myzymo" className="w-16 h-16 md:w-20 md:h-20" />
          </div>
          <h1 className="text-2xl md:text-4xl font-heading font-bold mb-3 bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
            Welcome{user?.firstName ? `, ${user.firstName}` : ""}!
          </h1>
          <p className="text-muted-foreground text-base md:text-lg max-w-xl mx-auto">
            What kind of events are you planning? Select one or more to personalize your experience.
          </p>
        </div>

        <div className="grid gap-4 md:gap-6 md:grid-cols-3 mb-8">
          {preferenceOptions.map((option) => {
            const isSelected = selectedPreferences.includes(option.id);
            const IconComponent = option.icon;
            
            return (
              <Card
                key={option.id}
                onClick={() => togglePreference(option.id)}
                className={`relative cursor-pointer transition-all duration-300 overflow-visible hover-elevate ${
                  isSelected 
                    ? `ring-2 ring-offset-2 ring-offset-background ${option.borderColor} shadow-lg` 
                    : "hover:shadow-md"
                }`}
                data-testid={`card-preference-${option.id}`}
              >
                {isSelected && (
                  <div className={`absolute -top-2 -right-2 w-6 h-6 rounded-full bg-gradient-to-r ${option.gradient} flex items-center justify-center shadow-md z-10`}>
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}
                
                <div className="p-5 md:p-6">
                  <div className={`w-12 h-12 md:w-14 md:h-14 rounded-xl bg-gradient-to-r ${option.gradient} flex items-center justify-center mb-4 shadow-lg`}>
                    <IconComponent className="w-6 h-6 md:w-7 md:h-7 text-white" />
                  </div>
                  
                  <h3 className="font-heading font-semibold text-lg md:text-xl mb-2">
                    {option.title}
                  </h3>
                  
                  <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                    {option.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-2">
                    {option.examples.map((example, idx) => {
                      const ExampleIcon = example.icon;
                      return (
                        <span 
                          key={idx}
                          className="inline-flex items-center gap-1.5 text-xs bg-muted/50 px-2.5 py-1 rounded-full"
                        >
                          <ExampleIcon className="w-3 h-3" />
                          {example.label}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            size="lg"
            onClick={handleContinue}
            disabled={savePreferencesMutation.isPending}
            className="w-full sm:w-auto bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-8"
            data-testid="button-continue-preferences"
          >
            {savePreferencesMutation.isPending ? (
              "Saving..."
            ) : (
              <>
                Continue
                <ArrowRight className="ml-2 w-4 h-4" />
              </>
            )}
          </Button>
          
          <Button
            variant="ghost"
            size="lg"
            onClick={handleSkip}
            disabled={savePreferencesMutation.isPending}
            className="w-full sm:w-auto text-muted-foreground"
            data-testid="button-skip-preferences"
          >
            Skip for now
          </Button>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          You can always change your preferences later in your profile settings.
        </p>
      </div>
    </div>
  );
}

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, Image, Check, Wand2, Download, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface InvitationCardCreatorProps {
  eventType: string;
  eventTitle: string;
  eventDate: string;
  eventLocation: string;
  onSelectCard: (cardUrl: string) => void;
  selectedCard?: string;
}

interface InvitationTemplate {
  id: string;
  name: string;
  category: string;
  gradient: string;
  accentColor: string;
  pattern: string;
  textColor: string;
}

const INVITATION_TEMPLATES: InvitationTemplate[] = [
  {
    id: "diwali-golden",
    name: "Golden Diwali",
    category: "Diwali Celebration",
    gradient: "from-amber-500 via-orange-500 to-red-500",
    accentColor: "amber-300",
    pattern: "diyas",
    textColor: "white",
  },
  {
    id: "diwali-purple",
    name: "Royal Diwali",
    category: "Diwali Celebration",
    gradient: "from-purple-600 via-pink-500 to-orange-500",
    accentColor: "pink-300",
    pattern: "rangoli",
    textColor: "white",
  },
  {
    id: "holi-rainbow",
    name: "Colorful Holi",
    category: "Holi Celebration",
    gradient: "from-pink-500 via-purple-500 to-blue-500",
    accentColor: "pink-300",
    pattern: "splashes",
    textColor: "white",
  },
  {
    id: "holi-vibrant",
    name: "Vibrant Holi",
    category: "Holi Celebration",
    gradient: "from-yellow-400 via-green-400 to-cyan-400",
    accentColor: "green-300",
    pattern: "colors",
    textColor: "gray-800",
  },
  {
    id: "birthday-confetti",
    name: "Party Confetti",
    category: "Birthday Party",
    gradient: "from-pink-500 via-purple-500 to-indigo-500",
    accentColor: "pink-300",
    pattern: "confetti",
    textColor: "white",
  },
  {
    id: "birthday-golden",
    name: "Golden Celebration",
    category: "Birthday Party",
    gradient: "from-amber-400 via-yellow-500 to-orange-400",
    accentColor: "yellow-200",
    pattern: "sparkles",
    textColor: "gray-800",
  },
  {
    id: "birthday-fun",
    name: "Fun Party",
    category: "Birthday Party",
    gradient: "from-cyan-400 via-blue-500 to-purple-500",
    accentColor: "cyan-300",
    pattern: "balloons",
    textColor: "white",
  },
  {
    id: "wedding-elegant",
    name: "Elegant Wedding",
    category: "Wedding",
    gradient: "from-rose-300 via-pink-200 to-amber-200",
    accentColor: "rose-400",
    pattern: "floral",
    textColor: "gray-800",
  },
  {
    id: "wedding-royal",
    name: "Royal Wedding",
    category: "Wedding",
    gradient: "from-amber-600 via-yellow-500 to-amber-400",
    accentColor: "amber-300",
    pattern: "mandala",
    textColor: "white",
  },
  {
    id: "wedding-modern",
    name: "Modern Wedding",
    category: "Wedding",
    gradient: "from-slate-700 via-gray-600 to-slate-500",
    accentColor: "amber-400",
    pattern: "geometric",
    textColor: "white",
  },
  {
    id: "reunion-classic",
    name: "Classic Reunion",
    category: "College Reunion",
    gradient: "from-blue-600 via-indigo-600 to-purple-600",
    accentColor: "blue-300",
    pattern: "caps",
    textColor: "white",
  },
  {
    id: "reunion-nostalgic",
    name: "Nostalgic Memories",
    category: "School Reunion",
    gradient: "from-emerald-500 via-teal-500 to-cyan-500",
    accentColor: "emerald-300",
    pattern: "books",
    textColor: "white",
  },
  {
    id: "corporate-professional",
    name: "Professional Event",
    category: "Corporate Event",
    gradient: "from-slate-800 via-gray-700 to-slate-600",
    accentColor: "blue-400",
    pattern: "lines",
    textColor: "white",
  },
  {
    id: "corporate-modern",
    name: "Modern Corporate",
    category: "Corporate Event",
    gradient: "from-blue-700 via-blue-600 to-indigo-600",
    accentColor: "cyan-300",
    pattern: "dots",
    textColor: "white",
  },
  {
    id: "engagement-romantic",
    name: "Romantic Engagement",
    category: "Engagement",
    gradient: "from-rose-400 via-pink-400 to-red-400",
    accentColor: "rose-200",
    pattern: "hearts",
    textColor: "white",
  },
  {
    id: "anniversary-golden",
    name: "Golden Anniversary",
    category: "Anniversary",
    gradient: "from-amber-500 via-yellow-400 to-amber-300",
    accentColor: "amber-200",
    pattern: "rings",
    textColor: "gray-800",
  },
  {
    id: "baby-shower-pink",
    name: "Baby Girl Shower",
    category: "Baby Shower",
    gradient: "from-pink-400 via-rose-300 to-pink-200",
    accentColor: "pink-100",
    pattern: "stars",
    textColor: "gray-800",
  },
  {
    id: "baby-shower-blue",
    name: "Baby Boy Shower",
    category: "Baby Shower",
    gradient: "from-blue-400 via-cyan-300 to-blue-200",
    accentColor: "blue-100",
    pattern: "clouds",
    textColor: "gray-800",
  },
  {
    id: "christmas-festive",
    name: "Festive Christmas",
    category: "Christmas Party",
    gradient: "from-red-600 via-red-500 to-green-600",
    accentColor: "yellow-300",
    pattern: "snowflakes",
    textColor: "white",
  },
  {
    id: "newyear-sparkle",
    name: "New Year Sparkle",
    category: "New Year Party",
    gradient: "from-indigo-900 via-purple-800 to-pink-700",
    accentColor: "yellow-400",
    pattern: "fireworks",
    textColor: "white",
  },
  {
    id: "eid-elegant",
    name: "Elegant Eid",
    category: "Eid Celebration",
    gradient: "from-emerald-600 via-teal-500 to-cyan-500",
    accentColor: "yellow-300",
    pattern: "crescent",
    textColor: "white",
  },
  {
    id: "housewarming-warm",
    name: "Warm Welcome",
    category: "Housewarming",
    gradient: "from-orange-500 via-amber-500 to-yellow-500",
    accentColor: "orange-200",
    pattern: "home",
    textColor: "white",
  },
];

const getPatternSVG = (pattern: string) => {
  switch (pattern) {
    case "diyas":
      return `<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60" opacity="0.15"><path d="M30 10 L35 25 L25 25 Z" fill="currentColor"/><circle cx="30" cy="8" r="3" fill="currentColor"/></svg>`;
    case "rangoli":
      return `<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60" opacity="0.1"><circle cx="30" cy="30" r="20" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="30" cy="30" r="10" fill="none" stroke="currentColor" stroke-width="2"/></svg>`;
    case "confetti":
      return `<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60" opacity="0.15"><rect x="10" y="10" width="6" height="6" fill="currentColor" transform="rotate(30 13 13)"/><rect x="40" y="40" width="6" height="6" fill="currentColor" transform="rotate(-20 43 43)"/><rect x="45" y="15" width="6" height="6" fill="currentColor" transform="rotate(45 48 18)"/></svg>`;
    case "sparkles":
      return `<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60" opacity="0.2"><path d="M30 5 L32 15 L42 17 L32 19 L30 29 L28 19 L18 17 L28 15 Z" fill="currentColor"/></svg>`;
    case "hearts":
      return `<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60" opacity="0.15"><path d="M30 50 C10 30 10 15 25 15 C30 15 30 20 30 20 C30 20 30 15 35 15 C50 15 50 30 30 50" fill="currentColor"/></svg>`;
    case "floral":
      return `<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60" opacity="0.1"><circle cx="30" cy="20" r="8" fill="currentColor"/><circle cx="20" cy="30" r="8" fill="currentColor"/><circle cx="40" cy="30" r="8" fill="currentColor"/><circle cx="30" cy="40" r="8" fill="currentColor"/><circle cx="30" cy="30" r="5" fill="currentColor"/></svg>`;
    case "mandala":
      return `<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80" opacity="0.1"><circle cx="40" cy="40" r="30" fill="none" stroke="currentColor" stroke-width="1"/><circle cx="40" cy="40" r="20" fill="none" stroke="currentColor" stroke-width="1"/><circle cx="40" cy="40" r="10" fill="none" stroke="currentColor" stroke-width="1"/><line x1="40" y1="10" x2="40" y2="70" stroke="currentColor" stroke-width="1"/><line x1="10" y1="40" x2="70" y2="40" stroke="currentColor" stroke-width="1"/></svg>`;
    case "geometric":
      return `<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60" opacity="0.1"><polygon points="30,5 55,55 5,55" fill="none" stroke="currentColor" stroke-width="1"/></svg>`;
    case "snowflakes":
      return `<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60" opacity="0.2"><line x1="30" y1="10" x2="30" y2="50" stroke="currentColor" stroke-width="2"/><line x1="10" y1="30" x2="50" y2="30" stroke="currentColor" stroke-width="2"/><line x1="15" y1="15" x2="45" y2="45" stroke="currentColor" stroke-width="1"/><line x1="45" y1="15" x2="15" y2="45" stroke="currentColor" stroke-width="1"/></svg>`;
    case "fireworks":
      return `<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60" opacity="0.15"><circle cx="30" cy="30" r="3" fill="currentColor"/><line x1="30" y1="10" x2="30" y2="20" stroke="currentColor" stroke-width="2"/><line x1="30" y1="40" x2="30" y2="50" stroke="currentColor" stroke-width="2"/><line x1="10" y1="30" x2="20" y2="30" stroke="currentColor" stroke-width="2"/><line x1="40" y1="30" x2="50" y2="30" stroke="currentColor" stroke-width="2"/></svg>`;
    default:
      return `<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60" opacity="0.1"><circle cx="30" cy="30" r="5" fill="currentColor"/></svg>`;
  }
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return "Date TBD";
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const InvitationCardPreview = ({
  template,
  eventTitle,
  eventDate,
  eventLocation,
  isSelected,
  onClick,
}: {
  template: InvitationTemplate;
  eventTitle: string;
  eventDate: string;
  eventLocation: string;
  isSelected: boolean;
  onClick: () => void;
}) => {
  const patternDataUrl = `data:image/svg+xml,${encodeURIComponent(getPatternSVG(template.pattern))}`;
  const textColor = template.textColor === "white" ? "#ffffff" : "#1f2937";
  const textColorFaded = template.textColor === "white" ? "rgba(255,255,255,0.9)" : "rgba(31,41,55,0.9)";
  const textColorLight = template.textColor === "white" ? "rgba(255,255,255,0.7)" : "rgba(31,41,55,0.7)";

  return (
    <div
      className={`relative cursor-pointer transition-all duration-300 rounded-xl overflow-hidden ${
        isSelected ? "ring-4 ring-orange-500 scale-105" : "hover:scale-102 hover:shadow-lg"
      }`}
      onClick={onClick}
      data-testid={`template-${template.id}`}
    >
      {isSelected && (
        <div className="absolute top-2 right-2 z-10 bg-orange-500 text-white rounded-full p-1">
          <Check className="w-4 h-4" />
        </div>
      )}
      <div className={`relative bg-gradient-to-br ${template.gradient} p-6 aspect-[4/3] flex flex-col justify-between`}>
        {/* Pattern overlay */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `url("${patternDataUrl}")`,
            backgroundRepeat: "repeat",
          }}
        />
        <div className="relative z-10 text-center">
          <Badge 
            variant="outline" 
            className="border-white/30 mb-2"
            style={{ 
              backgroundColor: 'rgba(255,255,255,0.2)', 
              color: textColor 
            }}
          >
            You're Invited
          </Badge>
        </div>
        <div className="relative z-10 text-center space-y-2">
          <h3 
            className="text-lg font-bold drop-shadow-md line-clamp-2"
            style={{ color: textColor }}
          >
            {eventTitle || "Your Event Title"}
          </h3>
          <p 
            className="text-sm drop-shadow"
            style={{ color: textColorFaded }}
          >
            {formatDate(eventDate)}
          </p>
          <p 
            className="text-xs"
            style={{ color: textColorLight }}
          >
            {eventLocation || "Event Location"}
          </p>
        </div>
        <div className="relative z-10 text-center">
          <span 
            className="text-xs"
            style={{ color: textColorLight }}
          >
            {template.name}
          </span>
        </div>
      </div>
    </div>
  );
};

export function InvitationCardCreator({
  eventType,
  eventTitle,
  eventDate,
  eventLocation,
  onSelectCard,
  selectedCard,
}: InvitationCardCreatorProps) {
  const { toast } = useToast();
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [generatedAICard, setGeneratedAICard] = useState<string | null>(null);
  const [previewCard, setPreviewCard] = useState<string | null>(null);

  const filteredTemplates = eventType
    ? INVITATION_TEMPLATES.filter(t => t.category.toLowerCase().includes(eventType.toLowerCase()) || eventType.toLowerCase().includes(t.category.toLowerCase().split(" ")[0]))
    : INVITATION_TEMPLATES;

  const displayTemplates = filteredTemplates.length > 0 ? filteredTemplates : INVITATION_TEMPLATES.slice(0, 8);

  const handleTemplateSelect = (template: InvitationTemplate) => {
    setSelectedTemplate(template.id);
    setGeneratedAICard(null);
    const cardDataUrl = generateTemplateDataUrl(template);
    onSelectCard(cardDataUrl);
  };

  const generateTemplateDataUrl = (template: InvitationTemplate) => {
    return `template:${template.id}:${template.gradient}:${template.pattern}`;
  };

  const handleGenerateAICard = async () => {
    if (!eventTitle) {
      toast({
        title: "Event Title Required",
        description: "Please enter an event title first to generate an AI invitation card.",
        variant: "destructive",
      });
      return;
    }

    setIsGeneratingAI(true);
    setSelectedTemplate(null);

    try {
      const response = await fetch("/api/ai/generate-invitation-card", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          eventType: eventType || "celebration",
          eventTitle,
          eventDate,
          eventLocation,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to generate invitation card");
      }

      const data = await response.json();
      setGeneratedAICard(data.imageUrl);
      onSelectCard(data.imageUrl);
      
      toast({
        title: "Invitation Card Generated",
        description: "Your AI-generated invitation card is ready!",
      });
    } catch (error: any) {
      console.error("Error generating AI card:", error);
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate invitation card. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingAI(false);
    }
  };

  return (
    <Card className="border-orange-200 dark:border-orange-800">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Image className="w-5 h-5 text-orange-500" />
          Create Invitation Card
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="templates" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="templates" data-testid="tab-templates">
              <Image className="w-4 h-4 mr-2" />
              Templates
            </TabsTrigger>
            <TabsTrigger value="ai" data-testid="tab-ai">
              <Sparkles className="w-4 h-4 mr-2" />
              AI Generated
            </TabsTrigger>
          </TabsList>

          <TabsContent value="templates" className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Choose from our beautiful pre-designed templates that match your event type.
            </p>
            
            {eventType && filteredTemplates.length > 0 && (
              <Badge variant="outline" className="bg-orange-50 dark:bg-orange-950 text-orange-700 dark:text-orange-300">
                Showing templates for: {eventType}
              </Badge>
            )}

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-96 overflow-y-auto pr-2">
              {displayTemplates.map((template) => (
                <InvitationCardPreview
                  key={template.id}
                  template={template}
                  eventTitle={eventTitle}
                  eventDate={eventDate}
                  eventLocation={eventLocation}
                  isSelected={selectedTemplate === template.id}
                  onClick={() => handleTemplateSelect(template)}
                />
              ))}
            </div>

            {displayTemplates.length < INVITATION_TEMPLATES.length && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full">
                    <Eye className="w-4 h-4 mr-2" />
                    View All {INVITATION_TEMPLATES.length} Templates
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>All Invitation Templates</DialogTitle>
                  </DialogHeader>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                    {INVITATION_TEMPLATES.map((template) => (
                      <InvitationCardPreview
                        key={template.id}
                        template={template}
                        eventTitle={eventTitle}
                        eventDate={eventDate}
                        eventLocation={eventLocation}
                        isSelected={selectedTemplate === template.id}
                        onClick={() => handleTemplateSelect(template)}
                      />
                    ))}
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </TabsContent>

          <TabsContent value="ai" className="space-y-4">
            <div className="text-center space-y-4 py-4">
              <div className="bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 text-white rounded-xl p-6 space-y-3">
                <Wand2 className="w-12 h-12 mx-auto opacity-90" />
                <h3 className="font-semibold text-lg">AI-Powered Design</h3>
                <p className="text-sm text-white/90">
                  Generate a unique, beautiful invitation card using AI based on your event details.
                </p>
              </div>

              <Button
                onClick={handleGenerateAICard}
                disabled={isGeneratingAI || !eventTitle}
                className="w-full bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:to-amber-600"
                data-testid="button-generate-ai-card"
              >
                {isGeneratingAI ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating Your Card...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate AI Invitation Card
                  </>
                )}
              </Button>

              {!eventTitle && (
                <p className="text-xs text-muted-foreground">
                  Enter an event title above to enable AI generation
                </p>
              )}

              {generatedAICard && (
                <div className="space-y-3">
                  <div className="relative rounded-xl overflow-hidden border-2 border-orange-300">
                    <img
                      src={generatedAICard}
                      alt="AI Generated Invitation Card"
                      className="w-full h-auto"
                      data-testid="ai-generated-card"
                    />
                    <div className="absolute top-2 right-2 bg-orange-500 text-white rounded-full p-1">
                      <Check className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={handleGenerateAICard}
                      disabled={isGeneratingAI}
                      data-testid="button-regenerate-ai-card"
                    >
                      <Wand2 className="w-4 h-4 mr-1" />
                      Regenerate
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => {
                        const link = document.createElement("a");
                        link.href = generatedAICard;
                        link.download = `invitation-${eventTitle.replace(/\s+/g, "-")}.png`;
                        link.click();
                      }}
                      data-testid="button-download-card"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Download
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

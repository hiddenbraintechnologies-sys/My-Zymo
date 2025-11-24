import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface EventFieldSuggestionsProps {
  eventType: string;
  date?: string;
  location?: string;
  guestCount?: number;
  onSelectTitle?: (title: string) => void;
  onSelectDescription?: (description: string) => void;
}

interface Suggestions {
  titles: string[];
  descriptions: string[];
}

export function EventFieldSuggestions({
  eventType,
  date,
  location,
  guestCount,
  onSelectTitle,
  onSelectDescription,
}: EventFieldSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<Suggestions | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSuggestions = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/ai/event-suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ eventType, date, location, guestCount }),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch suggestions');
      }

      const data = await response.json();
      setSuggestions(data);
    } catch (err: any) {
      console.error('Error fetching AI suggestions:', err);
      setError(err.message || 'Failed to generate suggestions');
    } finally {
      setIsLoading(false);
    }
  };

  if (!suggestions && !isLoading && !error) {
    return (
      <Button
        type="button"
        variant="outline"
        onClick={fetchSuggestions}
        className="w-full"
        data-testid="button-generate-suggestions"
      >
        <Sparkles className="w-4 h-4 mr-2" />
        Get AI Suggestions
      </Button>
    );
  }

  if (isLoading) {
    return (
      <Card className="border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Generating creative suggestions...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive/50">
        <CardContent className="pt-6">
          <p className="text-sm text-destructive mb-3">{error}</p>
          <Button
            type="button"
            variant="outline"
            onClick={fetchSuggestions}
            size="sm"
            data-testid="button-retry-suggestions"
          >
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!suggestions) {
    return null;
  }

  return (
    <div className="space-y-4">
      {onSelectTitle && suggestions.titles.length > 0 && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <CardTitle className="text-base">Title Suggestions</CardTitle>
            </div>
            <CardDescription className="text-xs">
              Click to use a suggestion or type your own
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {suggestions.titles.map((title, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="cursor-pointer hover-elevate active-elevate-2 px-3 py-2 text-sm font-normal"
                  onClick={() => onSelectTitle(title)}
                  data-testid={`suggestion-title-${index}`}
                >
                  {title}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {onSelectDescription && suggestions.descriptions.length > 0 && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <CardTitle className="text-base">Description Suggestions</CardTitle>
            </div>
            <CardDescription className="text-xs">
              Click to use a suggestion or write your own
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {suggestions.descriptions.map((description, index) => (
                <Button
                  key={index}
                  type="button"
                  variant="outline"
                  className="w-full h-auto p-3 text-left text-sm font-normal whitespace-normal hover-elevate active-elevate-2"
                  onClick={() => onSelectDescription(description)}
                  data-testid={`suggestion-description-${index}`}
                >
                  {description}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={fetchSuggestions}
        className="w-full"
        data-testid="button-regenerate-suggestions"
      >
        <Sparkles className="w-4 h-4 mr-2" />
        Regenerate Suggestions
      </Button>
    </div>
  );
}

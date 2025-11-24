import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight, X } from "lucide-react";
import { useLocation } from "wouter";
import { useState, useEffect } from "react";

export default function TopBanner() {
  const [, setLocation] = useLocation();
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const bannerClosed = localStorage.getItem('topBannerClosed');
    if (bannerClosed === 'true') {
      setIsVisible(false);
    }
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem('topBannerClosed', 'true');
  };

  if (!isVisible) return null;

  return (
    <div className="relative bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50 dark:from-orange-950/30 dark:via-amber-950/30 dark:to-orange-950/30 border-b-4 border-primary/30 overflow-hidden">
      <div className="absolute inset-0 opacity-10 dark:opacity-5">
        <div className="absolute top-0 left-0 w-32 h-32 bg-primary/20 rounded-full -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute top-0 right-0 w-40 h-40 bg-primary/20 rounded-full translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 left-1/4 w-24 h-24 bg-primary/20 rounded-full translate-y-1/2" />
        <div className="absolute bottom-0 right-1/3 w-36 h-36 bg-primary/20 rounded-full translate-y-1/2" />
      </div>

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(251,146,60,0.1),transparent_50%)] dark:bg-[radial-gradient(circle_at_50%_120%,rgba(251,146,60,0.05),transparent_50%)]" />

      <button
        onClick={handleClose}
        className="absolute top-3 right-3 z-10 p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors group"
        aria-label="Close banner"
        data-testid="button-close-top-banner"
      >
        <X className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
      </button>

      <div className="relative max-w-7xl mx-auto px-4 py-8 md:py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left flex-1">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-primary animate-pulse" />
              <span className="text-sm font-semibold text-primary uppercase tracking-wider">
                Join Thousands Celebrating
              </span>
            </div>
            <h2 className="font-heading font-bold text-3xl md:text-4xl lg:text-5xl mb-3 bg-gradient-to-r from-primary via-orange-600 to-primary bg-clip-text text-transparent">
              Start Planning Your Perfect Event
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl">
              From reunions to weddings, birthdays to festivals - create unforgettable celebrations with your loved ones
            </p>
          </div>

          <div className="flex flex-col items-center gap-4">
            <Button
              size="lg"
              className="bg-gradient-to-r from-primary to-orange-600 hover:from-primary/90 hover:to-orange-500 text-white font-semibold text-lg px-10 py-7 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group"
              data-testid="button-top-banner-signup"
              onClick={() => setLocation('/signup')}
            >
              Create Free Account
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              No credit card required • Free forever
            </p>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-primary/20">
          <div className="flex flex-wrap justify-center md:justify-start gap-6 md:gap-8 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <span className="text-2xl">🎉</span>
              <span>Group Planning</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <span className="text-2xl">💬</span>
              <span>Real-time Chat</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <span className="text-2xl">💰</span>
              <span>Split Expenses</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <span className="text-2xl">🎪</span>
              <span>Book Vendors</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

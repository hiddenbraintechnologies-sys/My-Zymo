import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight, X, Users, MessageCircle, Wallet, Store } from "lucide-react";
import { useLocation } from "wouter";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";

export default function TopBanner() {
  const [, setLocation] = useLocation();
  const [isVisible, setIsVisible] = useState(true);
  const { user } = useAuth();
  const [location] = useLocation();

  // Don't show banner on admin pages
  const isAdminPage = location.startsWith('/admin') || location.startsWith('/vendor');
  
  const handleClose = () => {
    setIsVisible(false);
    // Store preference in session storage
    sessionStorage.setItem('topBannerClosed', 'true');
  };

  useEffect(() => {
    // Check if banner was closed this session
    const wasClosed = sessionStorage.getItem('topBannerClosed');
    if (wasClosed) {
      setIsVisible(false);
    }
  }, []);

  if (!isVisible || isAdminPage) return null;

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

      <div className="relative max-w-7xl mx-auto px-4 py-6 md:py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left flex-1">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-primary animate-pulse" />
              <span className="text-sm font-semibold text-primary uppercase tracking-wider">
                Plan Your Perfect Gathering
              </span>
            </div>
            <h2 className="font-heading font-bold text-2xl md:text-3xl lg:text-4xl mb-3 bg-gradient-to-r from-primary via-orange-600 to-primary bg-clip-text text-transparent">
              From college reunions to birthday bashes
            </h2>
            <p className="text-sm md:text-base text-muted-foreground max-w-2xl">
              Organize unforgettable celebrations with ease - your one-stop platform for all social gatherings
            </p>
          </div>

          <div className="flex flex-col items-center gap-3">
            <Button
              size="lg"
              className="bg-gradient-to-r from-primary to-orange-600 hover:from-primary/90 hover:to-orange-500 text-white font-semibold text-base md:text-lg px-8 py-6 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group"
              data-testid="button-top-banner-cta"
              onClick={() => setLocation(user ? '/events/create' : '/signup')}
            >
              {user ? 'Create Event' : 'Get Started Free'}
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            {!user && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                No credit card required
              </p>
            )}
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-primary/20">
          <div className="flex flex-wrap justify-center md:justify-start gap-4 md:gap-8 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="w-5 h-5 text-primary" />
              <span>Group Planning</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <MessageCircle className="w-5 h-5 text-primary" />
              <span>Real-time Chat</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Wallet className="w-5 h-5 text-primary" />
              <span>Split Expenses</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Store className="w-5 h-5 text-primary" />
              <span>Book Vendors</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

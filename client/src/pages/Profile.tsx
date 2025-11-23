import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { LogOut, Plus } from "lucide-react";
import logoUrl from "@assets/generated_images/myzymo_celebration_app_logo.png";
import ProfileSidebar from "@/components/ProfileSidebar";
import EventInvites from "@/components/EventInvites";
import ChatRoom from "@/components/ChatRoom";

export default function Profile() {
  const { user, isLoading: authLoading } = useAuth();

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Skeleton className="h-8 w-48" />
      </div>
    );
  }

  if (!user) {
    window.location.href = "/api/login";
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header - Mobile Optimized */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 h-14 sm:h-16 flex items-center justify-between gap-2">
          <Link href="/" data-testid="link-home">
            <div className="flex items-center gap-1.5 sm:gap-2 cursor-pointer hover-elevate active-elevate-2 rounded-md px-1.5 sm:px-2 py-1 -ml-1.5 sm:-ml-2">
              <img src={logoUrl} alt="Myzymo" className="w-8 h-8 sm:w-10 sm:h-10" />
              <span className="font-heading font-bold text-lg sm:text-xl">Myzymo</span>
            </div>
          </Link>
          
          <div className="flex items-center gap-1 sm:gap-4">
            <Link href="/events" data-testid="link-events">
              <Button variant="ghost" size="sm" className="hidden sm:flex">Events</Button>
              <Button variant="ghost" size="icon" className="sm:hidden">
                <span className="text-xs font-medium">Events</span>
              </Button>
            </Link>
            <Link href="/vendors" data-testid="link-vendors">
              <Button variant="ghost" size="sm" className="hidden sm:flex">Vendors</Button>
              <Button variant="ghost" size="icon" className="sm:hidden">
                <span className="text-xs font-medium">Vendors</span>
              </Button>
            </Link>
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-sm font-medium" data-testid="text-current-user">
                {user.firstName} {user.lastName}
              </span>
            </div>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleLogout}
              data-testid="button-logout"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content - Mobile First Layout */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        {/* Create Event CTA - Prominent on mobile */}
        <div className="mb-4 sm:mb-6">
          <Link href="/events/create">
            <Button 
              className="w-full sm:w-auto" 
              size="lg"
              data-testid="button-create-event"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create New Event
            </Button>
          </Link>
        </div>

        {/* LinkedIn-style Layout - Stacks on mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
          {/* Left Sidebar - Profile Card */}
          <div className="lg:col-span-3">
            <ProfileSidebar user={user} />
          </div>
          
          {/* Main Content Area - Chat Room */}
          <div className="lg:col-span-6">
            <ChatRoom />
          </div>
          
          {/* Right Sidebar - Event Invites */}
          <div className="lg:col-span-3">
            <EventInvites />
          </div>
        </div>
      </main>
    </div>
  );
}

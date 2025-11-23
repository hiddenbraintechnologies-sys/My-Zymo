import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { LogOut } from "lucide-react";
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
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" data-testid="link-home">
            <div className="flex items-center gap-2 cursor-pointer hover-elevate active-elevate-2 rounded-md px-2 py-1 -ml-2">
              <img src={logoUrl} alt="Myzymo" className="w-10 h-10" />
              <span className="font-heading font-bold text-xl">Myzymo</span>
            </div>
          </Link>
          
          <div className="flex items-center gap-4">
            <Link href="/events" data-testid="link-events">
              <Button variant="ghost">Events</Button>
            </Link>
            <Link href="/vendors" data-testid="link-vendors">
              <Button variant="ghost">Vendors</Button>
            </Link>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium" data-testid="text-current-user">
                {user.firstName} {user.lastName}
              </span>
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
        </div>
      </header>

      {/* LinkedIn-style Layout */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
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

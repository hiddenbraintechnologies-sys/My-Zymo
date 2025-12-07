import { useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import LandingPage from "@/pages/LandingPage";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import Dashboard from "@/pages/Dashboard";
import Events from "@/pages/Events";
import CreateEvent from "@/pages/CreateEvent";
import EditEvent from "@/pages/EditEvent";
import EventDetail from "@/pages/EventDetail";
import Vendors from "@/pages/Vendors";
import VendorDetail from "@/pages/VendorDetail";
import Profile from "@/pages/Profile";
import AIAssistant from "@/pages/AIAssistant";
import Messages from "@/pages/Messages";
import AdminDashboard from "@/pages/AdminDashboard";
import UserManagement from "@/pages/UserManagement";
import EventManagement from "@/pages/EventManagement";
import VendorManagement from "@/pages/VendorManagement";
import VendorLogin from "@/pages/VendorLogin";
import VendorSignup from "@/pages/VendorSignup";
import VendorDashboard from "@/pages/VendorDashboard";
import GroupPlanning from "@/pages/GroupPlanning";
import GroupDetail from "@/pages/GroupDetail";
import Chat from "@/pages/Chat";
import ChatInvite from "@/pages/ChatInvite";
import EventPreferencesOnboarding from "@/pages/EventPreferencesOnboarding";
import ExpenseSplitDemo from "@/pages/ExpenseSplitDemo";
import EventsDemo from "@/pages/EventsDemo";
import VendorMarketplaceDemo from "@/pages/VendorMarketplaceDemo";
import NotFound from "@/pages/not-found";

// Universal post-auth redirect handler
function PostAuthRedirectHandler() {
  const { user, isLoading: authLoading } = useAuth();
  const [location, setLocation] = useLocation();

  useEffect(() => {
    if (user && !authLoading) {
      // Check for stored redirect URL (from social login)
      const redirectUrl = sessionStorage.getItem('authRedirect');
      if (redirectUrl) {
        sessionStorage.removeItem('authRedirect');
        setLocation(redirectUrl);
        return;
      }
      // Check for pending join code (for group invite links)
      const pendingCode = sessionStorage.getItem('pendingJoinCode');
      if (pendingCode) {
        sessionStorage.removeItem('pendingJoinCode');
        setLocation(`/groups?join=${pendingCode}`);
        return;
      }
      
      // Check if new user needs onboarding (social login users)
      // Only redirect if they're on the dashboard or login page and haven't completed onboarding
      const isOnAuthPage = location === "/" || location === "/login" || location === "/signup";
      const userWithOnboarding = user as { onboardingCompleted?: boolean };
      if (isOnAuthPage && userWithOnboarding.onboardingCompleted === false) {
        setLocation("/onboarding/preferences");
        return;
      }
    }
  }, [user, authLoading, location, setLocation]);

  return null;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/events" component={Events} />
      <Route path="/events/create" component={CreateEvent} />
      <Route path="/events/:id/edit" component={EditEvent} />
      <Route path="/events/:id" component={EventDetail} />
      <Route path="/vendors" component={Vendors} />
      <Route path="/vendors/:id" component={VendorDetail} />
      <Route path="/ai-assistant" component={AIAssistant} />
      <Route path="/profile" component={Profile} />
      <Route path="/messages/:userId" component={Messages} />
      <Route path="/messages" component={Messages} />
      <Route path="/chat" component={Chat} />
      <Route path="/chat-invite/:code" component={ChatInvite} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/users" component={UserManagement} />
      <Route path="/admin/events" component={EventManagement} />
      <Route path="/admin/vendors" component={VendorManagement} />
      <Route path="/vendor/login" component={VendorLogin} />
      <Route path="/vendor/signup" component={VendorSignup} />
      <Route path="/vendor/dashboard" component={VendorDashboard} />
      <Route path="/groups" component={GroupPlanning} />
      <Route path="/groups/:id" component={GroupDetail} />
      <Route path="/onboarding/preferences" component={EventPreferencesOnboarding} />
      <Route path="/split-expenses" component={ExpenseSplitDemo} />
      <Route path="/manage-events" component={EventsDemo} />
      <Route path="/vendor-marketplace" component={VendorMarketplaceDemo} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <PostAuthRedirectHandler />
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import FloatingChat from "@/components/FloatingChat";
import LandingPage from "@/pages/LandingPage";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import Dashboard from "@/pages/Dashboard";
import Events from "@/pages/Events";
import CreateEvent from "@/pages/CreateEvent";
import EditEvent from "@/pages/EditEvent";
import EventDetail from "@/pages/EventDetail";
import Vendors from "@/pages/Vendors";
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
import NotFound from "@/pages/not-found";

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
      <Route path="/ai-assistant" component={AIAssistant} />
      <Route path="/profile" component={Profile} />
      <Route path="/messages/:userId" component={Messages} />
      <Route path="/messages" component={Messages} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/users" component={UserManagement} />
      <Route path="/admin/events" component={EventManagement} />
      <Route path="/admin/vendors" component={VendorManagement} />
      <Route path="/vendor/login" component={VendorLogin} />
      <Route path="/vendor/signup" component={VendorSignup} />
      <Route path="/vendor/dashboard" component={VendorDashboard} />
      <Route path="/groups" component={GroupPlanning} />
      <Route path="/groups/:id" component={GroupDetail} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
        <FloatingChat />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

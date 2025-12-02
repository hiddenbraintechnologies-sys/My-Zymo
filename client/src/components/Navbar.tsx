import { Button } from "@/components/ui/button";
import { Menu, Moon, Sun, LogOut, LayoutDashboard, CalendarDays, Store, User } from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "wouter";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import logoUrl from "@assets/generated_images/myzymo_celebration_app_logo.png";
import { useAuth } from "@/hooks/useAuth";

export default function Navbar() {
  const [isDark, setIsDark] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDark]);

  // Landing page navigation links (for non-authenticated users)
  const landingNavLinks = [
    { label: "Events", href: "/events" },
    { label: "Features", href: "#features" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "Vendors", href: "/vendor/login" },
  ];

  // Authenticated user navigation links
  const authNavLinks = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Events", href: "/events", icon: CalendarDays },
    { label: "Vendors", href: "/vendors", icon: Store },
    { label: "Profile", href: "/profile", icon: User },
  ];

  // If user is authenticated, logo should link to dashboard, otherwise to home
  const logoHref = user ? "/dashboard" : "/";

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-2 relative">
        {/* Logo - Left on desktop, Center on mobile */}
        <Link href={logoHref} data-testid="link-home" className="md:relative absolute left-1/2 -translate-x-1/2 md:left-0 md:translate-x-0">
          <div className="flex items-center gap-2 cursor-pointer hover-elevate active-elevate-2 rounded-md px-2 py-1">
            <img src={logoUrl} alt="Myzymo" className="w-10 h-10 flex-shrink-0" />
            <span className="font-heading font-bold text-xl">Myzymo</span>
          </div>
        </Link>
        
        {/* Show different navigation based on authentication */}
        {user ? (
          // Authenticated user navigation
          <div className="flex items-center gap-2 md:gap-4 ml-auto">
            {/* Desktop navigation - hidden on mobile */}
            <div className="hidden md:flex items-center gap-2">
              {authNavLinks.map((link) => (
                <Link key={link.label} href={link.href} data-testid={`link-${link.label.toLowerCase()}`}>
                  <Button variant="ghost">{link.label}</Button>
                </Link>
              ))}
            </div>
            
            {/* User info and logout - visible on desktop */}
            <div className="hidden md:flex items-center gap-2">
              <span className="text-sm truncate max-w-[120px]" data-testid="text-user-name">
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
            
            {/* Mobile menu for authenticated users */}
            <Sheet>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon" data-testid="button-auth-menu">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <div className="flex flex-col gap-4 mt-8">
                  <div className="text-lg font-medium text-muted-foreground mb-2">
                    Hi, {user.firstName}!
                  </div>
                  {authNavLinks.map((link) => (
                    <Link key={link.label} href={link.href}>
                      <div className="flex items-center gap-3 text-lg font-medium hover:text-primary transition-colors py-2">
                        <link.icon className="w-5 h-5" />
                        {link.label}
                      </div>
                    </Link>
                  ))}
                  <div className="border-t pt-4 mt-2">
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={handleLogout}
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Log Out
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        ) : (
          // Landing page navigation
          <>
            <div className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
              {landingNavLinks.map((link) => (
                <a 
                  key={link.label}
                  href={link.href}
                  className="text-sm font-medium hover:text-primary transition-colors"
                  data-testid={`link-nav-${link.label.toLowerCase().replace(' ', '-')}`}
                >
                  {link.label}
                </a>
              ))}
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsDark(!isDark)}
                data-testid="button-theme-toggle"
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </Button>
              
              <div className="hidden md:flex items-center gap-2">
                <Link href="/login">
                  <Button 
                    variant="ghost" 
                    data-testid="button-login"
                  >
                    Log In
                  </Button>
                </Link>
              </div>
              
              <Sheet>
                <SheetTrigger asChild className="md:hidden">
                  <Button variant="ghost" size="icon" data-testid="button-menu">
                    <Menu className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <div className="flex flex-col gap-4 mt-8">
                    {landingNavLinks.map((link) => (
                      <a 
                        key={link.label}
                        href={link.href}
                        className="text-lg font-medium hover:text-primary transition-colors"
                      >
                        {link.label}
                      </a>
                    ))}
                    <div className="flex flex-col gap-2 mt-4">
                      <Link href="/login">
                        <Button 
                          variant="outline" 
                          className="w-full"
                        >
                          Log In
                        </Button>
                      </Link>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </>
        )}
      </div>
    </nav>
  );
}

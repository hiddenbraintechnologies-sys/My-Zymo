import { Button } from "@/components/ui/button";
import { Menu, Moon, Sun } from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "wouter";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import logoUrl from "@assets/generated_images/myzymo_celebration_app_logo.png";

export default function Navbar() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDark]);

  const navLinks = [
    { label: "Features", href: "#features" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "Vendors", href: "#vendors" },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" data-testid="link-home">
          <div className="flex items-center gap-2 cursor-pointer hover-elevate active-elevate-2 rounded-md px-2 py-1 -ml-2">
            <img src={logoUrl} alt="Myzymo" className="w-10 h-10" />
            <span className="font-heading font-bold text-xl">Myzymo</span>
          </div>
        </Link>
        
        <div className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
          {navLinks.map((link) => (
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
            <Link href="/signup">
              <Button 
                data-testid="button-signup"
              >
                Sign Up
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
                {navLinks.map((link) => (
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
                  <Link href="/signup">
                    <Button 
                      className="w-full"
                    >
                      Sign Up
                    </Button>
                  </Link>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}

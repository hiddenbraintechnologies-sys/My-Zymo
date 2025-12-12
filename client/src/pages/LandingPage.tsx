import Navbar from "@/components/Navbar";
import LandingHero from "@/components/LandingHero";
import EventDiscoveryGrid from "@/components/EventDiscoveryGrid";
import PlatformAddOnsRail from "@/components/PlatformAddOnsRail";
import PublicEventsShowcase from "@/components/PublicEventsShowcase";
import VendorShowcase from "@/components/VendorShowcase";
import Testimonials from "@/components/Testimonials";
import Footer from "@/components/Footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <Navbar />
      <LandingHero />
      <EventDiscoveryGrid />
      <PlatformAddOnsRail />
      <PublicEventsShowcase />
      <VendorShowcase />
      <Testimonials />
      <Footer />
    </div>
  );
}

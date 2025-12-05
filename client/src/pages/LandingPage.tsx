import Navbar from "@/components/Navbar";
import TopBanner from "@/components/TopBanner";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import HowItWorks from "@/components/HowItWorks";
import PublicEventsShowcase from "@/components/PublicEventsShowcase";
import VendorShowcase from "@/components/VendorShowcase";
import Testimonials from "@/components/Testimonials";
import Footer from "@/components/Footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <Navbar />
      <TopBanner />
      <Hero />
      <Features />
      <PublicEventsShowcase />
      <HowItWorks />
      <VendorShowcase />
      <Testimonials />
      <Footer />
    </div>
  );
}

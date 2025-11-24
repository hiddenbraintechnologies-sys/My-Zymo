import Navbar from "@/components/Navbar";
import TopBanner from "@/components/TopBanner";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import HowItWorks from "@/components/HowItWorks";
import VendorShowcase from "@/components/VendorShowcase";
import Testimonials from "@/components/Testimonials";
import FinalCTA from "@/components/FinalCTA";
import Footer from "@/components/Footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <TopBanner />
      <Hero />
      <Features />
      <HowItWorks />
      <VendorShowcase />
      <Testimonials />
      <FinalCTA />
      <Footer />
    </div>
  );
}

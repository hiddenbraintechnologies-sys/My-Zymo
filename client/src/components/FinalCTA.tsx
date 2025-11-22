import { Button } from "@/components/ui/button";
import collegeReunionImage from "@assets/generated_images/college_reunion_event_placeholder.png";

export default function FinalCTA() {
  return (
    <section className="relative py-20 md:py-32 px-4 overflow-hidden">
      <img 
        src={collegeReunionImage} 
        alt="Celebration" 
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/60" />
      
      <div className="relative max-w-4xl mx-auto text-center text-white">
        <h2 className="font-heading font-bold text-3xl md:text-5xl lg:text-6xl mb-6">
          Start Planning Today
        </h2>
        <p className="text-lg md:text-xl mb-8 md:mb-10 text-white/95 max-w-2xl mx-auto">
          Join thousands making their celebrations unforgettable. Free to get started!
        </p>
        <Button 
          size="lg" 
          className="bg-primary hover:bg-primary/90 text-primary-foreground text-base md:text-lg px-8 md:px-10 py-6"
          data-testid="button-create-account"
          onClick={() => console.log('Create account clicked')}
        >
          Create Free Account
        </Button>
      </div>
    </section>
  );
}

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import QuoteDialog from "@/components/QuoteDialog";
import heroImage from "@assets/generated_images/homepage_hero_celebration_image.png";

export default function Hero() {
  const [quoteDialogOpen, setQuoteDialogOpen] = useState(false);

  return (
    <div className="relative h-[70vh] md:h-[80vh] w-full overflow-hidden">
      <img 
        src={heroImage} 
        alt="Celebration" 
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/60" />
      
      <div className="relative h-full flex flex-col items-center justify-center px-4 text-center text-white">
        <h1 className="font-heading font-bold text-5xl md:text-6xl lg:text-7xl xl:text-8xl mb-6 md:mb-8 leading-tight">
          Plan Your Perfect Gathering
        </h1>
        <p className="text-xl md:text-2xl lg:text-3xl max-w-4xl text-white/95 font-light mb-8">
          From college reunions to birthday bashes, organize unforgettable celebrations with ease
        </p>
        <Button
          data-testid="button-get-quote"
          size="lg"
          className="bg-primary/90 backdrop-blur-sm text-white border border-white/20 hover:bg-primary text-lg px-8 py-6 shadow-lg"
          onClick={() => setQuoteDialogOpen(true)}
        >
          <Sparkles className="mr-2 h-5 w-5" />
          Get a Free Quote
        </Button>
      </div>

      <QuoteDialog open={quoteDialogOpen} onOpenChange={setQuoteDialogOpen} />
    </div>
  );
}

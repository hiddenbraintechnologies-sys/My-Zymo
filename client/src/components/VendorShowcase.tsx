import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import venueImage from "@assets/generated_images/wedding_venue_category_image.png";
import cateringImage from "@assets/generated_images/catering_food_category_image.png";
import photographyImage from "@assets/generated_images/photography_service_category_image.png";
import decorationImage from "@assets/generated_images/decoration_service_category_image.png";

const categories = [
  {
    name: "Venues",
    image: venueImage,
    count: "150+ venues",
  },
  {
    name: "Catering",
    image: cateringImage,
    count: "200+ caterers",
  },
  {
    name: "Photography",
    image: photographyImage,
    count: "80+ photographers",
  },
  {
    name: "Decoration",
    image: decorationImage,
    count: "120+ decorators",
  },
];

export default function VendorShowcase() {
  return (
    <section className="py-12 md:py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12 gap-4">
          <div>
            <h2 className="font-heading font-semibold text-3xl md:text-4xl lg:text-5xl mb-4">
              Trusted Vendors
            </h2>
            <p className="text-muted-foreground text-lg md:text-xl max-w-2xl">
              Connect with verified professionals for all your celebration needs
            </p>
          </div>
          <Button 
            variant="outline" 
            className="gap-2"
            data-testid="button-browse-all-vendors"
            onClick={() => console.log('Browse all vendors clicked')}
          >
            Browse All
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {categories.map((category, index) => (
            <Card 
              key={index}
              className="overflow-hidden hover-elevate cursor-pointer group"
              data-testid={`card-vendor-category-${index}`}
              onClick={() => console.log(`${category.name} category clicked`)}
            >
              <div className="aspect-[4/3] overflow-hidden">
                <img 
                  src={category.image} 
                  alt={category.name}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                />
              </div>
              <div className="p-4">
                <h3 className="font-heading font-semibold text-lg mb-1">
                  {category.name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {category.count}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

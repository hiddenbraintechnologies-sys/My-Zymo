import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselNext, 
  CarouselPrevious 
} from "@/components/ui/carousel";
import { 
  GraduationCap, 
  IndianRupee, 
  Users, 
  Camera, 
  Bell, 
  Store,
  ArrowRight,
  Sparkles,
  Percent,
  Gift
} from "lucide-react";
import { useLocation } from "wouter";

import reunionImg from "@assets/stock_images/college_students_reu_249c6b76.jpg";
import splitExpensesImg from "@assets/stock_images/friends_splitting_bi_7e800c45.jpg";
import groupBookingImg from "@assets/stock_images/group_booking_event__e3402e99.jpg";
import photoMemoriesImg from "@assets/stock_images/friends_taking_photo_8f8be79d.jpg";
import earlyBirdImg from "@assets/stock_images/early_booking_deals__dd67b393.jpg";

const promotions = [
  {
    id: 1,
    title: "Student Reunions",
    subtitle: "Special rates for college batches",
    discount: "20% OFF",
    description: "Plan your batch reunion with exclusive vendor discounts",
    gradient: "from-purple-500 to-pink-500",
    icon: GraduationCap,
    cta: "Plan Reunion",
    link: "/events/create",
    bgImage: reunionImg,
  },
  {
    id: 2,
    title: "Split Expenses",
    subtitle: "No more awkward money talks",
    badge: "Free Tool",
    description: "Track who paid what and settle up easily",
    gradient: "from-green-500 to-emerald-500",
    icon: IndianRupee,
    cta: "Try Now",
    link: "/split-expenses",
    bgImage: splitExpensesImg,
  },
  {
    id: 3,
    title: "Group Bookings",
    subtitle: "Save more with group rates",
    discount: "15% OFF",
    description: "Book venues for 50+ guests and save big",
    gradient: "from-blue-500 to-cyan-500",
    icon: Users,
    cta: "Find Venues",
    link: "/vendors",
    bgImage: groupBookingImg,
  },
  {
    id: 4,
    title: "Photo Memories",
    subtitle: "Capture every moment",
    badge: "New Feature",
    description: "Create shared photo albums for your events",
    gradient: "from-amber-500 to-orange-500",
    icon: Camera,
    cta: "Explore",
    link: "/photo-album",
    bgImage: photoMemoriesImg,
  },
  {
    id: 5,
    title: "Early Bird Deals",
    subtitle: "Plan ahead & save",
    discount: "25% OFF",
    description: "Book vendors 3 months in advance for best rates",
    gradient: "from-rose-500 to-red-500",
    icon: Bell,
    cta: "Browse Deals",
    link: "/vendors",
    bgImage: earlyBirdImg,
  },
];

export default function PromotionsCarousel() {
  const [, navigate] = useLocation();

  return (
    <section className="py-12 bg-muted/30" data-testid="section-promotions">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-heading font-semibold text-2xl md:text-3xl mb-2">
              What's New?
            </h2>
            <p className="text-muted-foreground">
              Find exclusive offers and the best deals available for you
            </p>
          </div>
          <Button variant="ghost" className="hidden md:flex gap-2 text-primary" data-testid="button-view-all-offers">
            Deals and Offers
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>

        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-4">
            {promotions.map((promo) => (
              <CarouselItem key={promo.id} className="pl-4 md:basis-1/2 lg:basis-1/3">
                <Card 
                  className="overflow-hidden cursor-pointer hover-elevate h-full"
                  onClick={() => navigate(promo.link)}
                  data-testid={`card-promo-${promo.id}`}
                >
                  <div className="h-32 relative overflow-hidden">
                    <img 
                      src={promo.bgImage} 
                      alt={promo.title}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className={`absolute inset-0 bg-gradient-to-r ${promo.gradient} opacity-70`} />
                    <div className="absolute inset-0 bg-black/20" />
                    <promo.icon className="absolute right-4 top-4 w-16 h-16 text-white/30" />
                    <div className="absolute bottom-4 left-4">
                      {promo.discount && (
                        <Badge className="bg-white text-foreground font-bold">
                          <Percent className="w-3 h-3 mr-1" />
                          {promo.discount}
                        </Badge>
                      )}
                      {promo.badge && (
                        <Badge className="bg-yellow-400 text-yellow-900 font-bold">
                          <Sparkles className="w-3 h-3 mr-1" />
                          {promo.badge}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-1">{promo.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{promo.description}</p>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="w-full gap-2"
                      data-testid={`button-promo-cta-${promo.id}`}
                    >
                      {promo.cta}
                      <ArrowRight className="w-3 h-3" />
                    </Button>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden md:flex -left-4" />
          <CarouselNext className="hidden md:flex -right-4" />
        </Carousel>
      </div>
    </section>
  );
}

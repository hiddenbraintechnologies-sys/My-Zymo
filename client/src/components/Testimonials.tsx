import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Priya Sharma",
    role: "College Reunion Organizer",
    content: "This platform made organizing our 10-year college reunion so easy! The expense splitting feature saved us from so many headaches.",
    rating: 5,
    initials: "PS",
  },
  {
    name: "Rahul Verma",
    role: "Birthday Party Host",
    content: "Found the perfect venue and photographer through the vendor marketplace. Everything in one place - absolutely brilliant!",
    rating: 5,
    initials: "RV",
  },
  {
    name: "Sneha Patel",
    role: "Event Coordinator",
    content: "The group chat feature keeps everyone on the same page. No more endless WhatsApp forwards and confusion!",
    rating: 5,
    initials: "SP",
  },
  {
    name: "Amit Kumar",
    role: "Family Gathering Host",
    content: "Helped me coordinate a family reunion with 50+ people. The RSVP tracking and reminders were lifesavers.",
    rating: 5,
    initials: "AK",
  },
];

export default function Testimonials() {
  return (
    <section className="py-12 md:py-20 px-4 bg-card">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="font-heading font-semibold text-3xl md:text-4xl lg:text-5xl mb-4">
            Loved by Celebration Planners
          </h2>
          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto">
            Join thousands who've made their gatherings memorable
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="p-6 hover-elevate">
              <div className="flex gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                ))}
              </div>
              <p className="text-base mb-6">
                "{testimonial.content}"
              </p>
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {testimonial.initials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

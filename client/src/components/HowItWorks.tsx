import { Card } from "@/components/ui/card";

const steps = [
  {
    number: "01",
    title: "Create Your Event",
    description: "Set up your gathering in minutes. Add details like date, location, and description.",
  },
  {
    number: "02",
    title: "Invite & Coordinate",
    description: "Share invite links, chat with attendees, and manage RSVPs in real-time.",
  },
  {
    number: "03",
    title: "Celebrate Together",
    description: "Track expenses, book vendors, and enjoy your perfectly planned celebration!",
  },
];

export default function HowItWorks() {
  return (
    <section className="py-12 md:py-20 px-4 bg-card">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="font-heading font-semibold text-3xl md:text-4xl lg:text-5xl mb-4">
            How It Works
          </h2>
          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto">
            Getting started is simple and straightforward
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {steps.map((step, index) => (
            <Card key={index} className="p-8 text-center hover-elevate">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary text-primary-foreground font-heading font-bold text-2xl mb-6">
                {step.number}
              </div>
              <h3 className="font-heading font-semibold text-xl md:text-2xl mb-3">
                {step.title}
              </h3>
              <p className="text-muted-foreground">
                {step.description}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

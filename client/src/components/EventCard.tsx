import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users } from "lucide-react";
import { format } from "date-fns";

interface EventCardProps {
  title: string;
  date: Date;
  location: string;
  attendees: number;
  image: string;
  status?: "upcoming" | "past";
}

export default function EventCard({ title, date, location, attendees, image, status = "upcoming" }: EventCardProps) {
  return (
    <Card 
      className="overflow-hidden hover-elevate cursor-pointer group"
      data-testid="card-event"
      onClick={() => console.log(`Event ${title} clicked`)}
    >
      <div className="aspect-video overflow-hidden">
        <img 
          src={image} 
          alt={title}
          className="w-full h-full object-cover transition-transform group-hover:scale-105"
        />
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <h3 className="font-heading font-semibold text-lg flex-1">
            {title}
          </h3>
          {status === "past" && (
            <Badge variant="secondary" className="ml-2">Past</Badge>
          )}
        </div>
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>{format(date, "MMM d, yyyy 'at' h:mm a")}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            <span>{location}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span>{attendees} attendees</span>
          </div>
        </div>
      </div>
    </Card>
  );
}

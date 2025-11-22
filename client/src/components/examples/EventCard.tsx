import EventCard from '../EventCard';
import birthdayImage from '@assets/generated_images/birthday_party_event_placeholder.png';

export default function EventCardExample() {
  return (
    <div className="p-6 max-w-sm">
      <EventCard
        title="Priya's 25th Birthday Bash"
        date={new Date(2025, 11, 15, 19, 0)}
        location="The Garden Cafe, Mumbai"
        attendees={24}
        image={birthdayImage}
        status="upcoming"
      />
    </div>
  );
}

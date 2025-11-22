import VendorCard from '../VendorCard';
import venueImage from '@assets/generated_images/wedding_venue_category_image.png';

export default function VendorCardExample() {
  return (
    <div className="p-6 max-w-sm">
      <VendorCard
        name="The Grand Ballroom"
        category="Venue"
        image={venueImage}
        rating={4.8}
        reviewCount={124}
        priceRange="₹25,000 - ₹50,000"
        location="South Delhi"
        responseTime="2 hours"
      />
    </div>
  );
}

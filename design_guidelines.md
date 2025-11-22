# Design Guidelines: Social Gatherings Platform (India)

## Design Approach

**Reference-Based Hybrid**: Drawing inspiration from Instagram's visual engagement, WhatsApp's familiar Indian UX patterns, and Airbnb's event discovery—adapted for celebration-focused social planning with vibrant Indian aesthetic sensibilities.

## Core Design Principles

1. **Celebration-First**: Joyful, energetic, optimistic visual language
2. **Mobile-Native**: Touch-friendly, thumb-zone optimized for 4G performance
3. **Community-Focused**: Emphasize people, connections, and shared experiences
4. **Trust & Transparency**: Clear pricing, visible reviews, honest representations

---

## Typography

**Primary Font**: Inter (Google Fonts) - clean, readable at small sizes on mobile
**Accent Font**: Poppins (Google Fonts) - friendly, rounded for headlines

**Hierarchy**:
- Hero Headlines: Poppins Bold, 3xl-6xl (48-72px desktop, 32-40px mobile)
- Section Headings: Poppins SemiBold, 2xl-4xl
- Body: Inter Regular, base-lg (16-18px)
- Captions/Meta: Inter Medium, sm-base (14-16px)
- Buttons: Inter SemiBold, base

---

## Layout System

**Spacing Scale**: Use Tailwind units of 2, 4, 6, 8, 12, 16, 20, 24
- Component padding: p-4 to p-6 (mobile), p-6 to p-8 (desktop)
- Section spacing: py-12 to py-16 (mobile), py-20 to py-32 (desktop)
- Card gaps: gap-4 to gap-6

**Container Strategy**:
- Max-width: max-w-7xl for full sections
- Content areas: max-w-4xl for forms/details
- Cards: Consistent rounded-2xl with shadow-lg

**Grid Patterns**:
- Event cards: Single column mobile, 2-3 columns desktop (grid-cols-1 md:grid-cols-2 lg:grid-cols-3)
- Vendor listings: 2 columns mobile, 3-4 columns desktop
- Chat/Expense: Single column focus

---

## Component Library

### Navigation
**Mobile**: Bottom navigation bar with 4-5 main actions (Home, Events, Chat, Profile), fixed position
**Desktop**: Top horizontal nav with logo left, main links center, profile/notifications right
**Event Context Nav**: Sticky tabs within event view (Chat, Details, Expenses, Vendors)

### Hero Section
**Homepage Hero**: 
- Full-width background image showcasing Indian celebration (wedding, birthday party, reunion)
- Overlay: Subtle dark gradient (top to bottom, 20-40% opacity)
- Centered content with large headline, subtext, and primary CTA
- CTA button: Blurred glass-morphism background (backdrop-blur-lg, bg-white/20), white text
- Height: 70vh mobile, 80vh desktop

### Event Cards
- Image thumbnail top (16:9 ratio), rounded corners
- Content: Event title (bold), date/time (icon + text), location (icon + text), attendee count
- Hover state: Subtle lift (shadow increase, translate-y-1)
- Action: "View Details" button or entire card clickable

### Chat Interface
- WhatsApp-inspired bubble design
- Sender messages: Align right, vibrant accent background
- Received messages: Align left, neutral gray background
- Timestamps: Small, muted, below each message
- Input: Fixed bottom bar with text field + send icon

### Expense Tracker
- List view with item name, amount, split indicator
- Visual breakdown: Horizontal bar showing paid vs. owed
- Per-person summary cards with avatar, name, amount, status badge (Paid/Pending)
- "Add Expense" floating action button (FAB) bottom-right

### Vendor Cards
- Portrait image top, vendor name, category badge
- Star rating + review count
- Price range indicator
- Quick stats: Response time, bookings count
- "View Profile" or "Request Booking" CTA

### Forms
- Generous padding (p-6 to p-8)
- Clear labels above inputs (not placeholders)
- Input fields: border-2, rounded-lg, focus ring with accent color
- Error states: Red border, error text below
- Success states: Green checkmark icon

### Buttons
**Primary**: Bold background, white text, rounded-lg, px-6 py-3
**Secondary**: Border outline, transparent background, colored text
**Ghost**: No border, minimal styling, hover underline
**Icon Buttons**: Square or circular, icon-only, subtle hover background

### Notifications
- Toast notifications: Top-right corner, auto-dismiss after 4s
- Alert banners: Full-width, dismissible, appropriate icon
- Badge indicators: Small red dot on notification icon

---

## Page-Specific Layouts

### Landing Page
1. **Hero**: Large celebration image, headline "Plan Your Perfect Gathering", CTA "Get Started"
2. **Features**: 3-column grid (Event Planning, Group Chat, Expense Splitting) with icons and descriptions
3. **How It Works**: 3-step process with numbered icons
4. **Vendor Showcase**: Carousel of featured vendor categories
5. **Social Proof**: Testimonial cards, 2-column grid
6. **Final CTA**: Bold section with secondary hero image, "Start Planning Today"

### Event Dashboard
- Header: Welcome message, "Create Event" button prominent
- Tabs: Upcoming / Past Events
- Grid of event cards (3 columns desktop, 1 mobile)
- Empty state: Colorful illustration, encouraging copy, "Create Your First Event" CTA

### Event Detail Page
- Cover image banner (16:9 ratio)
- Event info section: Date, time, location, description in card
- Tabbed navigation: Chat, Attendees, Expenses, Vendors
- Floating "Edit Event" button for organizer

### Vendor Marketplace
- Search bar + category filters top
- Category chips: Horizontally scrollable on mobile
- Grid layout for vendor cards
- Sidebar filters on desktop (price, rating, availability)

---

## Images

### Required Images:
1. **Homepage Hero**: Vibrant Indian celebration scene (colorful party, people enjoying, festive decorations) - 1920x1080px
2. **Feature Icons**: Custom celebration-themed icons (calendar with confetti, chat bubbles, rupee split symbol)
3. **Vendor Category Images**: Venue interiors, food platters, photographer with camera, decoration setups - 800x600px each
4. **Testimonial Photos**: Diverse group of Indian users, authentic candid shots - 200x200px circular crops
5. **Event Card Placeholders**: Various celebration types (birthday cake, college campus, family gathering) - 600x400px
6. **Empty States**: Friendly illustrations for "No events yet", "No messages" - SVG illustrations

---

## Accessibility & Performance

- Minimum touch target: 44x44px for all interactive elements
- Color contrast: WCAG AA minimum (4.5:1 for text)
- Focus indicators: Visible 2px ring on all focusable elements
- Image optimization: WebP format, lazy loading, max 200KB per image
- Loading states: Skeleton screens for content, spinners for actions

---

## Mobile-First Considerations

- Bottom sheet modals instead of centered dialogs
- Swipe gestures: Swipe to delete expenses, swipe between event tabs
- Pull-to-refresh on dashboard
- Sticky headers that condense on scroll
- FAB placement in thumb-friendly zone (bottom-right, 16px margin)
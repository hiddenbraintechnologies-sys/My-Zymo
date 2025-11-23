# Social Gatherings Platform - Myzymo

## Overview

Myzymo is a comprehensive social gatherings platform designed for the Indian market, enabling users to plan and manage celebrations such as college reunions, birthday parties, and family gatherings. The platform provides an all-in-one solution combining event management, group communication, expense tracking, and vendor marketplace features. Built as a mobile-first web application, it emphasizes celebration-focused design with influences from Instagram's visual engagement, WhatsApp's familiar UX patterns, and Airbnb's event discovery model.

**Most Recent Session (November 23, 2025):**
- **✅ Completed: Dashboard with LinkedIn-Style Chat**
  - Created comprehensive Dashboard page as main landing after profile completion
  - Changed profile save redirect from /ai-assistant to /dashboard
  - Implemented two-column layout: Recent Events (left) + Event Chat (right)
  - Added quick action cards: Create Event, My Events, Find Vendors
  
- **✅ Completed: Event Chat Interface**
  - Built DashboardChat component with LinkedIn-style split layout
  - Left sidebar: List of all events user can chat in
  - Right panel: Chat messages for selected event with sender info
  - Message sending via POST /api/events/:id/messages
  - Real-time updates via WebSocket broadcast
  - Auto-scroll to newest messages
  - Proper sender attribution (name + avatar)
  
- **✅ Completed: Event Sharing Features**
  - WhatsApp share button on all event cards (data-testid="button-whatsapp-share-{id}")
  - Copy invitation link button (data-testid="button-copy-link-{id}")
  - WhatsApp integration uses URL scheme (https://wa.me/?text=...)
  - Toast notifications for successful link copy
  
- **✅ Completed: AI Guide in Navbar - Prominent User Walkthrough**
  - Moved AI assistant from floating widget to prominent position in navbar
  - Created beautiful AIAssistantNavbar component with Popover dropdown interface
  - Gradient-styled "AI Guide" button with Sparkles icon for maximum visibility
  - Enhanced AI system prompt to provide comprehensive application walkthroughs
  - Guides users through: Events, Vendors, Profile, and all platform features
  - Supports both anonymous users (prompts login) and authenticated users (full AI chat)
  - Chat interface drops down from navbar with header, scrollable messages, and input
  - Removed floating ChatbotWidget from landing page for cleaner design
  - AI now proactively suggests features and next steps based on user needs
  
- **✅ Completed: AI-Guided Onboarding & Profile Features**
  - Added `isOnboarding` field to track profile completion assistance conversations
  - Implemented smart profile completeness detection (checks first/last name only)
  - Profile page shows AI assistant onboarding prompt for incomplete profiles
  - Profile photo upload supports both file upload and camera capture
  - Server-side validation: profile photos limited to 3.5MB base64 (~2.6MB binary)
  - All AI system messages are emoji-free per project guidelines
  
- **✅ Completed: Profile-First Authentication Flow**
  - Updated login/signup redirect to send users directly to their profile page (/profile)
  - Users land on profile page after authentication instead of homepage
  - Profile page serves as the onboarding destination for new users
  - Deep links and returnTo parameter still honored by Passport authentication
  
- **✅ Completed: AI Assistant Chat Feature**
  - Integrated OpenAI GPT-5 via Replit AI Integrations (no API key required)
  - Created AI conversations and messages database schema
  - Built complete conversation management system (create, read, update, delete)
  - Implemented chat interface with conversation history sidebar
  - Added AI Assistant navigation link across all authenticated pages
  - Chat supports context-aware responses about event planning and vendor recommendations
  - Proper authentication and authorization on all AI endpoints
  - Automatic conversation updates and message persistence
  
- **✅ Completed: Default Sample Events System**
  - Automatically creates 7 celebration-themed events on first startup
  - Events visible to all users for discovery
  - Modified API to show all events (not just user's own events)
  - Fixed event detail page authorization (now publicly viewable)
  
**Sample Events Added:**
  1. IIT Delhi Class of 2015 Reunion - College reunion at India Habitat Centre
  2. Rahul's 30th Birthday Bash - Birthday party at The Leela Palace, Bangalore
  3. Priya & Arjun's Wedding Reception - Wedding at Taj Mahal Palace, Mumbai  
  4. Diwali Celebration 2025 - Festival of lights at Community Hall, Pune
  5. College Farewell Party 2025 - Graduation sendoff at Delhi University
  6. New Year's Eve Gala 2026 - NYE party at JW Marriott, Hyderabad
  7. Holi Celebration 2026 - Color festival at Open Grounds, Jaipur

**Technical Changes:**
- Added `seedDefaultEvents()` function that runs on server startup
- Created `getAllEvents()` storage method for event discovery
- Modified GET /api/events to return all events (not just user-created)
- Removed authorization requirement from GET /api/events/:id (public viewing)
- Fixed `upsertUser` to preserve profile data across logins
- Each seeded event includes title, description, date, location, and Unsplash image

**Recent Changes (November 2025):**
- Rebranded from "Reunify" to "Myzymo"
- Added vibrant celebration-themed logo matching the orange/coral color scheme
- Logo integrated across all pages (Navbar, Events, Vendors, Footer) with larger 40px size
- Added favicon using Myzymo logo
- Made logo clickable to navigate back to homepage from all pages
- Added 23 sample vendors across 4 categories (venues, catering, photography, decoration) from major Indian cities
- Created EventDetail page with WhatsApp sharing functionality
- Implemented event invitation system with copy link and WhatsApp share buttons
- Fixed 404 error when clicking on events - now shows full event details with participant list
- **Created comprehensive Profile page** with reunion-specific fields:
  - Basic Information: name, age, date of birth, phone, bio, profile photo
  - Education: college, degree, graduation year
  - Professional: profession, company, current city
  - Form validation using Zod schemas
  - Auto-populates with existing user data
- Added Profile link to navigation across all pages
- Extended user database schema with profile fields
- Implemented PATCH /api/user/profile endpoint for profile updates
- **Added sample event seeding system**: Automatically creates 7 default events on first startup
  - IIT Delhi Class of 2015 Reunion
  - Rahul's 30th Birthday Bash
  - Priya & Arjun's Wedding Reception
  - Diwali Celebration 2025
  - College Farewell Party 2025
  - New Year's Eve Gala 2026
  - Holi Celebration 2026

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack:**
- React 18 with TypeScript for type-safe component development
- Vite as the build tool and development server
- Wouter for lightweight client-side routing
- TanStack React Query for server state management and caching

**UI Framework:**
- Shadcn/ui component library with Radix UI primitives
- Tailwind CSS for utility-first styling with custom design tokens
- Custom design system following celebration-first principles with Poppins (headings) and Inter (body) typography
- Responsive, mobile-native layout with touch-optimized components

**State Management Pattern:**
- React Query handles all server state with query keys like `["/api/auth/user"]`
- Local component state via React hooks for UI interactions
- Authentication state managed through custom `useAuth` hook

**Key Design Decisions:**
- Mobile-first responsive design (4G optimized for India)
- Component-based architecture with reusable UI elements (EventCard, VendorCard, ChatInterface, etc.)
- Event-driven architecture with WebSocket support for real-time chat
- Separation of concerns: presentation components in `/components`, page layouts in `/pages`

### Backend Architecture

**Technology Stack:**
- Node.js with Express.js framework
- TypeScript for type safety across the stack
- Drizzle ORM for database operations with PostgreSQL
- WebSocket (ws library) for real-time messaging

**API Design:**
- RESTful API endpoints under `/api` namespace
- Authentication-first middleware protecting sensitive routes
- Session-based authentication using Replit Auth with OpenID Connect
- Express session management with PostgreSQL session store

**Server Structure:**
- Dual-mode setup: development (`index-dev.ts` with Vite middleware) and production (`index-prod.ts` serving static files)
- Centralized route registration in `routes.ts`
- Storage abstraction layer (`storage.ts`) providing consistent data access interface
- WebSocket server running alongside HTTP server for real-time features

**Authentication Flow:**
- Replit Auth integration using OpenID Connect (OIDC) discovery
- Passport.js strategy for authentication middleware
- Session persistence in PostgreSQL with 7-day TTL
- Protected routes use `isAuthenticated` middleware

**Key Architectural Decisions:**
- Monolithic architecture with shared schema between client and server (`/shared` directory)
- Storage layer abstraction allows future database implementation changes
- WebSocket authentication using cookie-based session validation
- Environment-specific builds optimize for development velocity vs production performance

### Data Storage Solutions

**Database:**
- PostgreSQL (via Neon serverless driver with WebSocket support)
- Drizzle ORM for type-safe database queries and schema management
- Migration-based schema versioning (migrations stored in `/migrations`)

**Schema Design:**
- `users` table: Replit Auth compatible with OAuth fields (email, firstName, lastName, profileImageUrl)
- `events` table: Core event data with creator relationship
- `eventParticipants` table: Many-to-many relationship between users and events
- `messages` table: Chat messages linked to events and senders
- `expenses` and `expenseSplits` tables: Split payment tracking with user relationships
- `vendors` table: Service provider listings with categories and pricing
- `bookings` table: Event-vendor reservations with status tracking
- `sessions` table: Express session storage (required for Replit Auth)

**Data Relationships:**
- Drizzle relations define one-to-many and many-to-many associations
- Foreign key constraints ensure referential integrity
- Composite queries join related entities (e.g., expenses with splits and user details)

**Key Design Decisions:**
- UUIDs as primary keys for distributed scalability
- Timestamp tracking (createdAt, updatedAt) on all major entities
- JSON fields for flexible metadata storage where needed
- Indexed session expiry for efficient cleanup

### External Dependencies

**Third-Party Services:**
- Replit Auth (OIDC provider) for user authentication
- Neon PostgreSQL serverless database
- Google Fonts (Inter, Poppins) for typography
- WebSocket (ws library) for real-time communication

**Payment Integration (Planned):**
- Architecture supports future payment gateway integration for expense settlements
- Vendor commission tracking structure already in schema

**Asset Management:**
- Static assets served from `/attached_assets` directory
- Generated placeholder images for events and vendor categories
- Frontend aliases configured for clean asset imports

**Development Tools:**
- Replit-specific plugins: Cartographer, Dev Banner, Runtime Error Modal
- ESBuild for production server bundling
- Drizzle Kit for database migrations

**Key Integration Decisions:**
- Replit Auth chosen for simplified authentication in Replit environment
- Neon serverless PostgreSQL for scalable, managed database without infrastructure overhead
- WebSocket over HTTP polling for better performance in real-time messaging
- Separation of development and production asset serving strategies
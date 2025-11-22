# Social Gatherings Platform - Reunify

## Overview

Reunify is a comprehensive social gatherings platform designed for the Indian market, enabling users to plan and manage celebrations such as college reunions, birthday parties, and family gatherings. The platform provides an all-in-one solution combining event management, group communication, expense tracking, and vendor marketplace features. Built as a mobile-first web application, it emphasizes celebration-focused design with influences from Instagram's visual engagement, WhatsApp's familiar UX patterns, and Airbnb's event discovery model.

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
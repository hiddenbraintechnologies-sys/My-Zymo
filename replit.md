# Myzymo - Social Gatherings Platform

## Overview

Myzymo is a mobile-first web application designed for the Indian market, facilitating the planning and management of social gatherings such as college reunions, birthday parties, and family events. The platform integrates event management, group communication, expense tracking, and a vendor marketplace into an all-in-one solution. It draws inspiration from Instagram for visual engagement, WhatsApp for user experience, and Airbnb for event discovery, aiming to provide a comprehensive and celebration-focused experience. The project's ambition is to become the leading platform for social event planning in India.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

The frontend is built with React 18 and TypeScript, using Vite for development and Wouter for routing. UI components leverage Shadcn/ui and Radix UI primitives, styled with Tailwind CSS, following a celebration-first design with Poppins and Inter fonts. Key design decisions include a mobile-first, responsive approach optimized for 4G networks, a component-based architecture, and an event-driven design using WebSockets for real-time interactions. TanStack React Query manages server state, while local component state is handled by React hooks.

### Backend Architecture

The backend utilizes Node.js with Express.js and TypeScript, employing Drizzle ORM for PostgreSQL database interactions. Real-time messaging is handled by WebSockets (`ws` library). The API is RESTful, secured with session-based authentication via Replit Auth (OpenID Connect) and Passport.js. The server structure supports both development and production environments, with a centralized route registration and a storage abstraction layer. A monolithic architecture with a shared schema between client and server (`/shared` directory) is a core architectural decision.

### Data Storage Solutions

PostgreSQL, via Neon serverless driver, is the primary database, managed with Drizzle ORM for type-safe queries and schema migrations. The schema includes tables for users, events, participants, messages, expenses, vendors, and bookings, all designed with UUIDs as primary keys and robust foreign key relationships. Timestamp tracking is implemented across major entities, and JSON fields offer flexible metadata storage.

### Feature Specifications

*   **AI-Assisted Reply Suggestions:** AI (OpenAI GPT-5) generates contextual reply suggestions for direct messages, displayed as clickable badges.
*   **Event Privacy System:** Events are private by default, accessible only by the creator and invited participants. Access control checks are implemented across API endpoints and WebSockets.
*   **Dashboard:** A personalized dashboard shows user-created or explicitly joined private events, featuring a LinkedIn-style chat interface for selected events.
*   **Chat System:** Real-time chat via WebSockets with emoji picker, proper sender attribution, and message persistence.
*   **AI Guide:** A prominent AI Guide in the navbar provides application walkthroughs and feature suggestions, supporting onboarding and general queries.
*   **Smart Authentication Flow:** Redirects new users to profile completion and existing users to the dashboard.
*   **Event Sharing:** Events can be shared via WhatsApp and invitation link copying.
*   **Profile Management:** Comprehensive profile page with basic, educational, and professional fields, validated using Zod schemas.
*   **Sample Events:** Default celebration-themed events are created on first startup for discovery purposes.

### UI/UX Decisions

*   Vibrant, celebration-themed design with an orange/coral color scheme and custom logo.
*   Mobile-native layout with touch-optimized components.
*   Integration of popular UX patterns from Instagram, WhatsApp, and Airbnb.
*   Prominent AI Guide in the navbar with a popover interface for enhanced visibility and user assistance.

## External Dependencies

*   **Authentication:** Replit Auth (OpenID Connect)
*   **Database:** Neon PostgreSQL (serverless driver)
*   **Typography:** Google Fonts (Inter, Poppins)
*   **Real-time Communication:** WebSocket (`ws` library)
*   **AI Integration:** OpenAI GPT-5 (via Replit AI Integrations)
*   **Development Tools:** Vite, ESBuild, Drizzle Kit
*   **Asset Management:** Static assets from `/attached_assets`
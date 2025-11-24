# Myzymo - Social Gatherings Platform

## Overview

Myzymo is a mobile-first web application designed for the Indian market, facilitating the planning and management of social gatherings such as college reunions, birthday parties, and family events. The platform integrates event management, group communication, expense tracking, and a vendor marketplace into an all-in-one solution. It draws inspiration from Instagram for visual engagement, WhatsApp for user experience, and Airbnb for event discovery, aiming to provide a comprehensive and celebration-focused experience. The project's ambition is to become the leading platform for social event planning in India.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

The frontend is built with React 18 and TypeScript, using Vite for development and Wouter for routing. UI components leverage Shadcn/ui and Radix UI primitives, styled with Tailwind CSS, following a celebration-first design with Poppins and Inter fonts. Key design decisions include a mobile-first, responsive approach optimized for 4G networks, a component-based architecture, and an event-driven design using WebSockets for real-time interactions. TanStack React Query manages server state, while local component state is handled by React hooks.

### Backend Architecture

The backend utilizes Node.js with Express.js and TypeScript, employing Drizzle ORM for PostgreSQL database interactions. Real-time messaging is handled by WebSockets (`ws` library). The API is RESTful, secured with session-based authentication using custom username/password authentication with bcrypt hashing. Session management uses Express session with PostgreSQL store, implementing proper session regeneration to prevent session fixation attacks. The server structure supports both development and production environments, with a centralized route registration and a storage abstraction layer. A monolithic architecture with a shared schema between client and server (`/shared` directory) is a core architectural decision.

### Data Storage Solutions

PostgreSQL, via Neon serverless driver, is the primary database, managed with Drizzle ORM for type-safe queries and schema migrations. The schema includes tables for users, events, participants, messages, expenses, vendors, and bookings, all designed with UUIDs as primary keys and robust foreign key relationships. Timestamp tracking is implemented across major entities, and JSON fields offer flexible metadata storage.

### Feature Specifications

*   **Custom Authentication System:** Username/password authentication with bcrypt hashing (10 salt rounds). Includes signup and login flows with proper session regeneration to prevent session fixation attacks. Storage-layer sanitization ensures password hashes never leak in API responses. All user-facing storage methods automatically strip password fields before returning data. Supports login with either username or email address. Password fields include visibility toggle (eye icon) for better user experience. Admin users (super_admin, admin, master_user) are automatically redirected to the admin dashboard (/admin) upon successful login, while regular users are directed to the landing page.
*   **Video and Audio Calling:** Peer-to-peer video and audio calling between users in direct messages using WebRTC. Features include call initiation buttons (phone/video), incoming call modal with accept/reject, active call dialog with mute/video toggle, and proper cleanup on termination. Uses WebSocket signaling and public STUN servers.
*   **AI-Assisted Reply Suggestions:** AI (OpenAI GPT-5) generates contextual reply suggestions for direct messages, displayed as clickable badges.
*   **Event Privacy System:** Events are private by default, accessible only by the creator and invited participants. Access control checks are implemented across API endpoints and WebSockets.
*   **Invite Link Flow with Privacy Protection:** Users can share event invite links via WhatsApp or copy link. Recipients see a privacy-protected preview (title, description, date, location only) and must explicitly click "Join Event" to become participants. Participant data, chat, expenses, and vendor bookings are hidden until user joins. After joining, the event appears in the user's dashboard and they gain full access to all event features.
*   **Dashboard:** A personalized dashboard shows user-created or explicitly joined private events, featuring a LinkedIn-style chat interface for selected events.
*   **Event Management:** Event creators can edit and delete their events from the dashboard. Edit and Delete buttons appear on event cards only for the creator. Editing opens a pre-populated form that updates the event details. Deletion requires confirmation via an AlertDialog. Backend authorization ensures only creators can modify their events.
*   **Event Member Export:** Event creators can download complete member details including photos and all personal information (name, email, phone, education, profession, etc.) as a JSON file from the dashboard. The "Download Members" button appears only for event creators, ensuring privacy protection. The export includes event details, all participant data, and export metadata.
*   **Chat System:** Real-time chat via WebSockets with emoji picker, proper sender attribution, and message persistence.
*   **AI Guide:** A prominent AI Guide in the navbar provides application walkthroughs and feature suggestions, supporting onboarding and general queries.
*   **Smart Authentication Flow:** Redirects new users to profile completion and existing users to the dashboard.
*   **Profile Management:** Comprehensive profile page with basic, educational, and professional fields, validated using Zod schemas.
*   **Sample Events:** Default celebration-themed events are created on first startup for discovery purposes.
*   **Admin Dashboard:** Full-featured admin panel with role-based access control (super_admin, admin, master_user, user). Features include:
    *   **User Management:** View all users, create privileged accounts (admin/master_user), change user roles, delete users (super admins only for privileged users)
    *   **Event Management:** View all events, delete any event (master_user+ required)
    *   **Vendor Management:** Create, edit, and delete vendors (master_user+ required)
    *   **Statistics Dashboard:** Overview of total users, events, and vendors
    *   **Role Hierarchy:** user < master_user < admin < super_admin
    *   **Security:** All admin routes protected with middleware (requireAdmin, requireMasterUser, requireSuperAdmin). Super admin seeding uses SUPER_ADMIN_PASSWORD environment variable for secure credential management.

### UI/UX Decisions

*   Vibrant, celebration-themed design with an orange/coral color scheme and custom logo.
*   Mobile-native layout with touch-optimized components.
*   Integration of popular UX patterns from Instagram, WhatsApp, and Airbnb.
*   Prominent AI Guide in the navbar with a popover interface for enhanced visibility and user assistance.

## External Dependencies

*   **Authentication:** Custom username/password authentication with bcrypt
*   **Database:** Neon PostgreSQL (serverless driver)
*   **Typography:** Google Fonts (Inter, Poppins)
*   **Real-time Communication:** WebSocket (`ws` library)
*   **AI Integration:** OpenAI GPT-5 (via Replit AI Integrations)
*   **Development Tools:** Vite, ESBuild, Drizzle Kit
*   **Asset Management:** Static assets from `/attached_assets`
# Myzymo - Social Gatherings Platform

## Overview

Myzymo is a mobile-first web application for the Indian market, designed to streamline the planning and management of social gatherings like college reunions, birthday parties, and family events. It integrates event management, group communication, expense tracking, and a vendor marketplace into a single platform. Inspired by Instagram for visual engagement, WhatsApp for user experience, and Airbnb for event discovery, Myzymo aims to be the leading platform for social event planning in India, offering a comprehensive and celebration-focused experience.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### UI/UX Decisions

The frontend employs a vibrant, celebration-themed design with an orange/coral color scheme and a custom logo. It features a mobile-native layout with touch-optimized components, integrating popular UX patterns from Instagram, WhatsApp, and Airbnb.

**Vibrant Design System:**
*   **Color Gradients:** Extensive use of CSS gradients throughout the application for depth and energy (orange/amber, blue/cyan, purple/pink, green/emerald, rose/pink)
*   **Dashboard Welcome Banner:** Full-width gradient hero section with pattern overlay, Sparkles icon, event statistics cards with glass-morphism effects
*   **Color-Coded Quick Actions:** Three distinct gradient cards (orange for Create Event, blue for My Events, purple for Find Vendors) with themed icons and badges
*   **Rotating Event Cards:** Five distinct gradient color schemes that rotate by index for visual variety
*   **Gradient Typography:** Section headers use gradient text (bg-clip-text technique) for visual hierarchy
*   **Festive Empty States:** Vibrant designs with blur effects and themed call-to-action buttons
*   **Glass-Morphism Effects:** Backdrop blur and semi-transparent backgrounds for modern aesthetics
*   **Shadow System:** Consistent use of shadow-lg and shadow-xl for elevation and depth
*   **Smooth Transitions:** Hover effects and animations throughout for interactive feedback

**Navigation Features:**
*   Prominent AI Guide in the navbar with popover interface
*   Smart logo navigation that links to dashboard when authenticated, home page when logged out
*   Persistent dashboard navigation across all authenticated pages
*   Dark mode support with proper contrast ratios across all gradients and colors

### Technical Implementations

The frontend is built with React 18, TypeScript, Vite, Wouter, Shadcn/ui, Radix UI, and Tailwind CSS. It follows a mobile-first, responsive, and component-based architecture optimized for 4G networks. TanStack React Query manages server state, while React hooks handle local state.

The backend uses Node.js, Express.js, and TypeScript, with Drizzle ORM for PostgreSQL interactions. Real-time communication is powered by WebSockets. The API is RESTful, secured with session-based authentication using custom username/password and Replit Auth (OIDC-based social login). A monolithic architecture with a shared schema (`/shared` directory) ensures consistency between client and server.

### Feature Specifications

Myzymo includes a comprehensive set of features:

*   **Dual Authentication System:** Supports custom username/password login with bcrypt and Replit Auth (Google, GitHub, X, Apple, email/password) for users and vendors, with unified middleware and admin redirection upon successful login.
*   **AI-Powered Business Description Generator:** Assists vendors in creating compelling business descriptions using OpenAI GPT-5.
*   **Video and Audio Calling:** Peer-to-peer communication via WebRTC in direct messages, with WebSocket signaling.
*   **AI-Assisted Reply Suggestions:** Generates contextual reply suggestions for direct messages using OpenAI GPT-5.
*   **Public and Private Events System:** Allows event creators to define event visibility, with public events discoverable by unauthenticated users and private events accessible only to invited participants. Features include a public events showcase, dual-mode event detail pages, and protected mutations.
*   **Invite Link Flow:** Secure sharing of event invite links with privacy-protected previews.
*   **Vibrant Dashboard:** A personalized, celebration-themed dashboard with gradient designs, quick action cards, rotating event card gradients, and festive empty states.
*   **Event Management:** Event creators can edit and delete their events, with backend authorization ensuring security.
*   **Event Member Export:** Creators can download complete member details as JSON files for their events.
*   **Chat System:** Real-time WebSocket-based chat with emoji support and message persistence.
*   **AI Guide:** Provides application walkthroughs and feature suggestions in the navbar.
*   **Smart Authentication Flow:** Redirects new users to profile completion and existing users to the dashboard.
*   **Profile Management:** Comprehensive profile page with basic, educational, and professional fields.
*   **Admin Dashboard:** Full-featured panel with role-based access control (super_admin, admin, master_user, user) for managing users, events, and vendors.
*   **AI-Powered Quote Estimation:** Provides instant event cost estimates using OpenAI GPT with Indian market pricing intelligence, including multi-step forms and guest privacy features.
*   **AI Event Title & Description Suggestions:** Assists event creation with culturally aware title and description suggestions using OpenAI GPT-5.

### System Design Choices

PostgreSQL, leveraging Neon serverless driver and Drizzle ORM, serves as the primary database. The schema utilizes UUIDs for primary keys and robust foreign key relationships across tables for users, events, participants, messages, expenses, vendors, and bookings. Timestamp tracking and JSON fields for flexible metadata storage are implemented.

## External Dependencies

*   **Authentication:** Replit Auth (OIDC-based social login)
*   **Database:** Neon PostgreSQL
*   **Typography:** Google Fonts (Inter, Poppins)
*   **Real-time Communication:** WebSocket (`ws` library)
*   **AI Integration:** OpenAI GPT-5 (via Replit AI Integrations)
*   **Development Tools:** Vite, ESBuild, Drizzle Kit
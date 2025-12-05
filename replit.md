# Myzymo - Social Gatherings Platform

## Overview

Myzymo is a mobile-first web application for the Indian market, designed to streamline the planning and management of social gatherings like college reunions, birthday parties, and family events. It integrates event management, group communication, expense tracking, and a vendor marketplace into a single platform. Inspired by Instagram for visual engagement, WhatsApp for user experience, and Airbnb for event discovery, Myzymo aims to be the leading platform for social event planning in India, offering a comprehensive and celebration-focused experience.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### UI/UX Decisions

The frontend employs a vibrant, celebration-themed design with an orange/coral color scheme and a custom logo. It features a mobile-native layout with touch-optimized components, integrating popular UX patterns from Instagram, WhatsApp, and Airbnb.

**Vibrant Design System:**
*   **Primary Color Palette:** Warm celebration theme with orange/amber/coral gradients as the primary color scheme throughout the application
*   **Color Gradients:** Sophisticated use of CSS gradients for depth and energy, featuring warm tones (orange/amber/yellow) with softer saturation for a refined look
*   **Dashboard Welcome Banner:** Full-width gradient hero section with orange-amber gradient, pattern overlay, Sparkles icon, and event statistics cards with glass-morphism effects
*   **Dashboard Chat Section:** Always-visible chat with warm orange-amber gradient headers matching the overall celebration theme
*   **Events Page Hero:** Matching orange-amber gradient (`from-orange-500 via-amber-500 to-orange-600`) for visual consistency
*   **Color-Coded Quick Actions:** Three distinct gradient cards (orange for Create Event, blue for My Events, purple for Find Vendors) with themed icons and badges
*   **Rotating Event Cards:** Five warm gradient color schemes using orange/amber/yellow variations that rotate by index for visual variety while maintaining thematic coherence
*   **Gradient Typography:** Section headers use warm gradient text (bg-clip-text technique) with orange-amber tones for visual hierarchy
*   **Festive Empty States:** Warm, celebration-themed designs with orange/amber gradients, blur effects, and themed call-to-action buttons (updated to use orange/amber theme consistently)
*   **Glass-Morphism Effects:** Backdrop blur and semi-transparent backgrounds for modern aesthetics
*   **Shadow System:** Consistent use of shadow-lg and shadow-xl for elevation and depth
*   **Smooth Transitions:** Hover effects and animations throughout for interactive feedback

**Navigation Features:**
*   Prominent AI Guide in the navbar with popover interface (no floating guide component)
*   Smart logo navigation that links to dashboard when authenticated, home page when logged out
*   Persistent dashboard navigation across all authenticated pages
*   Dark mode support with proper contrast ratios across all gradients and colors
*   Always-visible chat section on dashboard with warm orange/amber themed headers

### Technical Implementations

The frontend is built with React 18, TypeScript, Vite, Wouter, Shadcn/ui, Radix UI, and Tailwind CSS. It follows a mobile-first, responsive, and component-based architecture optimized for 4G networks. TanStack React Query manages server state, while React hooks handle local state.

The backend uses Node.js, Express.js, and TypeScript, with Drizzle ORM for PostgreSQL interactions. Real-time communication is powered by WebSockets. The API is RESTful, secured with session-based authentication using custom username/password and Replit Auth (OIDC-based social login). A monolithic architecture with a shared schema (`/shared` directory) ensures consistency between client and server.

### Feature Specifications

Myzymo includes a comprehensive set of features:

*   **Dual Authentication System:** Supports custom username/password login with bcrypt and Replit Auth (Google, GitHub, X, Apple, email/password) for users and vendors, with unified middleware and admin redirection upon successful login.
*   **AI-Powered Business Description Generator:** Assists vendors in creating compelling business descriptions using OpenAI GPT-5.
*   **Video and Audio Calling:** Peer-to-peer communication via WebRTC in direct messages, with WebSocket signaling.
*   **AI-Assisted Reply Suggestions:** Generates contextual reply suggestions for direct messages using OpenAI GPT-5.
*   **Public and Private Events System:** Allows event creators to define event visibility, with public events discoverable by unauthenticated users and private events accessible only to invited participants. Features include:
    *   Public events showcase accessible from homepage navigation
    *   Dual-mode event detail pages with privacy controls
    *   Protected mutations ensuring security
    *   Comprehensive error handling with retry functionality
    *   Advanced sorting (by date/title) and filtering capabilities
    *   Vibrant gradient design with rotating event card color schemes
    *   Festive empty states for enhanced user experience
*   **Invite Link Flow:** Secure sharing of event invite links with privacy-protected previews.
*   **Vibrant Dashboard:** A personalized, celebration-themed dashboard with gradient designs, quick action cards, rotating event card gradients, and festive empty states.
*   **Event Management:** Event creators can edit and delete their events, with backend authorization ensuring security.
*   **Event Member Export:** Creators can download complete member details as JSON files for their events.
*   **Chat System:** Real-time WebSocket-based chat with emoji support and message persistence, always visible on the dashboard with warm celebration-themed styling.
*   **Message Editing and Deletion:** Users can edit or delete their own messages in all chat types:
    *   Edit/delete buttons appear on hover for user's own messages
    *   Inline edit mode with input field, save (Enter key), and cancel (Escape key) options
    *   "(edited)" indicator displayed for edited messages with timestamp
    *   Consistent UI across direct, group, and event chats
    *   API endpoints for PATCH (edit) and DELETE operations on messages
    *   Database columns (isEdited, editedAt) track edit history
    *   Editing state is cleared when switching tabs or conversations
*   **Online/Offline Presence Tracking:** Real-time user status indicators showing who's online:
    *   Database fields (is_online, last_seen) track user presence state
    *   WebSocket broadcasts presence updates to all connected users when status changes
    *   OnlineIndicator component shows green dots next to online user avatars
    *   useOnlinePresence hook manages frontend presence state
    *   Multi-connection reference counting ensures users stay online when multiple tabs open
    *   API endpoint `/api/online-users` for fetching online status on page load
*   **Browser Push Notifications:** Notifications for new messages:
    *   Web Notifications API integration for browser notifications
    *   useNotifications hook manages permission requests and notification display
    *   Notifications shown when tab is not focused (document.hidden)
    *   Click-to-focus functionality on notification interaction
    *   Graceful degradation for browsers without notification support
*   **Group Chat System:** Full-featured group messaging with:
    *   Create groups with custom names and descriptions
    *   Add/remove members from groups
    *   Real-time message broadcasting to all group members via WebSocket
    *   Group presence tracking for online member visibility
    *   Leave group functionality
    *   Tabbed interface in Messages page switching between Direct Messages and Group Chats
    *   Database tables: groupChats, groupChatMembers, groupMessages with proper relationships
*   **File Sharing in Chats:** Comprehensive file sharing feature for both direct and group messages:
    *   ObjectUploader component for seamless file selection and upload
    *   Signed URL-based uploads to Replit Object Storage for security
    *   Support for images (with inline previews), documents, and other file types
    *   File metadata persistence (fileUrl, fileName, fileSize, fileType) in database
    *   Real-time file sharing via WebSocket with proper broadcast to recipients/group members
    *   Download links for non-image files with file size and type display
    *   10MB file size limit with proper error handling
*   **AI Guide:** Provides application walkthroughs and feature suggestions in the navbar via popover interface (floating guide component removed per user preference).
*   **Smart Authentication Flow:** Redirects new users to profile completion and existing users to the dashboard.
*   **Profile Management:** Comprehensive profile page with basic, educational, and professional fields.
*   **Admin Dashboard:** Full-featured panel with role-based access control (super_admin, admin, master_user, user) for managing users, events, and vendors.
*   **AI-Powered Quote Estimation:** Provides instant event cost estimates using OpenAI GPT with Indian market pricing intelligence, including multi-step forms and guest privacy features.
*   **AI Event Title & Description Suggestions:** Assists event creation with culturally aware title and description suggestions using OpenAI GPT-5.
*   **Group Planning System:** Comprehensive collaborative event planning with:
    *   Group creation wizard with event type, date, location, and budget settings
    *   Invite code system for easy member onboarding with shareable links that persist through login
    *   Polls & Voting for group decision-making (venues, dates, activities)
    *   Itinerary Builder with timeline-based activity planning
    *   Member Role Assignment (admin, treasurer, planner, venue_manager, food_manager, transport_manager)
    *   Expense Tracking with category-based spending and member contributions
    *   **Two-Step Expense Wizard:** Redesigned expense entry with intuitive two-step flow:
        *   Step 1: Enter expense details (description, total amount with rupee icon, category, who paid)
        *   Step 2: Choose split method with radio selection between Auto Split (equal division with live per-person calculation) or Manual Split (custom amounts per member with real-time validation ensuring totals match)
        *   Manual split shows member avatars, names, individual input fields, and validates that splits sum to total amount
    *   Database tables: eventGroups, eventGroupMembers, groupPolls, groupPollOptions, groupPollVotes, groupMemberRoles, groupInvitations, groupItineraryItems, eventAttendance, eventPhotos, eventFeedback, groupExpenses, groupExpenseSplits
    *   Accessible via dedicated /groups route and Dashboard quick action card

### System Design Choices

PostgreSQL, leveraging Neon serverless driver and Drizzle ORM, serves as the primary database. The schema utilizes UUIDs for primary keys and robust foreign key relationships across tables for users, events, participants, messages, expenses, vendors, and bookings. Timestamp tracking and JSON fields for flexible metadata storage are implemented.

## External Dependencies

*   **Authentication:** Replit Auth (OIDC-based social login)
*   **Database:** Neon PostgreSQL
*   **Typography:** Google Fonts (Inter, Poppins)
*   **Real-time Communication:** WebSocket (`ws` library)
*   **AI Integration:** OpenAI GPT-5 (via Replit AI Integrations)
*   **Development Tools:** Vite, ESBuild, Drizzle Kit
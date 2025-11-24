import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { parse as parseCookie } from "cookie";
import { unsign } from "cookie-signature";
import { z } from "zod";
import { storage } from "./storage";
import { setupCustomAuth, isAuthenticated as isAuthenticatedCustom, sessionStore } from "./customAuth";
import { setupSocialAuth } from "./socialAuth";
import { setupAuth as setupReplitAuth } from "./replitAuth";
import { setupWebAuthn } from "./webauthn";
import { setupAdminRoutes } from "./adminRoutes";
import { setupVendorAuth } from "./vendorAuth";
import { sanitizeUser } from "@shared/sanitize";
import type { RequestHandler } from "express";

// Extend express-session types to include passport data
declare module 'express-session' {
  interface SessionData {
    passport?: {
      user?: {
        claims?: {
          sub?: string;
        };
      };
    };
  }
}
import { 
  insertMessageSchema, 
  insertEventSchema, 
  insertEventParticipantSchema,
  insertExpenseSchema,
  insertBookingSchema,
  updateProfileSchema,
  insertQuoteSchema,
} from "@shared/schema";
import { db } from "./db";
import type { IncomingMessage } from "http";

// Unified authentication middleware that supports both custom auth and Replit Auth
const isAuthenticated: RequestHandler = async (req: any, res, next) => {
  // Check custom auth (username/password)
  const customUserId = (req.session as any)?.userId;
  if (customUserId) {
    try {
      const user = await storage.getUser(customUserId);
      if (user) {
        req.user = sanitizeUser(user);
        return next();
      }
    } catch (error) {
      console.error("Error fetching user from custom auth:", error);
    }
  }
  
  // Check Replit Auth (OIDC/Passport)
  if (req.isAuthenticated && req.isAuthenticated()) {
    const passportUser = req.user as any;
    if (passportUser && passportUser.claims && passportUser.claims.sub) {
      try {
        // Fetch user from database using the subject ID from OIDC claims
        const user = await storage.getUserByEmail(passportUser.claims.email);
        if (user) {
          req.user = sanitizeUser(user);
          return next();
        }
      } catch (error) {
        console.error("Error fetching user from Replit auth:", error);
      }
    }
  }
  
  return res.status(401).json({ message: "Unauthorized" });
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup Replit Auth (OIDC) for social login (Google, GitHub, X, Apple, email)
  await setupReplitAuth(app);
  
  // Setup custom authentication with username/password
  await setupCustomAuth(app);
  
  // Setup social authentication (Google, Facebook, Twitter) - Legacy
  setupSocialAuth(app);
  
  // Setup WebAuthn biometric authentication
  setupWebAuthn(app);
  
  // Setup vendor authentication
  await setupVendorAuth(app);
  
  // Setup admin routes
  setupAdminRoutes(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      // With custom auth, user is already attached to req by middleware (sanitized)
      const user = req.user;
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Update user profile
  app.patch('/api/user/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const validatedData = updateProfileSchema.parse(req.body);
      
      console.log('[Profile Update] User ID:', userId);
      console.log('[Profile Update] Validated data:', JSON.stringify(validatedData, null, 2));
      
      const profileUpdate: any = { ...validatedData };
      // Handle dateOfBirth: convert to Date if valid, otherwise set to null
      if (validatedData.dateOfBirth && validatedData.dateOfBirth !== '') {
        profileUpdate.dateOfBirth = new Date(validatedData.dateOfBirth);
      } else {
        // Convert empty string, undefined, or null to null for timestamp field
        profileUpdate.dateOfBirth = null;
      }
      
      const updatedUser = await storage.updateUserProfile(userId, profileUpdate);
      console.log('[Profile Update] Updated user:', JSON.stringify(updatedUser, null, 2));
      // SECURITY: Sanitize user object before returning
      res.json(sanitizeUser(updatedUser));
    } catch (error: any) {
      console.error("Error updating profile:", error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid profile data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // === Event Management APIs ===
  
  // Get events accessible to the user (created by them or invited to, including sample events)
  app.get('/api/events', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      // Use getAllEventsForUser to include sample events for discovery
      const userEvents = await storage.getAllEventsForUser(userId);
      res.json(userEvents);
    } catch (error) {
      console.error("Error fetching events:", error);
      res.status(500).json({ message: "Failed to fetch events" });
    }
  });

  app.get('/api/events/private', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const privateEvents = await storage.getPrivateEventsForUser(userId);
      res.json(privateEvents);
    } catch (error) {
      console.error("Error fetching private events:", error);
      res.status(500).json({ message: "Failed to fetch private events" });
    }
  });

  app.get('/api/events/public', isAuthenticated, async (req: any, res) => {
    try {
      const publicEvents = await storage.getPublicEvents();
      res.json(publicEvents);
    } catch (error) {
      console.error("Error fetching public events:", error);
      res.status(500).json({ message: "Failed to fetch public events" });
    }
  });

  // Public endpoint for viewing public events (no authentication required)
  // This is for site visitors on the home page
  app.get('/api/public-events', async (req, res) => {
    try {
      const publicEvents = await storage.getPublicEvents();
      res.json(publicEvents);
    } catch (error) {
      console.error("Error fetching public events:", error);
      res.status(500).json({ message: "Failed to fetch public events" });
    }
  });

  app.get('/api/events/followed', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const followedEvents = await storage.getFollowedPublicEvents(userId);
      res.json(followedEvents);
    } catch (error) {
      console.error("Error fetching followed events:", error);
      res.status(500).json({ message: "Failed to fetch followed events" });
    }
  });

  app.post('/api/events/:id/follow', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const eventId = req.params.id;

      const event = await storage.getEvent(eventId);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }

      if (!event.isPublic) {
        return res.status(400).json({ message: "Cannot follow a private event" });
      }

      const isAlreadyFollowed = await storage.isEventFollowedByUser(userId, eventId);
      if (isAlreadyFollowed) {
        return res.status(400).json({ message: "Already following this event" });
      }

      await storage.followPublicEvent(userId, eventId);
      res.json({ message: "Event followed successfully" });
    } catch (error) {
      console.error("Error following event:", error);
      res.status(500).json({ message: "Failed to follow event" });
    }
  });

  app.delete('/api/events/:id/follow', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const eventId = req.params.id;

      const isFollowed = await storage.isEventFollowedByUser(userId, eventId);
      if (!isFollowed) {
        return res.status(400).json({ message: "Not following this event" });
      }

      await storage.unfollowPublicEvent(userId, eventId);
      res.json({ message: "Event unfollowed successfully" });
    } catch (error) {
      console.error("Error unfollowing event:", error);
      res.status(500).json({ message: "Failed to unfollow event" });
    }
  });

  // Export event members with all details and photos (creator/organizer only)
  app.get('/api/events/:id/export-members', isAuthenticated, async (req: any, res) => {
    try {
      const eventId = req.params.id;
      const userId = req.user.id;

      // Get event details
      const event = await storage.getEvent(eventId);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }

      // SECURITY: Only event creator can export member details
      if (event.creatorId !== userId) {
        return res.status(403).json({ message: "Only the event creator can export member details" });
      }

      // Get all participants with full user details
      const participants = await storage.getEventParticipants(eventId);

      // Format participant data for export
      const exportData = {
        event: {
          title: event.title,
          description: event.description,
          date: event.date,
          location: event.location,
          createdAt: event.createdAt,
        },
        members: participants.map(p => ({
          id: p.user.id,
          firstName: p.user.firstName,
          lastName: p.user.lastName,
          email: p.user.email,
          username: p.user.username,
          profileImageUrl: p.user.profileImageUrl,
          age: p.user.age,
          dateOfBirth: p.user.dateOfBirth,
          phone: p.user.phone,
          bio: p.user.bio,
          college: p.user.college,
          graduationYear: p.user.graduationYear,
          degree: p.user.degree,
          currentCity: p.user.currentCity,
          profession: p.user.profession,
          company: p.user.company,
          status: p.status,
          joinedAt: p.joinedAt,
        })),
        totalMembers: participants.length,
        exportedAt: new Date().toISOString(),
        exportedBy: {
          id: req.user.id,
          name: `${req.user.firstName} ${req.user.lastName}`,
          email: req.user.email,
        },
      };

      // Set headers for download
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="event-${event.title.replace(/[^a-z0-9]/gi, '-')}-members-${Date.now()}.json"`);
      res.json(exportData);
    } catch (error) {
      console.error("Error exporting event members:", error);
      res.status(500).json({ message: "Failed to export event members" });
    }
  });

  // Public event preview endpoint - for landing page visitors (no authentication required)
  app.get('/api/public-events/:id', async (req, res) => {
    try {
      const event = await storage.getEvent(req.params.id);
      
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }

      // Only allow viewing public events
      if (!event.isPublic) {
        return res.status(404).json({ message: "Event not found" });
      }

      // Return preview data for public events (basic info WITHOUT sensitive participant details)
      return res.json({
        ...event,
        participants: [], // No participant data for non-members
        messages: [],
        expenses: [],
        bookings: [],
        hasJoined: false, // Flag to indicate user needs to join
        requiresAuth: true, // Flag to indicate user should login to join
      });
    } catch (error) {
      console.error("Error fetching public event preview:", error);
      res.status(500).json({ message: "Failed to fetch event" });
    }
  });

  // Get single event with details (returns preview for non-participants, full data for participants)
  // Requires authentication - use /api/public-events/:id for public previews
  app.get('/api/events/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const event = await storage.getEvent(req.params.id);
      
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      // Check if user has access to this event
      const hasAccess = await storage.canUserAccessEvent(userId, req.params.id);
      
      if (!hasAccess) {
        // Return preview data for invite links (basic info WITHOUT sensitive participant details)
        return res.json({
          ...event,
          participants: [], // No participant data for non-members
          messages: [],
          expenses: [],
          bookings: [],
          hasJoined: false, // Flag to indicate user needs to join
        });
      }
      
      // Full access - return all data
      const [participants, messages, expenses, bookings] = await Promise.all([
        storage.getEventParticipants(req.params.id),
        storage.getEventMessages(req.params.id),
        storage.getEventExpenses(req.params.id),
        storage.getEventBookings(req.params.id),
      ]);
      
      // NOTE: User data is automatically sanitized at storage layer
      res.json({ ...event, participants, messages, expenses, bookings, hasJoined: true });
    } catch (error) {
      console.error("Error fetching event:", error);
      res.status(500).json({ message: "Failed to fetch event" });
    }
  });

  // Create event
  app.post('/api/events', isAuthenticated, async (req: any, res) => {
    try {
      console.log("[POST /api/events] Request body:", req.body);
      const userId = req.user.id;
      console.log("[POST /api/events] User ID:", userId);
      
      // Validate request body - accept ISO strings for date field
      const apiEventSchema = insertEventSchema.extend({
        date: z.coerce.date(),
      });
      
      const dataToValidate = {
        ...req.body,
        creatorId: userId,
      };
      console.log("[POST /api/events] Data to validate:", dataToValidate);
      
      const validatedData = apiEventSchema.parse(dataToValidate);
      console.log("[POST /api/events] Validation passed:", validatedData);
      
      const event = await storage.createEvent(validatedData);
      console.log("[POST /api/events] Event created:", event);
      
      // Auto-add creator as participant
      await storage.addEventParticipant({
        eventId: event.id,
        userId: userId,
        status: 'going',
      });
      
      res.status(201).json(event);
    } catch (error: any) {
      console.error("[POST /api/events] Error creating event:", error);
      if (error.name === 'ZodError') {
        console.error("[POST /api/events] Zod validation errors:", error.errors);
        return res.status(400).json({ message: "Invalid event data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create event" });
    }
  });

  // Update event
  app.patch('/api/events/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      
      // Verify event exists and user is the creator
      const event = await storage.getEvent(req.params.id);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      if (event.creatorId !== userId) {
        return res.status(403).json({ message: "Only the event creator can update the event" });
      }
      
      // Validate update data using partial schema with date coercion
      const updateSchema = insertEventSchema.partial().omit({ creatorId: true }).extend({
        date: z.coerce.date().optional(),
      });
      const validatedUpdates = updateSchema.parse(req.body);
      
      const updatedEvent = await storage.updateEvent(req.params.id, validatedUpdates);
      res.json(updatedEvent);
    } catch (error: any) {
      console.error("Error updating event:", error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid update data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update event" });
    }
  });

  // Delete event
  app.delete('/api/events/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      
      // Verify event exists and user is the creator
      const event = await storage.getEvent(req.params.id);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      if (event.creatorId !== userId) {
        return res.status(403).json({ message: "Only the event creator can delete the event" });
      }
      
      await storage.deleteEvent(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting event:", error);
      res.status(500).json({ message: "Failed to delete event" });
    }
  });

  // === Event Participation APIs ===
  
  // Join event
  app.post('/api/events/:id/join', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      
      // Verify event exists
      const event = await storage.getEvent(req.params.id);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      // Validate participant data
      const validatedData = insertEventParticipantSchema.parse({
        eventId: req.params.id,
        userId: userId,
        status: req.body.status || 'going',
      });
      
      const participant = await storage.addEventParticipant(validatedData);
      res.status(201).json(participant);
    } catch (error: any) {
      console.error("Error joining event:", error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid participant data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to join event" });
    }
  });

  // Leave event
  app.delete('/api/events/:id/leave', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      await storage.removeEventParticipant(req.params.id, userId);
      res.status(204).send();
    } catch (error) {
      console.error("Error leaving event:", error);
      res.status(500).json({ message: "Failed to leave event" });
    }
  });

  // === Expense APIs ===
  
  // Create expense
  app.post('/api/events/:id/expenses', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { description, amount, participantIds } = req.body;
      
      // Validate inputs
      if (!participantIds || !Array.isArray(participantIds) || participantIds.length === 0) {
        return res.status(400).json({ message: "participantIds must be a non-empty array" });
      }
      
      const numAmount = parseFloat(amount);
      if (isNaN(numAmount) || numAmount <= 0) {
        return res.status(400).json({ message: "amount must be a positive number" });
      }
      
      // Verify event exists and user is a participant
      const event = await storage.getEvent(req.params.id);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      const participants = await storage.getEventParticipants(req.params.id);
      const participantUserIds = participants.map(p => p.userId);
      if (!participantUserIds.includes(userId)) {
        return res.status(403).json({ message: "Only event participants can add expenses" });
      }
      
      // Verify all participantIds are event participants
      const invalidParticipants = participantIds.filter((id: string) => !participantUserIds.includes(id));
      if (invalidParticipants.length > 0) {
        return res.status(400).json({ 
          message: "All participants must be members of the event",
          invalidIds: invalidParticipants,
        });
      }
      
      // Validate expense data
      const validatedExpense = insertExpenseSchema.parse({
        eventId: req.params.id,
        description,
        amount: numAmount.toFixed(2),
        paidById: userId,
        splitAmong: participantIds.length,
      });
      
      // Use transaction for atomic operation
      const expense = await storage.createExpense(validatedExpense);
      
      // Create splits for each participant
      const splitAmount = numAmount / participantIds.length;
      await Promise.all(
        participantIds.map((participantId: string) =>
          storage.createExpenseSplit({
            expenseId: expense.id,
            userId: participantId,
            amount: splitAmount.toFixed(2),
            isPaid: participantId === userId,
          })
        )
      );
      
      res.status(201).json(expense);
    } catch (error: any) {
      console.error("Error creating expense:", error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid expense data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create expense" });
    }
  });

  // Mark expense split as paid
  app.patch('/api/expense-splits/:id/pay', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      
      // Get split with related expense
      const split = await storage.getExpenseSplit(req.params.id);
      if (!split) {
        return res.status(404).json({ message: "Expense split not found" });
      }
      
      // Verify user is still an event participant
      const participants = await storage.getEventParticipants(split.expense.eventId);
      const participantUserIds = participants.map(p => p.userId);
      
      if (!participantUserIds.includes(userId)) {
        return res.status(403).json({ 
          message: "Only current event participants can update payments" 
        });
      }
      
      // Verify authorization: user must be split owner OR expense payer
      const isSplitOwner = split.userId === userId;
      const isExpensePayer = split.expense.paidById === userId;
      
      if (!isSplitOwner && !isExpensePayer) {
        return res.status(403).json({ 
          message: "Only the person who owes or the person who paid can update payment status" 
        });
      }
      
      await storage.updateExpenseSplitPayment(req.params.id, true);
      res.status(204).send();
    } catch (error) {
      console.error("Error updating payment:", error);
      res.status(500).json({ message: "Failed to update payment" });
    }
  });

  // === Vendor APIs ===
  
  // Get all vendors
  app.get('/api/vendors', async (req, res) => {
    try {
      const { category } = req.query;
      const vendors = category && typeof category === 'string'
        ? await storage.getVendorsByCategory(category)
        : await storage.getAllVendors();
      res.json(vendors);
    } catch (error) {
      console.error("Error fetching vendors:", error);
      res.status(500).json({ message: "Failed to fetch vendors" });
    }
  });

  // Get single vendor
  app.get('/api/vendors/:id', async (req, res) => {
    try {
      const vendor = await storage.getVendor(req.params.id);
      if (!vendor) {
        return res.status(404).json({ message: "Vendor not found" });
      }
      res.json(vendor);
    } catch (error) {
      console.error("Error fetching vendor:", error);
      res.status(500).json({ message: "Failed to fetch vendor" });
    }
  });

  // === Booking APIs ===
  
  // Create booking
  app.post('/api/bookings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      
      // Validate booking data
      const validatedData = insertBookingSchema.parse({
        ...req.body,
        userId,
      });
      
      // Verify event and vendor exist
      const [event, vendor] = await Promise.all([
        storage.getEvent(validatedData.eventId),
        storage.getVendor(validatedData.vendorId),
      ]);
      
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      if (!vendor) {
        return res.status(404).json({ message: "Vendor not found" });
      }
      
      // Verify user is event creator or participant
      const participants = await storage.getEventParticipants(validatedData.eventId);
      const participantUserIds = participants.map(p => p.userId);
      const isCreator = event.creatorId === userId;
      const isParticipant = participantUserIds.includes(userId);
      
      if (!isCreator && !isParticipant) {
        return res.status(403).json({ message: "Only event participants can create bookings" });
      }
      
      const booking = await storage.createBooking(validatedData);
      res.status(201).json(booking);
    } catch (error: any) {
      console.error("Error creating booking:", error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid booking data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create booking" });
    }
  });

  // === Direct Message APIs ===
  
  // Get list of conversations with other users
  app.get('/api/direct-messages/conversations', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const conversations = await storage.getUserConversationsList(userId);
      // NOTE: User data is automatically sanitized at storage layer
      res.json(conversations);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      res.status(500).json({ message: "Failed to fetch conversations" });
    }
  });
  
  // Get messages with a specific user
  app.get('/api/direct-messages/:otherUserId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { otherUserId } = req.params;
      
      // Verify the other user exists
      const otherUser = await storage.getUser(otherUserId);
      if (!otherUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const messages = await storage.getDirectMessagesWithUser(userId, otherUserId);
      // NOTE: User data is automatically sanitized at storage layer
      res.json(messages);
    } catch (error) {
      console.error("Error fetching direct messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });
  
  // Mark messages from a user as read
  app.post('/api/direct-messages/:otherUserId/read', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { otherUserId } = req.params;
      
      await storage.markDirectMessagesAsRead(userId, otherUserId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking messages as read:", error);
      res.status(500).json({ message: "Failed to mark messages as read" });
    }
  });

  // Get AI-suggested replies for a conversation
  app.post('/api/direct-messages/:otherUserId/suggestions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { otherUserId } = req.params;
      
      // Verify the other user exists
      const otherUser = await storage.getUser(otherUserId);
      if (!otherUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Get recent conversation history (last 10 messages for context)
      const allMessages = await storage.getDirectMessagesWithUser(userId, otherUserId);
      const recentMessages = allMessages.slice(-10);
      
      if (recentMessages.length === 0) {
        // No conversation history, provide generic suggestions
        return res.json({
          suggestions: [
            "Hello! How are you?",
            "Hi! Great to connect with you!",
            "Hey! Looking forward to chatting!"
          ]
        });
      }
      
      // Get current user info
      const currentUser = await storage.getUser(userId);
      
      // Build conversation context for AI
      const conversationContext = recentMessages.map(msg => ({
        role: msg.senderId === userId ? "assistant" : "user",
        content: msg.content
      }));
      
      // Create AI prompt for generating reply suggestions
      const { chatWithAI } = await import('./openai');
      const aiMessages = [
        {
          role: "system" as const,
          content: `You are helping a user compose quick reply suggestions for a direct message conversation on Myzymo, a social gatherings platform. Generate 3 short, natural, and contextually appropriate reply options (each 5-15 words max) based on the conversation history. The suggestions should be friendly, professional, and relevant to event planning or celebrations. Return ONLY the 3 suggestions, one per line, without numbers, bullets, or extra formatting.`
        },
        ...conversationContext,
        {
          role: "user" as const,
          content: "Generate 3 brief reply suggestions for this conversation:"
        }
      ];
      
      const aiResponse = await chatWithAI(aiMessages);
      
      // Parse AI response into array of suggestions
      const suggestions = aiResponse
        .split('\n')
        .filter(line => line.trim().length > 0)
        .slice(0, 3)
        .map(s => s.trim());
      
      // Ensure we have at least 2 suggestions
      if (suggestions.length < 2) {
        suggestions.push("Thanks for the message!", "Sounds great!");
      }
      
      res.json({ suggestions: suggestions.slice(0, 3) });
    } catch (error) {
      console.error("Error generating reply suggestions:", error);
      // Return fallback suggestions on error
      res.json({
        suggestions: [
          "Thanks for the message!",
          "Sounds good!",
          "Let me get back to you on that."
        ]
      });
    }
  });

  // === AI Assistant APIs ===
  
  // Get user's conversations
  app.get('/api/ai/conversations', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const conversations = await storage.getUserConversations(userId);
      res.json(conversations);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      res.status(500).json({ message: "Failed to fetch conversations" });
    }
  });
  
  // Get single conversation with messages
  app.get('/api/ai/conversations/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const conversation = await storage.getConversation(req.params.id);
      
      if (!conversation) {
        return res.status(404).json({ message: "Conversation not found" });
      }
      
      // Verify user owns this conversation
      if (conversation.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const messages = await storage.getConversationMessages(req.params.id);
      res.json({ ...conversation, messages });
    } catch (error) {
      console.error("Error fetching conversation:", error);
      res.status(500).json({ message: "Failed to fetch conversation" });
    }
  });
  
  // Create new conversation
  app.post('/api/ai/conversations', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const conversation = await storage.createConversation({
        userId,
        title: req.body.title || "New Chat",
      });
      res.status(201).json(conversation);
    } catch (error) {
      console.error("Error creating conversation:", error);
      res.status(500).json({ message: "Failed to create conversation" });
    }
  });
  
  // Update conversation title
  app.patch('/api/ai/conversations/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const conversation = await storage.getConversation(req.params.id);
      
      if (!conversation) {
        return res.status(404).json({ message: "Conversation not found" });
      }
      
      if (conversation.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      await storage.updateConversationTitle(req.params.id, req.body.title);
      res.json({ message: "Conversation updated" });
    } catch (error) {
      console.error("Error updating conversation:", error);
      res.status(500).json({ message: "Failed to update conversation" });
    }
  });
  
  // Delete conversation
  app.delete('/api/ai/conversations/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const conversation = await storage.getConversation(req.params.id);
      
      if (!conversation) {
        return res.status(404).json({ message: "Conversation not found" });
      }
      
      if (conversation.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      await storage.deleteConversation(req.params.id);
      res.json({ message: "Conversation deleted" });
    } catch (error) {
      console.error("Error deleting conversation:", error);
      res.status(500).json({ message: "Failed to delete conversation" });
    }
  });
  
  // Start or get onboarding conversation
  app.post('/api/ai/onboarding/start', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      
      // Check if user already has an onboarding conversation
      const existingConversations = await storage.getUserConversations(userId);
      const onboardingConversation = existingConversations.find(c => c.isOnboarding);
      
      if (onboardingConversation) {
        // Return existing onboarding conversation
        const messages = await storage.getConversationMessages(onboardingConversation.id);
        return res.json({ ...onboardingConversation, messages });
      }
      
      // Create new onboarding conversation
      const conversation = await storage.createConversation({
        userId,
        title: "Profile Setup Assistant",
        isOnboarding: true,
      });
      
      // Create initial AI greeting message
      const welcomeMessage = await storage.createAiMessage({
        conversationId: conversation.id,
        role: "assistant",
        content: "Welcome to Myzymo! I'm your personal assistant, here to help you set up your profile and get the most out of our platform.\n\nTo create the best experience for you and help you connect with others for celebrations, I'd love to learn more about you. Let's start with some basics:\n\nWhat's your name? (First and Last name)\n\nFeel free to share as much or as little as you'd like. I'm here to make this easy for you!",
      });
      
      res.status(201).json({ 
        ...conversation, 
        messages: [welcomeMessage] 
      });
    } catch (error) {
      console.error("Error starting onboarding:", error);
      res.status(500).json({ message: "Failed to start onboarding" });
    }
  });
  
  // Send message to AI
  app.post('/api/ai/chat', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { conversationId, message } = req.body;
      
      if (!conversationId || !message) {
        return res.status(400).json({ message: "conversationId and message are required" });
      }
      
      // Verify conversation exists and user owns it
      const conversation = await storage.getConversation(conversationId);
      if (!conversation) {
        return res.status(404).json({ message: "Conversation not found" });
      }
      
      if (conversation.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      // Save user message
      const userMessage = await storage.createAiMessage({
        conversationId,
        role: "user",
        content: message,
      });
      
      // Get conversation history
      const conversationHistory = await storage.getConversationMessages(conversationId);
      
      // Determine system prompt based on conversation type
      let systemPrompt = `You are an AI guide for Myzymo, a social gatherings platform for planning celebrations like college reunions, birthday parties, and family gatherings in India.

Your role is to:
1. Help users navigate and explore the platform's features
2. Guide them through creating events, finding vendors, and managing celebrations
3. Answer questions about how to use specific features
4. Provide step-by-step walkthroughs when requested
5. Suggest relevant features based on user needs

Platform Features to Guide Users Through:
- Events: Create, browse, and manage celebration events (reunions, birthdays, weddings, festivals)
- Vendors: Discover and book vendors (venues, catering, photography, decoration) across Indian cities
- Profile: Complete user profiles with education, professional, and personal details
- AI Assistant: Access personalized help and onboarding guidance
- Group Chat: Communicate with event participants (coming soon)
- Expense Tracking: Split and manage event costs (coming soon)

Common User Journeys:
- First-time users: Guide them to complete their profile and explore sample events
- Event creators: Help them create an event, invite participants, and find vendors
- Vendor seekers: Show them how to browse categories, filter by city, and make bookings
- Profile completion: Encourage adding education, professional, and personal details

Be conversational, encouraging, and proactive in suggesting next steps. Avoid using emoji. Keep responses concise but informative.`;
      
      if (conversation.isOnboarding) {
        systemPrompt = `You are a friendly onboarding assistant for Myzymo, a social gatherings platform for celebrations in India. Your goal is to help new users complete their profile in a conversational, natural way.

Profile fields to collect:
- First Name and Last Name (required)
- Age and Date of Birth
- Phone number
- Bio (a brief description about themselves)
- College name, Degree, and Graduation Year (important for reunions)
- Current City
- Profession and Company

Guidelines:
1. Ask for information naturally, one or two fields at a time - don't overwhelm them
2. Be conversational and friendly, not robotic
3. If they provide multiple pieces of information at once, acknowledge all of them
4. After collecting basic info, remind them they can update their profile anytime at the Profile page
5. Once they've shared basic information (at minimum: name), let them know they can start exploring events and connecting with others
6. Keep responses concise and engaging
7. Avoid using emoji
8. Don't be too pushy - if they want to skip certain fields, that's okay

Remember: You're guiding them through onboarding, not interrogating them. Make it feel like a friendly conversation, not a form to fill out.`;
      }
      
      // Prepare messages for AI (including system prompt)
      const aiMessages = [
        {
          role: "system" as const,
          content: systemPrompt
        },
        ...conversationHistory.map(m => ({
          role: m.role as "user" | "assistant",
          content: m.content
        }))
      ];
      
      // Import and call the AI
      const { chatWithAI } = await import('./openai');
      const aiResponse = await chatWithAI(aiMessages);
      
      // Save AI response
      const assistantMessage = await storage.createAiMessage({
        conversationId,
        role: "assistant",
        content: aiResponse,
      });
      
      res.json({
        userMessage,
        assistantMessage,
      });
    } catch (error: any) {
      console.error("Error in AI chat:", error);
      const statusCode = error.message?.includes("404") ? 404 : 
                         error.message?.includes("403") ? 403 : 500;
      res.status(statusCode).json({ 
        message: error.message || "Failed to process AI chat" 
      });
    }
  });

  // Quote endpoints
  
  // POST /api/quotes/estimate - Public endpoint for AI-powered cost estimation
  app.post('/api/quotes/estimate', async (req, res) => {
    try {
      const validatedData = insertQuoteSchema.parse(req.body);
      
      // Generate AI cost estimation using OpenAI
      const { chatWithAI } = await import('./openai');
      
      const systemPrompt = `You are an expert event cost estimator for the Indian market. Analyze the event details and provide a comprehensive cost breakdown.

Event Types: Wedding, Birthday Party, College Reunion, Corporate Event, Engagement, Anniversary, Baby Shower, Housewarming, Festival Celebration, etc.

Indian Market Context:
- Tier 1 cities (Mumbai, Delhi, Bangalore, Hyderabad, Chennai, Kolkata): 20-30% higher costs
- Tier 2 cities (Pune, Ahmedabad, Jaipur, Lucknow, Kochi): 10-20% higher costs
- Tier 3+ cities: Baseline costs

Seasonal Factors:
- Wedding season (Oct-Feb): 15-25% price surge
- Festival season (Diwali, Holi, etc.): 10-20% surge
- Off-season (monsoon months): 10-15% discounts available

Cost Categories (in INR):
1. Venue: Based on guest count and city tier
2. Catering: Per-plate costs (₹300-1500 range depending on cuisine and service level)
3. Decoration: Based on event type and scale
4. Photography/Videography: Professional packages
5. Entertainment: DJ, band, or performers
6. Miscellaneous: Invitations, return gifts, etc.

Provide JSON output with this structure:
{
  "totalEstimate": <number in INR>,
  "breakdown": {
    "venue": <number>,
    "catering": <number>,
    "decoration": <number>,
    "photography": <number>,
    "entertainment": <number>,
    "miscellaneous": <number>
  },
  "perGuestCost": <number>,
  "cityTier": "Tier 1" | "Tier 2" | "Tier 3+",
  "seasonalFactor": "Peak Season" | "Off Season" | "Regular",
  "recommendations": [
    "string of budget-saving tips or enhancement suggestions"
  ],
  "notes": "Any important considerations or assumptions"
}`;

      const userPrompt = `Event Details:
- Type: ${validatedData.eventType}
- Date: ${new Date(validatedData.eventDateTime).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
- Location: ${validatedData.locationCity}${validatedData.locationState ? ', ' + validatedData.locationState : ''}
- Guest Count: ${validatedData.guestCount || 'Not specified (assume 50-100)'}
- Contact: ${validatedData.guestName} (${validatedData.email})

Provide a detailed cost estimation in JSON format.`;

      const aiResponse = await chatWithAI([
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ]);
      
      // Parse AI response (extract JSON from markdown code blocks if present)
      let estimateJson;
      try {
        const jsonMatch = aiResponse.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        const jsonStr = jsonMatch ? jsonMatch[1] : aiResponse;
        estimateJson = JSON.parse(jsonStr);
      } catch (parseError) {
        console.error("Error parsing AI response:", parseError);
        estimateJson = {
          totalEstimate: 150000,
          breakdown: {
            venue: 40000,
            catering: 50000,
            decoration: 25000,
            photography: 20000,
            entertainment: 10000,
            miscellaneous: 5000,
          },
          perGuestCost: 1500,
          cityTier: "Tier 2",
          seasonalFactor: "Regular",
          recommendations: ["Consider booking vendors 2-3 months in advance for better rates"],
          notes: "Estimate based on typical event requirements"
        };
      }
      
      // Save the quote to database as draft (with null userId for guest)
      const savedQuote = await storage.createQuote({
        ...validatedData,
        userId: null,
        estimateJson,
        status: 'draft',
      });
      
      res.json({
        quoteId: savedQuote.id,
        estimate: estimateJson,
      });
    } catch (error: any) {
      console.error("Error generating quote estimate:", error);
      if (error.name === 'ZodError') {
        res.status(400).json({ message: "Invalid quote data", errors: error.errors });
      } else {
        res.status(500).json({ message: error.message || "Failed to generate estimate" });
      }
    }
  });
  
  // POST /api/quotes - Save a quote (authenticated users only)
  app.post('/api/quotes', isAuthenticated, async (req: any, res) => {
    try {
      const { quoteId } = req.body;
      
      if (!quoteId) {
        return res.status(400).json({ message: "Quote ID is required" });
      }
      
      // Update the quote to associate it with the authenticated user
      const updatedQuote = await storage.updateQuoteOwner(quoteId, req.user.id);
      
      if (!updatedQuote) {
        return res.status(404).json({ message: "Quote not found" });
      }
      
      res.json(updatedQuote);
    } catch (error: any) {
      console.error("Error saving quote:", error);
      res.status(500).json({ message: error.message || "Failed to save quote" });
    }
  });
  
  // GET /api/quotes - Get user's saved quotes
  app.get('/api/quotes', isAuthenticated, async (req: any, res) => {
    try {
      const quotes = await storage.getQuotesByUser(req.user.id);
      res.json(quotes);
    } catch (error: any) {
      console.error("Error fetching quotes:", error);
      res.status(500).json({ message: error.message || "Failed to fetch quotes" });
    }
  });

  // POST /api/vendor/generate-description - AI-powered business description generator
  app.post('/api/vendor/generate-description', async (req, res) => {
    try {
      const { businessName, category, location, priceRange, existingDescription } = req.body;
      
      if (!businessName || !category) {
        return res.status(400).json({ message: "Business name and category are required" });
      }
      
      const { chatWithAI } = await import('./openai');
      
      const systemPrompt = `You are an expert business copywriter specializing in the Indian event and celebration industry. Your task is to write compelling, professional business descriptions for vendors.

Guidelines:
- Write in a warm, professional tone that appeals to Indian customers planning celebrations
- Highlight unique selling points and service quality
- Keep it concise (50-150 words)
- Use natural, engaging language without excessive marketing jargon
- Mention relevant experience, specialties, or certifications if appropriate
- Make it customer-focused and benefit-oriented

Return ONLY the business description text, without any additional formatting, quotes, or explanations.`;

      const categoryDetails: Record<string, string> = {
        venue: "event venues and banquet halls",
        catering: "catering and food services",
        photography: "photography and videography",
        decoration: "event decoration and design",
        entertainment: "entertainment and performances",
        other: "celebration services"
      };

      const priceRangeText: Record<string, string> = {
        "₹": "budget-friendly",
        "₹₹": "moderately priced",
        "₹₹₹": "premium",
        "₹₹₹₹": "luxury"
      };

      let userPrompt = `Generate a compelling business description for:

Business Name: ${businessName}
Category: ${categoryDetails[category] || category}
Location: ${location || 'India'}`;

      if (priceRange) {
        userPrompt += `\nPrice Range: ${priceRangeText[priceRange] || 'varied pricing'}`;
      }

      if (existingDescription && existingDescription.trim()) {
        userPrompt += `\n\nCurrent description (IMPORTANT: Keep ALL existing content and only improve grammar, flow, and professionalism. Do NOT remove or replace any information - only polish and enhance what's already there):\n${existingDescription}`;
      } else {
        userPrompt += `\n\nCreate a fresh, engaging description highlighting why customers should choose this business for their celebration needs.`;
      }

      const aiResponse = await chatWithAI([
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ]);
      
      // Clean up the response (remove quotes if AI wrapped it)
      let description = aiResponse.trim();
      if ((description.startsWith('"') && description.endsWith('"')) || 
          (description.startsWith("'") && description.endsWith("'"))) {
        description = description.slice(1, -1);
      }
      
      res.json({ description });
    } catch (error: any) {
      console.error("Error generating business description:", error);
      res.status(500).json({ message: error.message || "Failed to generate description" });
    }
  });

  const httpServer = createServer(app);

  // WebSocket server for real-time chat - blueprint: javascript_websocket
  const wss = new WebSocketServer({ 
    server: httpServer, 
    path: '/ws',
    verifyClient: (info, callback) => {
      // Extract session from cookie
      const cookies = parseCookie(info.req.headers.cookie || '');
      const sessionCookie = cookies['connect.sid'];
      
      if (!sessionCookie) {
        callback(false, 401, 'Unauthorized');
        return;
      }
      
      // Verify and extract session ID from signed cookie
      let sessionId: string | false;
      if (sessionCookie.startsWith('s:')) {
        // Cookie is signed - verify signature and extract ID
        sessionId = unsign(sessionCookie.slice(2), process.env.SESSION_SECRET!);
      } else {
        sessionId = sessionCookie;
      }
      
      if (!sessionId) {
        callback(false, 401, 'Invalid session signature');
        return;
      }
      
      // Verify session exists (custom auth stores userId directly in session)
      sessionStore.get(sessionId, (err: any, session: any) => {
        if (err || !session || !session.userId) {
          callback(false, 401, 'Unauthorized');
          return;
        }
        
        // Attach authenticated userId to request for later use
        (info.req as any).authenticatedUserId = session.userId;
        callback(true);
      });
    }
  });

  // Store active connections by event ID
  const eventConnections = new Map<string, Set<WebSocket>>();
  // Track active users per event: Map<eventId, Map<userId, WebSocket>>
  const eventActiveUsers = new Map<string, Map<string, WebSocket>>();
  // Track user connections for direct messages: Map<userId, WebSocket>
  const userConnections = new Map<string, WebSocket>();

  // Helper to broadcast presence updates
  const broadcastPresence = async (eventId: string) => {
    const activeUsers = eventActiveUsers.get(eventId);
    if (!activeUsers) return;
    
    const activeUserIds = Array.from(activeUsers.keys());
    const presenceData = JSON.stringify({
      type: 'presence',
      activeUsers: activeUserIds,
    });
    
    const connections = eventConnections.get(eventId);
    if (connections) {
      connections.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(presenceData);
        }
      });
    }
  };

  wss.on('connection', (ws, req: IncomingMessage) => {
    let currentEventId: string | null = null;
    // Get authenticated userId from session verification
    const authenticatedUserId = (req as any).authenticatedUserId as string;
    
    // Register user connection for direct messages
    userConnections.set(authenticatedUserId, ws);

    ws.on('message', async (data) => {
      try {
        const message = JSON.parse(data.toString());

        if (message.type === 'join' && message.eventId) {
          // Verify event exists and authenticated user has access (creator or participant)
          const event = await storage.getEvent(message.eventId);
          if (!event) {
            ws.send(JSON.stringify({ type: 'error', message: 'Event not found' }));
            return;
          }
          
          const hasAccess = await storage.canUserAccessEvent(authenticatedUserId, message.eventId);
          if (!hasAccess) {
            ws.send(JSON.stringify({ type: 'error', message: 'You do not have access to this event' }));
            return;
          }
          
          // Join event chat room
          currentEventId = message.eventId as string;
          
          if (!eventConnections.has(currentEventId)) {
            eventConnections.set(currentEventId, new Set());
          }
          eventConnections.get(currentEventId)!.add(ws);
          
          // Track active user
          if (!eventActiveUsers.has(currentEventId)) {
            eventActiveUsers.set(currentEventId, new Map());
          }
          eventActiveUsers.get(currentEventId)!.set(authenticatedUserId, ws);
          
          ws.send(JSON.stringify({ type: 'joined', eventId: currentEventId }));
          
          // Broadcast updated presence to all users in the event
          await broadcastPresence(currentEventId);
        } else if (message.type === 'message' && currentEventId) {
          // Verify authenticated user still has access (in case they were removed)
          const hasAccess = await storage.canUserAccessEvent(authenticatedUserId, currentEventId);
          if (!hasAccess) {
            ws.send(JSON.stringify({ type: 'error', message: 'You no longer have access to this event' }));
            return;
          }
          
          // Validate message schema using authenticated userId
          const validatedMessage = insertMessageSchema.parse({
            eventId: currentEventId,
            senderId: authenticatedUserId,
            content: message.content,
          });

          // Save to database
          const savedMessage = await storage.createMessage(validatedMessage);
          
          // Get sender info
          const sender = await storage.getUser(authenticatedUserId);

          // Broadcast to all clients in this event's room
          const broadcastData = JSON.stringify({
            type: 'message',
            message: {
              ...savedMessage,
              sender,
            },
          });

          const connections = eventConnections.get(currentEventId);
          if (connections) {
            connections.forEach((client) => {
              if (client.readyState === WebSocket.OPEN) {
                client.send(broadcastData);
              }
            });
          }
        } else if (message.type === 'direct-message' && message.recipientId && message.content) {
          // Handle private direct messages
          const recipientId = message.recipientId;
          
          // Verify recipient exists
          const recipient = await storage.getUser(recipientId);
          if (!recipient) {
            ws.send(JSON.stringify({ type: 'error', message: 'Recipient not found' }));
            return;
          }
          
          // Save direct message to database
          const savedMessage = await storage.createDirectMessage({
            senderId: authenticatedUserId,
            recipientId,
            content: message.content,
          });
          
          // Get sender info
          const sender = await storage.getUser(authenticatedUserId);
          
          // Prepare message data
          const messageData = JSON.stringify({
            type: 'direct-message',
            message: {
              ...savedMessage,
              sender,
              recipient,
            },
          });
          
          // Send to sender (for confirmation)
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(messageData);
          }
          
          // Send to recipient if they're online
          const recipientWs = userConnections.get(recipientId);
          if (recipientWs && recipientWs.readyState === WebSocket.OPEN) {
            recipientWs.send(messageData);
          }
        } else if (message.type === 'call-offer' && message.recipientId) {
          // WebRTC signaling: forward call offer to recipient
          const recipientId = message.recipientId;
          const recipient = await storage.getUser(recipientId);
          if (!recipient) {
            ws.send(JSON.stringify({ type: 'error', message: 'Recipient not found' }));
            return;
          }
          
          const sender = await storage.getUser(authenticatedUserId);
          const recipientWs = userConnections.get(recipientId);
          if (recipientWs && recipientWs.readyState === WebSocket.OPEN) {
            recipientWs.send(JSON.stringify({
              type: 'call-offer',
              callerId: authenticatedUserId,
              caller: sender,
              offer: message.offer,
              callType: message.callType,
            }));
          } else {
            ws.send(JSON.stringify({ 
              type: 'call-failed', 
              message: 'User is offline' 
            }));
          }
        } else if (message.type === 'call-answer' && message.callerId) {
          // WebRTC signaling: forward call answer to caller
          const callerWs = userConnections.get(message.callerId);
          if (callerWs && callerWs.readyState === WebSocket.OPEN) {
            callerWs.send(JSON.stringify({
              type: 'call-answer',
              answererId: authenticatedUserId,
              answer: message.answer,
            }));
          }
        } else if (message.type === 'call-ice-candidate' && message.targetId) {
          // WebRTC signaling: forward ICE candidate to peer
          const targetWs = userConnections.get(message.targetId);
          if (targetWs && targetWs.readyState === WebSocket.OPEN) {
            targetWs.send(JSON.stringify({
              type: 'call-ice-candidate',
              senderId: authenticatedUserId,
              candidate: message.candidate,
            }));
          }
        } else if (message.type === 'call-reject' && message.callerId) {
          // Forward call rejection to caller
          const callerWs = userConnections.get(message.callerId);
          if (callerWs && callerWs.readyState === WebSocket.OPEN) {
            callerWs.send(JSON.stringify({
              type: 'call-rejected',
              rejecterId: authenticatedUserId,
            }));
          }
        } else if (message.type === 'call-end' && message.peerId) {
          // Forward call end to peer
          const peerWs = userConnections.get(message.peerId);
          if (peerWs && peerWs.readyState === WebSocket.OPEN) {
            peerWs.send(JSON.stringify({
              type: 'call-ended',
              senderId: authenticatedUserId,
            }));
          }
        }
      } catch (error: any) {
        console.error('WebSocket error:', error);
        const errorMessage = error.name === 'ZodError' 
          ? 'Invalid message data' 
          : 'An error occurred';
        ws.send(JSON.stringify({ type: 'error', message: errorMessage }));
      }
    });

    ws.on('close', async () => {
      // Remove user connection for direct messages
      userConnections.delete(authenticatedUserId);
      
      // Remove connection from all rooms
      if (currentEventId) {
        const connections = eventConnections.get(currentEventId);
        if (connections) {
          connections.delete(ws);
          if (connections.size === 0) {
            eventConnections.delete(currentEventId);
          }
        }
        
        // Remove user from active users
        const activeUsers = eventActiveUsers.get(currentEventId);
        if (activeUsers) {
          activeUsers.delete(authenticatedUserId);
          if (activeUsers.size === 0) {
            eventActiveUsers.delete(currentEventId);
          } else {
            // Broadcast updated presence to remaining users
            await broadcastPresence(currentEventId);
          }
        }
      }
    });
  });

  return httpServer;
}

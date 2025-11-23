import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { parse as parseCookie } from "cookie";
import { unsign } from "cookie-signature";
import { z } from "zod";
import { storage } from "./storage";
import { setupAuth, isAuthenticated, sessionStore } from "./replitAuth";
import { 
  insertMessageSchema, 
  insertEventSchema, 
  insertEventParticipantSchema,
  insertExpenseSchema,
  insertBookingSchema,
  updateProfileSchema,
} from "@shared/schema";
import { db } from "./db";
import type { IncomingMessage } from "http";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication - blueprint: javascript_log_in_with_replit
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Update user profile
  app.patch('/api/user/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = updateProfileSchema.parse(req.body);
      
      console.log('[Profile Update] User ID:', userId);
      console.log('[Profile Update] Validated data:', JSON.stringify(validatedData, null, 2));
      
      const profileUpdate: any = { ...validatedData };
      if (validatedData.dateOfBirth) {
        profileUpdate.dateOfBirth = new Date(validatedData.dateOfBirth);
      }
      
      const updatedUser = await storage.updateUserProfile(userId, profileUpdate);
      console.log('[Profile Update] Updated user:', JSON.stringify(updatedUser, null, 2));
      res.json(updatedUser);
    } catch (error: any) {
      console.error("Error updating profile:", error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid profile data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // === Event Management APIs ===
  
  // Get all events (for discovery)
  app.get('/api/events', isAuthenticated, async (req: any, res) => {
    try {
      // Return all events so users can discover and join them
      const allEvents = await storage.getAllEvents();
      res.json(allEvents);
    } catch (error) {
      console.error("Error fetching events:", error);
      res.status(500).json({ message: "Failed to fetch events" });
    }
  });

  // Get single event with details
  app.get('/api/events/:id', isAuthenticated, async (req: any, res) => {
    try {
      const event = await storage.getEvent(req.params.id);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      // Anyone can view event details (for discovery)
      // Get participants, messages, expenses, and bookings
      const [participants, messages, expenses, bookings] = await Promise.all([
        storage.getEventParticipants(req.params.id),
        storage.getEventMessages(req.params.id),
        storage.getEventExpenses(req.params.id),
        storage.getEventBookings(req.params.id),
      ]);
      
      res.json({ ...event, participants, messages, expenses, bookings });
    } catch (error) {
      console.error("Error fetching event:", error);
      res.status(500).json({ message: "Failed to fetch event" });
    }
  });

  // Create event
  app.post('/api/events', isAuthenticated, async (req: any, res) => {
    try {
      console.log("[POST /api/events] Request body:", req.body);
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
      
      // Verify event exists and user is the creator
      const event = await storage.getEvent(req.params.id);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      if (event.creatorId !== userId) {
        return res.status(403).json({ message: "Only the event creator can update the event" });
      }
      
      // Validate update data using partial schema
      const updateSchema = insertEventSchema.partial().omit({ creatorId: true });
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
      const userId = req.user.claims.sub;
      
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
      const userId = req.user.claims.sub;
      
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
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
      
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
      const userId = req.user.claims.sub;
      
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

  // === AI Assistant APIs ===
  
  // Get user's conversations
  app.get('/api/ai/conversations', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
      
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
      const userId = req.user.claims.sub;
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
      let systemPrompt = "You are a helpful AI assistant for Myzymo, a social gatherings platform for planning celebrations like college reunions, birthday parties, and family gatherings in India. Help users with event planning, vendor recommendations, and general questions about using the platform. Be friendly, concise, and helpful.";
      
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
7. Use emojis sparingly to be friendly but professional
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
      
      // Verify session exists
      sessionStore.get(sessionId, (err, session) => {
        if (err || !session || !session.passport?.user?.claims?.sub) {
          callback(false, 401, 'Unauthorized');
          return;
        }
        
        // Attach authenticated userId to request for later use
        (info.req as any).authenticatedUserId = session.passport.user.claims.sub;
        callback(true);
      });
    }
  });

  // Store active connections by event ID
  const eventConnections = new Map<string, Set<WebSocket>>();

  wss.on('connection', (ws, req: IncomingMessage) => {
    let currentEventId: string | null = null;
    // Get authenticated userId from session verification
    const authenticatedUserId = (req as any).authenticatedUserId as string;

    ws.on('message', async (data) => {
      try {
        const message = JSON.parse(data.toString());

        if (message.type === 'join' && message.eventId) {
          // Verify event exists and authenticated user is a participant
          const event = await storage.getEvent(message.eventId);
          if (!event) {
            ws.send(JSON.stringify({ type: 'error', message: 'Event not found' }));
            return;
          }
          
          const participants = await storage.getEventParticipants(message.eventId);
          const participantUserIds = participants.map(p => p.userId);
          if (!participantUserIds.includes(authenticatedUserId)) {
            ws.send(JSON.stringify({ type: 'error', message: 'Not a participant of this event' }));
            return;
          }
          
          // Join event chat room
          currentEventId = message.eventId as string;
          
          if (!eventConnections.has(currentEventId)) {
            eventConnections.set(currentEventId, new Set());
          }
          eventConnections.get(currentEventId)!.add(ws);
          
          ws.send(JSON.stringify({ type: 'joined', eventId: currentEventId }));
        } else if (message.type === 'message' && currentEventId) {
          // Verify authenticated user is still a participant (in case they were removed)
          const participants = await storage.getEventParticipants(currentEventId);
          const participantUserIds = participants.map(p => p.userId);
          if (!participantUserIds.includes(authenticatedUserId)) {
            ws.send(JSON.stringify({ type: 'error', message: 'No longer a participant of this event' }));
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
        }
      } catch (error: any) {
        console.error('WebSocket error:', error);
        const errorMessage = error.name === 'ZodError' 
          ? 'Invalid message data' 
          : 'An error occurred';
        ws.send(JSON.stringify({ type: 'error', message: errorMessage }));
      }
    });

    ws.on('close', () => {
      // Remove connection from all rooms
      if (currentEventId) {
        const connections = eventConnections.get(currentEventId);
        if (connections) {
          connections.delete(ws);
          if (connections.size === 0) {
            eventConnections.delete(currentEventId);
          }
        }
      }
    });
  });

  return httpServer;
}

import { 
  users, events, eventParticipants, messages, directMessages, expenses, expenseSplits, vendors, bookings,
  aiConversations, aiMessages, quotes, userFollowedEvents,
  type User, type UpsertUser,
  type Event, type InsertEvent,
  type EventParticipant, type InsertEventParticipant,
  type Message, type InsertMessage,
  type DirectMessage, type InsertDirectMessage,
  type Expense, type InsertExpense,
  type ExpenseSplit, type InsertExpenseSplit,
  type Vendor, type InsertVendor,
  type Booking, type InsertBooking,
  type AiConversation, type InsertAiConversation,
  type AiMessage, type InsertAiMessage,
  type Quote, type InsertQuote,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql } from "drizzle-orm";
import { sanitizeUser } from "@shared/sanitize";

export interface IStorage {
  // User methods (required for Replit Auth and custom auth)
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  upsertUser(user: UpsertUser): Promise<User>;
  createUserWithPassword(user: { username: string; password: string; email: string; firstName: string; lastName: string; role?: string }): Promise<User>;
  createUserWithRole(user: { username: string; password: string; email: string; firstName: string; lastName: string; role: string }): Promise<User>;
  updateUserProfile(userId: string, profileData: Partial<User>): Promise<User>;
  updateUserRole(userId: string, role: string): Promise<User | undefined>;
  deleteUser(userId: string): Promise<void>;
  
  // Social auth methods
  findUserByProviderId(provider: string, providerId: string): Promise<User | undefined>;
  createSocialUser(userData: { provider: string; providerId: string; email: string; firstName: string; lastName: string; profileImageUrl?: string }): Promise<User>;
  
  // Event methods
  getEvent(id: string): Promise<Event | undefined>;
  getAllEvents(): Promise<Event[]>;
  getAllEventsForAdmin(): Promise<Event[]>;
  getEventsByUser(userId: string): Promise<Event[]>;
  getPrivateEventsForUser(userId: string): Promise<Event[]>; // Events created by or joined by user
  getPublicEvents(): Promise<Event[]>; // All public events
  getFollowedPublicEvents(userId: string): Promise<Event[]>; // Public events user follows
  createEvent(event: InsertEvent): Promise<Event>;
  updateEvent(id: string, event: Partial<InsertEvent>): Promise<Event | undefined>;
  deleteEvent(id: string): Promise<void>;
  followPublicEvent(userId: string, eventId: string): Promise<void>;
  unfollowPublicEvent(userId: string, eventId: string): Promise<void>;
  isEventFollowedByUser(userId: string, eventId: string): Promise<boolean>;
  
  // Event participant methods
  getEventParticipants(eventId: string): Promise<(EventParticipant & { user: User })[]>;
  addEventParticipant(participant: InsertEventParticipant): Promise<EventParticipant>;
  removeEventParticipant(eventId: string, userId: string): Promise<void>;
  getUserEvents(userId: string): Promise<(EventParticipant & { event: Event })[]>;
  getUserAccessibleEvents(userId: string): Promise<Event[]>;
  getAllEventsForUser(userId: string): Promise<Event[]>;
  canUserAccessEvent(userId: string, eventId: string): Promise<boolean>;
  
  // Message methods
  getEventMessages(eventId: string): Promise<(Message & { sender: User })[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  
  // Direct Message methods
  getDirectMessagesWithUser(userId: string, otherUserId: string): Promise<(DirectMessage & { sender: User, recipient: User })[]>;
  getUserConversationsList(userId: string): Promise<{userId: string, user: User, lastMessage: DirectMessage | null, unreadCount: number}[]>;
  createDirectMessage(message: InsertDirectMessage): Promise<DirectMessage>;
  markDirectMessagesAsRead(userId: string, senderId: string): Promise<void>;
  
  // Expense methods
  getEventExpenses(eventId: string): Promise<(Expense & { paidBy: User, splits: (ExpenseSplit & { user: User })[] })[]>;
  createExpense(expense: InsertExpense): Promise<Expense>;
  createExpenseSplit(split: InsertExpenseSplit): Promise<ExpenseSplit>;
  updateExpenseSplitPayment(id: string, isPaid: boolean): Promise<void>;
  
  // Vendor methods
  getAllVendors(): Promise<Vendor[]>;
  getVendorsByCategory(category: string): Promise<Vendor[]>;
  getVendor(id: string): Promise<Vendor | undefined>;
  getVendorByUserId(userId: string): Promise<Vendor | undefined>;
  createVendor(vendor: InsertVendor): Promise<Vendor>;
  updateVendor(id: string, vendor: Partial<InsertVendor>): Promise<Vendor | undefined>;
  updateVendorApprovalStatus(id: string, status: string): Promise<void>;
  deleteVendor(id: string): Promise<void>;
  
  // Booking methods
  getAllBookings(): Promise<Booking[]>;
  getEventBookings(eventId: string): Promise<(Booking & { vendor: Vendor })[]>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  updateBookingStatus(id: string, status: string): Promise<void>;
  
  // AI Conversation methods
  getUserConversations(userId: string): Promise<AiConversation[]>;
  getConversation(id: string): Promise<AiConversation | undefined>;
  createConversation(conversation: InsertAiConversation): Promise<AiConversation>;
  updateConversationTitle(id: string, title: string): Promise<void>;
  deleteConversation(id: string): Promise<void>;
  
  // AI Message methods
  getConversationMessages(conversationId: string): Promise<AiMessage[]>;
  createAiMessage(message: InsertAiMessage): Promise<AiMessage>;
  
  // Quote methods
  createQuote(quote: InsertQuote): Promise<Quote>;
  getQuote(id: string): Promise<Quote | undefined>;
  getQuotesByUser(userId: string): Promise<Quote[]>;
  updateQuoteOwner(id: string, userId: string): Promise<Quote | undefined>;
  updateQuoteStatus(id: string, status: string): Promise<Quote | undefined>;
}

export class DatabaseStorage implements IStorage {
  // User methods (required for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user ? sanitizeUser(user) : undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    // NOTE: Don't sanitize here - this is used for authentication and needs password field
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    // NOTE: Don't sanitize here - this is used for authentication and needs password field
    return user || undefined;
  }

  async createUserWithPassword(userData: { username: string; password: string; email: string; firstName: string; lastName: string; role?: string }): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        username: userData.username,
        password: userData.password,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role || 'user',
      })
      .returning();

    // Add new user to sample events
    try {
      const systemUser = await db.select().from(users).where(eq(users.email, 'system@myzymo.com')).limit(1);
      if (systemUser.length > 0) {
        const sampleEvents = await db.select().from(events).where(eq(events.creatorId, systemUser[0].id));
        
        for (const event of sampleEvents) {
          await db.insert(eventParticipants).values({
            eventId: event.id,
            userId: user.id,
            status: 'going',
          }).onConflictDoNothing();
        }
        console.log('[Storage] Added new user to', sampleEvents.length, 'sample events');
      }
    } catch (error) {
      console.error('[Storage] Error adding new user to sample events:', error);
    }
    
    return sanitizeUser(user);
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    // Check if user exists before insert
    const existingUser = userData.email ? await this.getUserByEmail(userData.email) : null;
    const isNewUser = !existingUser;
    
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.email,
        set: {
          // Only update auth-related fields, preserve user's profile data
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          profileImageUrl: userData.profileImageUrl,
          updatedAt: new Date(),
          // Do NOT update: age, dateOfBirth, phone, bio, college, graduationYear, degree, currentCity, profession, company
        },
      })
      .returning();
    
    // If this is a new user, automatically add them to all sample events
    if (isNewUser) {
      console.log('[Storage] New user created, adding to sample events:', user.email);
      try {
        // Get all sample events (created by system@myzymo.com user)
        const systemUser = await db.select().from(users).where(eq(users.email, 'system@myzymo.com')).limit(1);
        if (systemUser.length > 0) {
          const sampleEvents = await db.select().from(events).where(eq(events.creatorId, systemUser[0].id));
          
          // Add new user as participant to all sample events
          for (const event of sampleEvents) {
            await db.insert(eventParticipants).values({
              eventId: event.id,
              userId: user.id,
              status: 'going',
            }).onConflictDoNothing();
          }
          console.log('[Storage] Added new user to', sampleEvents.length, 'sample events');
        }
      } catch (error) {
        console.error('[Storage] Error adding new user to sample events:', error);
        // Don't fail user creation if adding to sample events fails
      }
    }
    
    return sanitizeUser(user);
  }

  async updateUserProfile(userId: string, profileData: Partial<User>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        ...profileData,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    return sanitizeUser(user);
  }

  async getAllUsers(): Promise<User[]> {
    const allUsers = await db.select().from(users).orderBy(desc(users.createdAt));
    // SECURITY: Sanitize all user objects
    return allUsers.map(u => sanitizeUser(u));
  }

  async createUserWithRole(userData: { username: string; password: string; email: string; firstName: string; lastName: string; role: string }): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        username: userData.username,
        password: userData.password,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role,
      })
      .returning();
    
    return sanitizeUser(user);
  }

  // Social auth methods
  async findUserByProviderId(provider: string, providerId: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(and(eq(users.provider, provider), eq(users.providerId, providerId)));
    
    return user ? sanitizeUser(user) : undefined;
  }

  async createSocialUser(userData: { provider: string; providerId: string; email: string; firstName: string; lastName: string; profileImageUrl?: string }): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        provider: userData.provider,
        providerId: userData.providerId,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        profileImageUrl: userData.profileImageUrl,
      })
      .returning();
    
    // Add new social user to sample events
    try {
      const systemUser = await db.select().from(users).where(eq(users.email, 'system@myzymo.com')).limit(1);
      if (systemUser.length > 0) {
        const sampleEvents = await db.select().from(events).where(eq(events.creatorId, systemUser[0].id));
        for (const event of sampleEvents) {
          await db.insert(eventParticipants).values({
            eventId: event.id,
            userId: user.id,
            status: 'going',
          }).onConflictDoNothing();
        }
      }
    } catch (error) {
      console.error('[Storage] Error adding social user to sample events:', error);
    }
    
    return sanitizeUser(user);
  }

  async updateUserRole(userId: string, role: string): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ role, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return user ? sanitizeUser(user) : undefined;
  }

  async deleteUser(userId: string): Promise<void> {
    await db.delete(users).where(eq(users.id, userId));
  }

  // Event methods
  async getEvent(id: string): Promise<Event | undefined> {
    const [event] = await db.select().from(events).where(eq(events.id, id));
    return event || undefined;
  }

  async getAllEvents(): Promise<Event[]> {
    return await db.select().from(events).orderBy(desc(events.date));
  }

  async getAllEventsForAdmin(): Promise<Event[]> {
    // For admin dashboard, return all events with creator info
    return await db.select().from(events).orderBy(desc(events.createdAt));
  }

  async getEventsByUser(userId: string): Promise<Event[]> {
    return await db.select().from(events).where(eq(events.creatorId, userId)).orderBy(desc(events.date));
  }

  async getPrivateEventsForUser(userId: string): Promise<Event[]> {
    // Get ALL events created by the user (regardless of isPublic status)
    // Event creators should always see their own events in "My Events"
    const createdEvents = await db
      .select()
      .from(events)
      .where(eq(events.creatorId, userId))
      .orderBy(desc(events.date));

    // Get only PRIVATE events where user is a participant (not creator)
    const joinedEventsData = await db
      .select({ event: events })
      .from(eventParticipants)
      .innerJoin(events, eq(eventParticipants.eventId, events.id))
      .where(and(
        eq(eventParticipants.userId, userId),
        eq(events.isPublic, false),
        // Exclude events created by this user (already included above)
        sql`${events.creatorId} != ${userId}`
      ))
      .orderBy(desc(events.date));

    const joinedEvents = joinedEventsData.map(row => row.event);
    const allPrivateEvents = [...createdEvents, ...joinedEvents];
    const uniqueEvents = Array.from(new Map(allPrivateEvents.map(e => [e.id, e])).values());
    return uniqueEvents.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  async getPublicEvents(): Promise<Event[]> {
    return await db
      .select()
      .from(events)
      .where(eq(events.isPublic, true))
      .orderBy(desc(events.date));
  }

  async getFollowedPublicEvents(userId: string): Promise<Event[]> {
    const followedEvents = await db
      .select({ event: events })
      .from(userFollowedEvents)
      .innerJoin(events, eq(userFollowedEvents.eventId, events.id))
      .where(eq(userFollowedEvents.userId, userId))
      .orderBy(desc(events.date));

    return followedEvents.map(row => row.event);
  }

  async createEvent(insertEvent: InsertEvent): Promise<Event> {
    const [event] = await db.insert(events).values(insertEvent).returning();
    return event;
  }

  async followPublicEvent(userId: string, eventId: string): Promise<void> {
    await db.insert(userFollowedEvents).values({
      userId,
      eventId,
    });
  }

  async unfollowPublicEvent(userId: string, eventId: string): Promise<void> {
    await db
      .delete(userFollowedEvents)
      .where(and(eq(userFollowedEvents.userId, userId), eq(userFollowedEvents.eventId, eventId)));
  }

  async isEventFollowedByUser(userId: string, eventId: string): Promise<boolean> {
    const [follow] = await db
      .select()
      .from(userFollowedEvents)
      .where(and(eq(userFollowedEvents.userId, userId), eq(userFollowedEvents.eventId, eventId)))
      .limit(1);

    return !!follow;
  }

  async updateEvent(id: string, updateData: Partial<InsertEvent>): Promise<Event | undefined> {
    const [event] = await db
      .update(events)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(events.id, id))
      .returning();
    return event || undefined;
  }

  async deleteEvent(id: string): Promise<void> {
    await db.delete(events).where(eq(events.id, id));
  }

  // Event participant methods
  async getEventParticipants(eventId: string): Promise<(EventParticipant & { user: User })[]> {
    const results = await db
      .select()
      .from(eventParticipants)
      .where(eq(eventParticipants.eventId, eventId))
      .leftJoin(users, eq(eventParticipants.userId, users.id));
    
    // SECURITY: Sanitize user objects before returning
    return results.map(r => ({
      ...r.event_participants,
      user: sanitizeUser(r.users!),
    }));
  }

  async addEventParticipant(participant: InsertEventParticipant): Promise<EventParticipant> {
    const [result] = await db.insert(eventParticipants).values(participant).returning();
    return result;
  }

  async removeEventParticipant(eventId: string, userId: string): Promise<void> {
    await db
      .delete(eventParticipants)
      .where(and(eq(eventParticipants.eventId, eventId), eq(eventParticipants.userId, userId)));
  }

  async getUserEvents(userId: string): Promise<(EventParticipant & { event: Event })[]> {
    const results = await db
      .select()
      .from(eventParticipants)
      .where(eq(eventParticipants.userId, userId))
      .leftJoin(events, eq(eventParticipants.eventId, events.id))
      .orderBy(desc(events.date));
    
    return results.map(r => ({
      ...r.event_participants,
      event: r.events!,
    }));
  }

  async getUserAccessibleEvents(userId: string): Promise<Event[]> {
    // Get events created by the user
    const createdEvents = await db
      .select()
      .from(events)
      .where(eq(events.creatorId, userId));
    
    // Get events where user is a participant
    const participantEvents = await db
      .select({
        id: events.id,
        title: events.title,
        description: events.description,
        date: events.date,
        location: events.location,
        imageUrl: events.imageUrl,
        creatorId: events.creatorId,
        createdAt: events.createdAt,
        updatedAt: events.updatedAt,
      })
      .from(eventParticipants)
      .where(eq(eventParticipants.userId, userId))
      .leftJoin(events, eq(eventParticipants.eventId, events.id));
    
    const eventMap = new Map<string, Event>();
    
    // Add user's created events (excluding system-created events)
    createdEvents.forEach(e => {
      if (e.creatorId !== 'system-myzymo-user') {
        eventMap.set(e.id, e);
      }
    });
    
    // Add events where user is participant (excluding system-created events)
    participantEvents.forEach(e => {
      if (e.id && e.creatorId !== 'system-myzymo-user') {
        eventMap.set(e.id, e as Event);
      }
    });
    
    return Array.from(eventMap.values()).sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  async getAllEventsForUser(userId: string): Promise<Event[]> {
    // Get events created by user AND all events user has joined
    // This is used for Events page and DashboardChat
    const createdEvents = await db.select().from(events).where(eq(events.creatorId, userId));
    
    const participantEvents = await db
      .select({
        id: events.id,
        title: events.title,
        description: events.description,
        date: events.date,
        location: events.location,
        imageUrl: events.imageUrl,
        creatorId: events.creatorId,
        createdAt: events.createdAt,
        updatedAt: events.updatedAt,
      })
      .from(eventParticipants)
      .where(eq(eventParticipants.userId, userId))
      .leftJoin(events, eq(eventParticipants.eventId, events.id));
    
    const eventMap = new Map<string, Event>();
    
    // Add user's created events (excluding system-created to avoid duplication)
    createdEvents.forEach(e => {
      if (e.creatorId !== 'system-myzymo-user') {
        eventMap.set(e.id, e);
      }
    });
    
    // Add ALL events where user is a participant (including sample events and invited events)
    // This allows users to see events they've joined via invite links
    participantEvents.forEach(e => {
      if (e.id) {
        eventMap.set(e.id, e as Event);
      }
    });
    
    return Array.from(eventMap.values()).sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  async canUserAccessEvent(userId: string, eventId: string): Promise<boolean> {
    const event = await this.getEvent(eventId);
    if (!event) return false;
    
    if (event.creatorId === userId) return true;
    
    // Check if user is already a participant
    const [participant] = await db
      .select()
      .from(eventParticipants)
      .where(and(eq(eventParticipants.eventId, eventId), eq(eventParticipants.userId, userId)));
    
    if (participant) return true;
    
    // Auto-enroll user to sample events (system-created events)
    if (event.creatorId === 'system-myzymo-user') {
      try {
        await db.insert(eventParticipants).values({
          eventId,
          userId,
          status: 'going',
        }).onConflictDoNothing();
        console.log('[Storage] Auto-enrolled user', userId, 'to sample event:', eventId);
        return true;
      } catch (error) {
        console.error('[Storage] Error auto-enrolling user to sample event:', error);
        // Even if enrollment fails, allow access to sample events
        return true;
      }
    }
    
    return false;
  }

  // Message methods
  async getEventMessages(eventId: string): Promise<(Message & { sender: User })[]> {
    const results = await db
      .select()
      .from(messages)
      .where(eq(messages.eventId, eventId))
      .leftJoin(users, eq(messages.senderId, users.id))
      .orderBy(messages.createdAt);
    
    // SECURITY: Sanitize user objects before returning
    return results.map(r => ({
      ...r.messages,
      sender: sanitizeUser(r.users!),
    }));
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const [result] = await db.insert(messages).values(message).returning();
    return result;
  }

  // Direct Message methods
  async getDirectMessagesWithUser(userId: string, otherUserId: string): Promise<(DirectMessage & { sender: User, recipient: User })[]> {
    const results = await db
      .select()
      .from(directMessages)
      .where(
        sql`(${directMessages.senderId} = ${userId} AND ${directMessages.recipientId} = ${otherUserId}) OR (${directMessages.senderId} = ${otherUserId} AND ${directMessages.recipientId} = ${userId})`
      )
      .leftJoin(users, eq(directMessages.senderId, users.id))
      .orderBy(directMessages.createdAt);
    
    // Also fetch recipient info
    const messagesWithUsers = await Promise.all(
      results.map(async (r) => {
        const recipient = await db.select().from(users).where(eq(users.id, r.direct_messages.recipientId)).limit(1);
        // SECURITY: Sanitize user objects before returning
        return {
          ...r.direct_messages,
          sender: sanitizeUser(r.users!),
          recipient: sanitizeUser(recipient[0]!),
        };
      })
    );
    
    return messagesWithUsers;
  }

  async getUserConversationsList(userId: string): Promise<{userId: string, user: User, lastMessage: DirectMessage | null, unreadCount: number}[]> {
    // Get all unique users this user has messaged with
    const sentMessages = await db
      .selectDistinct({ userId: directMessages.recipientId })
      .from(directMessages)
      .where(eq(directMessages.senderId, userId));
    
    const receivedMessages = await db
      .selectDistinct({ userId: directMessages.senderId })
      .from(directMessages)
      .where(eq(directMessages.recipientId, userId));
    
    const uniqueUserIds = new Set<string>();
    sentMessages.forEach(m => uniqueUserIds.add(m.userId));
    receivedMessages.forEach(m => uniqueUserIds.add(m.userId));
    
    // For each unique user, get their info, last message, and unread count
    const conversations = await Promise.all(
      Array.from(uniqueUserIds).map(async (otherUserId) => {
        const [user] = await db.select().from(users).where(eq(users.id, otherUserId));
        
        // Get last message between these two users
        const [lastMessage] = await db
          .select()
          .from(directMessages)
          .where(
            sql`(${directMessages.senderId} = ${userId} AND ${directMessages.recipientId} = ${otherUserId}) OR (${directMessages.senderId} = ${otherUserId} AND ${directMessages.recipientId} = ${userId})`
          )
          .orderBy(desc(directMessages.createdAt))
          .limit(1);
        
        // Get unread count (messages sent to me that I haven't read)
        const unreadCount = await db
          .select({ count: sql<number>`count(*)` })
          .from(directMessages)
          .where(
            and(
              eq(directMessages.recipientId, userId),
              eq(directMessages.senderId, otherUserId),
              eq(directMessages.isRead, false)
            )
          );
        
        // SECURITY: Sanitize user object before returning
        return {
          userId: otherUserId,
          user: sanitizeUser(user!),
          lastMessage: lastMessage || null,
          unreadCount: Number(unreadCount[0]?.count || 0),
        };
      })
    );
    
    // Sort by last message time (most recent first)
    return conversations.sort((a, b) => {
      const aTime = a.lastMessage?.createdAt?.getTime() || 0;
      const bTime = b.lastMessage?.createdAt?.getTime() || 0;
      return bTime - aTime;
    });
  }

  async createDirectMessage(message: InsertDirectMessage): Promise<DirectMessage> {
    const [result] = await db.insert(directMessages).values(message).returning();
    return result;
  }

  async markDirectMessagesAsRead(userId: string, senderId: string): Promise<void> {
    await db
      .update(directMessages)
      .set({ isRead: true })
      .where(
        and(
          eq(directMessages.recipientId, userId),
          eq(directMessages.senderId, senderId),
          eq(directMessages.isRead, false)
        )
      );
  }

  // Expense methods
  async getEventExpenses(eventId: string): Promise<(Expense & { paidBy: User, splits: (ExpenseSplit & { user: User })[] })[]> {
    const expensesList = await db
      .select()
      .from(expenses)
      .where(eq(expenses.eventId, eventId))
      .leftJoin(users, eq(expenses.paidById, users.id))
      .orderBy(desc(expenses.createdAt));
    
    const results = await Promise.all(
      expensesList.map(async (exp) => {
        const splits = await db
          .select()
          .from(expenseSplits)
          .where(eq(expenseSplits.expenseId, exp.expenses.id))
          .leftJoin(users, eq(expenseSplits.userId, users.id));
        
        // SECURITY: Sanitize user objects before returning
        return {
          ...exp.expenses,
          paidBy: sanitizeUser(exp.users!),
          splits: splits.map(s => ({
            ...s.expense_splits,
            user: sanitizeUser(s.users!),
          })),
        };
      })
    );
    
    return results;
  }

  async createExpense(expense: InsertExpense): Promise<Expense> {
    const [result] = await db.insert(expenses).values(expense).returning();
    return result;
  }

  async createExpenseSplit(split: InsertExpenseSplit): Promise<ExpenseSplit> {
    const [result] = await db.insert(expenseSplits).values(split).returning();
    return result;
  }

  async getExpenseSplit(id: string): Promise<(ExpenseSplit & { expense: Expense }) | undefined> {
    const [result] = await db
      .select()
      .from(expenseSplits)
      .where(eq(expenseSplits.id, id))
      .leftJoin(expenses, eq(expenseSplits.expenseId, expenses.id));
    
    if (!result) return undefined;
    
    return {
      ...result.expense_splits,
      expense: result.expenses!,
    };
  }

  async updateExpenseSplitPayment(id: string, isPaid: boolean): Promise<void> {
    await db.update(expenseSplits).set({ isPaid }).where(eq(expenseSplits.id, id));
  }

  // Vendor methods
  async getAllVendors(): Promise<Vendor[]> {
    return await db.select().from(vendors).orderBy(desc(vendors.rating));
  }

  async getVendorsByCategory(category: string): Promise<Vendor[]> {
    return await db.select().from(vendors).where(eq(vendors.category, category)).orderBy(desc(vendors.rating));
  }

  async getVendor(id: string): Promise<Vendor | undefined> {
    const [vendor] = await db.select().from(vendors).where(eq(vendors.id, id));
    return vendor || undefined;
  }

  async getVendorByUserId(userId: string): Promise<Vendor | undefined> {
    const [vendor] = await db.select().from(vendors).where(eq(vendors.userId, userId));
    return vendor || undefined;
  }

  async createVendor(vendor: InsertVendor): Promise<Vendor> {
    const [result] = await db.insert(vendors).values(vendor).returning();
    return result;
  }

  async updateVendor(id: string, vendor: Partial<InsertVendor>): Promise<Vendor | undefined> {
    const [result] = await db
      .update(vendors)
      .set(vendor)
      .where(eq(vendors.id, id))
      .returning();
    return result || undefined;
  }

  async updateVendorApprovalStatus(id: string, status: string): Promise<void> {
    await db
      .update(vendors)
      .set({ approvalStatus: status })
      .where(eq(vendors.id, id));
  }

  async deleteVendor(id: string): Promise<void> {
    await db.delete(vendors).where(eq(vendors.id, id));
  }

  // Booking methods
  async getAllBookings(): Promise<Booking[]> {
    return await db.select().from(bookings).orderBy(desc(bookings.createdAt));
  }

  async getEventBookings(eventId: string): Promise<(Booking & { vendor: Vendor })[]> {
    const results = await db
      .select()
      .from(bookings)
      .where(eq(bookings.eventId, eventId))
      .leftJoin(vendors, eq(bookings.vendorId, vendors.id))
      .orderBy(desc(bookings.createdAt));
    
    return results.map(r => ({
      ...r.bookings,
      vendor: r.vendors!,
    }));
  }

  async createBooking(booking: InsertBooking): Promise<Booking> {
    const [result] = await db.insert(bookings).values(booking).returning();
    return result;
  }

  async updateBookingStatus(id: string, status: string): Promise<void> {
    await db.update(bookings).set({ status }).where(eq(bookings.id, id));
  }

  // AI Conversation methods
  async getUserConversations(userId: string): Promise<AiConversation[]> {
    return await db
      .select()
      .from(aiConversations)
      .where(eq(aiConversations.userId, userId))
      .orderBy(desc(aiConversations.updatedAt));
  }

  async getConversation(id: string): Promise<AiConversation | undefined> {
    const [conversation] = await db
      .select()
      .from(aiConversations)
      .where(eq(aiConversations.id, id));
    return conversation || undefined;
  }

  async createConversation(conversation: InsertAiConversation): Promise<AiConversation> {
    const [result] = await db.insert(aiConversations).values(conversation).returning();
    return result;
  }

  async updateConversationTitle(id: string, title: string): Promise<void> {
    await db
      .update(aiConversations)
      .set({ title, updatedAt: new Date() })
      .where(eq(aiConversations.id, id));
  }

  async deleteConversation(id: string): Promise<void> {
    await db.delete(aiConversations).where(eq(aiConversations.id, id));
  }

  // AI Message methods
  async getConversationMessages(conversationId: string): Promise<AiMessage[]> {
    return await db
      .select()
      .from(aiMessages)
      .where(eq(aiMessages.conversationId, conversationId))
      .orderBy(aiMessages.createdAt);
  }

  async createAiMessage(message: InsertAiMessage): Promise<AiMessage> {
    const [result] = await db.insert(aiMessages).values(message).returning();
    
    // Update conversation's updatedAt timestamp
    await db
      .update(aiConversations)
      .set({ updatedAt: new Date() })
      .where(eq(aiConversations.id, message.conversationId));
    
    return result;
  }

  // Quote methods
  async createQuote(quote: InsertQuote): Promise<Quote> {
    const [result] = await db.insert(quotes).values(quote).returning();
    return result;
  }

  async getQuote(id: string): Promise<Quote | undefined> {
    const [quote] = await db.select().from(quotes).where(eq(quotes.id, id));
    return quote || undefined;
  }

  async getQuotesByUser(userId: string): Promise<Quote[]> {
    return await db
      .select()
      .from(quotes)
      .where(eq(quotes.userId, userId))
      .orderBy(desc(quotes.createdAt));
  }

  async updateQuoteOwner(id: string, userId: string): Promise<Quote | undefined> {
    const [result] = await db
      .update(quotes)
      .set({ userId, status: 'saved', updatedAt: new Date() })
      .where(eq(quotes.id, id))
      .returning();
    return result || undefined;
  }

  async updateQuoteStatus(id: string, status: string): Promise<Quote | undefined> {
    const [result] = await db
      .update(quotes)
      .set({ status, updatedAt: new Date() })
      .where(eq(quotes.id, id))
      .returning();
    return result || undefined;
  }
}

export const storage = new DatabaseStorage();

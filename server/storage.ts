import { 
  users, events, eventParticipants, messages, expenses, expenseSplits, vendors, bookings,
  aiConversations, aiMessages,
  type User, type UpsertUser,
  type Event, type InsertEvent,
  type EventParticipant, type InsertEventParticipant,
  type Message, type InsertMessage,
  type Expense, type InsertExpense,
  type ExpenseSplit, type InsertExpenseSplit,
  type Vendor, type InsertVendor,
  type Booking, type InsertBooking,
  type AiConversation, type InsertAiConversation,
  type AiMessage, type InsertAiMessage,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql } from "drizzle-orm";

export interface IStorage {
  // User methods (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserProfile(userId: string, profileData: Partial<User>): Promise<User>;
  
  // Event methods
  getEvent(id: string): Promise<Event | undefined>;
  getAllEvents(): Promise<Event[]>;
  getEventsByUser(userId: string): Promise<Event[]>;
  createEvent(event: InsertEvent): Promise<Event>;
  updateEvent(id: string, event: Partial<InsertEvent>): Promise<Event | undefined>;
  deleteEvent(id: string): Promise<void>;
  
  // Event participant methods
  getEventParticipants(eventId: string): Promise<(EventParticipant & { user: User })[]>;
  addEventParticipant(participant: InsertEventParticipant): Promise<EventParticipant>;
  removeEventParticipant(eventId: string, userId: string): Promise<void>;
  getUserEvents(userId: string): Promise<(EventParticipant & { event: Event })[]>;
  getUserAccessibleEvents(userId: string): Promise<Event[]>;
  canUserAccessEvent(userId: string, eventId: string): Promise<boolean>;
  
  // Message methods
  getEventMessages(eventId: string): Promise<(Message & { sender: User })[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  
  // Expense methods
  getEventExpenses(eventId: string): Promise<(Expense & { paidBy: User, splits: (ExpenseSplit & { user: User })[] })[]>;
  createExpense(expense: InsertExpense): Promise<Expense>;
  createExpenseSplit(split: InsertExpenseSplit): Promise<ExpenseSplit>;
  updateExpenseSplitPayment(id: string, isPaid: boolean): Promise<void>;
  
  // Vendor methods
  getAllVendors(): Promise<Vendor[]>;
  getVendorsByCategory(category: string): Promise<Vendor[]>;
  getVendor(id: string): Promise<Vendor | undefined>;
  createVendor(vendor: InsertVendor): Promise<Vendor>;
  
  // Booking methods
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
}

export class DatabaseStorage implements IStorage {
  // User methods (required for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
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
    
    return user;
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
    return user;
  }

  // Event methods
  async getEvent(id: string): Promise<Event | undefined> {
    const [event] = await db.select().from(events).where(eq(events.id, id));
    return event || undefined;
  }

  async getAllEvents(): Promise<Event[]> {
    return await db.select().from(events).orderBy(desc(events.date));
  }

  async getEventsByUser(userId: string): Promise<Event[]> {
    return await db.select().from(events).where(eq(events.creatorId, userId)).orderBy(desc(events.date));
  }

  async createEvent(insertEvent: InsertEvent): Promise<Event> {
    const [event] = await db.insert(events).values(insertEvent).returning();
    return event;
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
    
    return results.map(r => ({
      ...r.event_participants,
      user: r.users!,
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
    
    // Add user's created events
    createdEvents.forEach(e => eventMap.set(e.id, e));
    
    // Add events where user is participant, but EXCLUDE sample events (system-created)
    participantEvents.forEach(e => {
      if (e.id && e.creatorId !== 'system-myzymo-user') {
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
    
    return results.map(r => ({
      ...r.messages,
      sender: r.users!,
    }));
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const [result] = await db.insert(messages).values(message).returning();
    return result;
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
        
        return {
          ...exp.expenses,
          paidBy: exp.users!,
          splits: splits.map(s => ({
            ...s.expense_splits,
            user: s.users!,
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

  async createVendor(vendor: InsertVendor): Promise<Vendor> {
    const [result] = await db.insert(vendors).values(vendor).returning();
    return result;
  }

  // Booking methods
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
}

export const storage = new DatabaseStorage();

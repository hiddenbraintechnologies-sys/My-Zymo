import { 
  users, events, eventParticipants, messages, expenses, expenseSplits, vendors, bookings,
  type User, type UpsertUser,
  type Event, type InsertEvent,
  type EventParticipant, type InsertEventParticipant,
  type Message, type InsertMessage,
  type Expense, type InsertExpense,
  type ExpenseSplit, type InsertExpenseSplit,
  type Vendor, type InsertVendor,
  type Booking, type InsertBooking,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql } from "drizzle-orm";

export interface IStorage {
  // User methods (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Event methods
  getEvent(id: string): Promise<Event | undefined>;
  getEventsByUser(userId: string): Promise<Event[]>;
  createEvent(event: InsertEvent): Promise<Event>;
  updateEvent(id: string, event: Partial<InsertEvent>): Promise<Event | undefined>;
  deleteEvent(id: string): Promise<void>;
  
  // Event participant methods
  getEventParticipants(eventId: string): Promise<(EventParticipant & { user: User })[]>;
  addEventParticipant(participant: InsertEventParticipant): Promise<EventParticipant>;
  removeEventParticipant(eventId: string, userId: string): Promise<void>;
  getUserEvents(userId: string): Promise<(EventParticipant & { event: Event })[]>;
  
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
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.email,
        set: {
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          profileImageUrl: userData.profileImageUrl,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Event methods
  async getEvent(id: string): Promise<Event | undefined> {
    const [event] = await db.select().from(events).where(eq(events.id, id));
    return event || undefined;
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
}

export const storage = new DatabaseStorage();

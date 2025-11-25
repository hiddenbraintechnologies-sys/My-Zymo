import { 
  users, events, eventParticipants, messages, directMessages, expenses, expenseSplits, vendors, bookings,
  aiConversations, aiMessages, quotes, userFollowedEvents,
  groupChats, groupChatMembers, groupMessages,
  eventGroups, eventGroupMembers, groupInvitations, groupPolls, groupPollOptions, groupPollVotes,
  groupItineraryItems, eventPhotos, vendorShortlist, eventGroupMessages, groupExpenses, groupExpenseSplits, eventFeedback,
  type User, type UpsertUser,
  type Event, type InsertEvent,
  type EventParticipant, type InsertEventParticipant,
  type Message, type InsertMessage,
  type DirectMessage, type InsertDirectMessage,
  type GroupChat, type InsertGroupChat,
  type GroupChatMember, type InsertGroupChatMember,
  type GroupMessage, type InsertGroupMessage,
  type Expense, type InsertExpense,
  type ExpenseSplit, type InsertExpenseSplit,
  type Vendor, type InsertVendor,
  type Booking, type InsertBooking,
  type AiConversation, type InsertAiConversation,
  type AiMessage, type InsertAiMessage,
  type Quote, type InsertQuote,
  type EventGroup, type InsertEventGroup,
  type EventGroupMember, type InsertEventGroupMember,
  type GroupInvitation, type InsertGroupInvitation,
  type GroupPoll, type InsertGroupPoll,
  type GroupPollOption, type InsertGroupPollOption,
  type GroupPollVote, type InsertGroupPollVote,
  type GroupItineraryItem, type InsertGroupItineraryItem,
  type EventPhoto, type InsertEventPhoto,
  type VendorShortlist, type InsertVendorShortlist,
  type EventGroupMessage, type InsertEventGroupMessage,
  type GroupExpense, type InsertGroupExpense,
  type GroupExpenseSplit, type InsertGroupExpenseSplit,
  type EventFeedback, type InsertEventFeedback,
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
  
  // Group Chat methods
  createGroupChat(groupChat: InsertGroupChat): Promise<GroupChat>;
  getGroupChat(id: string): Promise<GroupChat | undefined>;
  getUserGroupChats(userId: string): Promise<(GroupChat & { memberCount: number, lastMessage: GroupMessage | null })[]>;
  updateGroupChat(id: string, data: Partial<InsertGroupChat>): Promise<GroupChat | undefined>;
  deleteGroupChat(id: string): Promise<void>;
  
  // Group Chat Member methods
  addGroupChatMember(member: InsertGroupChatMember): Promise<GroupChatMember>;
  removeGroupChatMember(groupId: string, userId: string): Promise<void>;
  getGroupChatMembers(groupId: string): Promise<(GroupChatMember & { user: User })[]>;
  isUserGroupMember(groupId: string, userId: string): Promise<boolean>;
  updateGroupMemberRole(groupId: string, userId: string, role: string): Promise<void>;
  
  // Group Message methods
  getGroupMessages(groupId: string): Promise<(GroupMessage & { sender: User })[]>;
  createGroupMessage(message: InsertGroupMessage): Promise<GroupMessage>;
  
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
  
  // Event Group (Planning Group) methods
  createEventGroup(data: InsertEventGroup): Promise<EventGroup>;
  getEventGroup(id: string): Promise<EventGroup | undefined>;
  getUserEventGroups(userId: string): Promise<(EventGroup & { memberCount: number })[]>;
  updateEventGroup(id: string, data: Partial<InsertEventGroup>): Promise<EventGroup | undefined>;
  deleteEventGroup(id: string): Promise<void>;
  getEventGroupByInviteCode(code: string): Promise<EventGroup | undefined>;
  
  // Event Group Member methods
  addEventGroupMember(member: InsertEventGroupMember): Promise<EventGroupMember>;
  removeEventGroupMember(groupId: string, userId: string): Promise<void>;
  getEventGroupMembers(groupId: string): Promise<(EventGroupMember & { user: User })[]>;
  isUserEventGroupMember(groupId: string, userId: string): Promise<boolean>;
  updateEventGroupMemberRole(groupId: string, userId: string, role: string, planningRole?: string): Promise<void>;
  updateMemberAttendance(groupId: string, userId: string, status: string): Promise<void>;
  
  // Group Invitation methods
  createGroupInvitation(invitation: InsertGroupInvitation): Promise<GroupInvitation>;
  getGroupInvitations(groupId: string): Promise<GroupInvitation[]>;
  getInvitationByCode(code: string): Promise<GroupInvitation | undefined>;
  acceptGroupInvitation(code: string, userId: string): Promise<void>;
  cancelGroupInvitation(id: string): Promise<void>;
  
  // Group Poll methods
  createGroupPoll(poll: InsertGroupPoll, options: string[]): Promise<GroupPoll>;
  getGroupPolls(groupId: string): Promise<(GroupPoll & { options: GroupPollOption[], votes: GroupPollVote[] })[]>;
  getPoll(id: string): Promise<(GroupPoll & { options: GroupPollOption[], votes: GroupPollVote[] }) | undefined>;
  voteOnPoll(pollId: string, optionId: string, userId: string): Promise<void>;
  closePoll(pollId: string, finalizedOptionId?: string): Promise<void>;
  
  // Group Itinerary methods
  createItineraryItem(item: InsertGroupItineraryItem): Promise<GroupItineraryItem>;
  getGroupItinerary(groupId: string): Promise<(GroupItineraryItem & { assignedTo: User | null })[]>;
  updateItineraryItem(id: string, data: Partial<InsertGroupItineraryItem>): Promise<GroupItineraryItem | undefined>;
  deleteItineraryItem(id: string): Promise<void>;
  
  // Event Photo methods
  uploadEventPhoto(photo: InsertEventPhoto): Promise<EventPhoto>;
  getEventPhotos(groupId: string): Promise<(EventPhoto & { uploadedBy: User })[]>;
  deleteEventPhoto(id: string): Promise<void>;
  
  // Vendor Shortlist methods
  addToVendorShortlist(item: InsertVendorShortlist): Promise<VendorShortlist>;
  getVendorShortlist(groupId: string): Promise<(VendorShortlist & { vendor: Vendor, addedBy: User })[]>;
  voteForVendor(shortlistId: string): Promise<void>;
  removeFromVendorShortlist(id: string): Promise<void>;
  
  // Event Group Message methods
  getEventGroupMessages(groupId: string): Promise<(EventGroupMessage & { sender: User })[]>;
  createEventGroupMessage(message: InsertEventGroupMessage): Promise<EventGroupMessage>;
  
  // Group Expense methods
  createGroupExpense(expense: InsertGroupExpense, splits: { userId: string; amount: string; percentage?: string }[]): Promise<GroupExpense>;
  getGroupExpenses(groupId: string): Promise<(GroupExpense & { paidBy: User, splits: (GroupExpenseSplit & { user: User })[] })[]>;
  markExpenseSplitPaid(splitId: string, paymentMethod: string, paymentReference?: string): Promise<void>;
  getGroupExpenseSummary(groupId: string): Promise<{ totalExpenses: number; perPersonBalance: Record<string, number> }>;
  
  // Event Feedback methods
  submitEventFeedback(feedback: InsertEventFeedback): Promise<EventFeedback>;
  getEventFeedback(groupId: string): Promise<(EventFeedback & { user: User })[]>;
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

  // Group Chat methods
  async createGroupChat(groupChatData: InsertGroupChat): Promise<GroupChat> {
    const [result] = await db.insert(groupChats).values(groupChatData).returning();
    
    // Auto-add creator as admin member
    await db.insert(groupChatMembers).values({
      groupId: result.id,
      userId: groupChatData.createdById,
      role: 'admin',
    });
    
    return result;
  }

  async getGroupChat(id: string): Promise<GroupChat | undefined> {
    const [groupChat] = await db.select().from(groupChats).where(eq(groupChats.id, id));
    return groupChat || undefined;
  }

  async getUserGroupChats(userId: string): Promise<(GroupChat & { memberCount: number, lastMessage: GroupMessage | null })[]> {
    // Get all group IDs where user is a member
    const memberships = await db
      .select({ groupId: groupChatMembers.groupId })
      .from(groupChatMembers)
      .where(eq(groupChatMembers.userId, userId));
    
    const groupIds = memberships.map(m => m.groupId);
    
    if (groupIds.length === 0) return [];
    
    const results = await Promise.all(
      groupIds.map(async (groupId) => {
        const [groupChat] = await db.select().from(groupChats).where(eq(groupChats.id, groupId));
        
        if (!groupChat) return null;
        
        // Get member count
        const memberCountResult = await db
          .select({ count: sql<number>`count(*)` })
          .from(groupChatMembers)
          .where(eq(groupChatMembers.groupId, groupId));
        
        // Get last message
        const [lastMessage] = await db
          .select()
          .from(groupMessages)
          .where(eq(groupMessages.groupId, groupId))
          .orderBy(desc(groupMessages.createdAt))
          .limit(1);
        
        return {
          ...groupChat,
          memberCount: Number(memberCountResult[0]?.count || 0),
          lastMessage: lastMessage || null,
        };
      })
    );
    
    return results.filter((g): g is NonNullable<typeof g> => g !== null)
      .sort((a, b) => {
        const aTime = a.lastMessage?.createdAt?.getTime() || a.createdAt.getTime();
        const bTime = b.lastMessage?.createdAt?.getTime() || b.createdAt.getTime();
        return bTime - aTime;
      });
  }

  async updateGroupChat(id: string, data: Partial<InsertGroupChat>): Promise<GroupChat | undefined> {
    const [result] = await db
      .update(groupChats)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(groupChats.id, id))
      .returning();
    return result || undefined;
  }

  async deleteGroupChat(id: string): Promise<void> {
    await db.delete(groupChats).where(eq(groupChats.id, id));
  }

  // Group Chat Member methods
  async addGroupChatMember(member: InsertGroupChatMember): Promise<GroupChatMember> {
    const [result] = await db.insert(groupChatMembers).values(member).returning();
    return result;
  }

  async removeGroupChatMember(groupId: string, userId: string): Promise<void> {
    await db
      .delete(groupChatMembers)
      .where(and(eq(groupChatMembers.groupId, groupId), eq(groupChatMembers.userId, userId)));
  }

  async getGroupChatMembers(groupId: string): Promise<(GroupChatMember & { user: User })[]> {
    const results = await db
      .select()
      .from(groupChatMembers)
      .where(eq(groupChatMembers.groupId, groupId))
      .leftJoin(users, eq(groupChatMembers.userId, users.id));
    
    return results.map(r => ({
      ...r.group_chat_members,
      user: sanitizeUser(r.users!),
    }));
  }

  async isUserGroupMember(groupId: string, userId: string): Promise<boolean> {
    const [member] = await db
      .select()
      .from(groupChatMembers)
      .where(and(eq(groupChatMembers.groupId, groupId), eq(groupChatMembers.userId, userId)))
      .limit(1);
    return !!member;
  }

  async updateGroupMemberRole(groupId: string, userId: string, role: string): Promise<void> {
    await db
      .update(groupChatMembers)
      .set({ role })
      .where(and(eq(groupChatMembers.groupId, groupId), eq(groupChatMembers.userId, userId)));
  }

  // Group Message methods
  async getGroupMessages(groupId: string): Promise<(GroupMessage & { sender: User })[]> {
    const results = await db
      .select()
      .from(groupMessages)
      .where(eq(groupMessages.groupId, groupId))
      .leftJoin(users, eq(groupMessages.senderId, users.id))
      .orderBy(groupMessages.createdAt);
    
    return results.map(r => ({
      ...r.group_messages,
      sender: sanitizeUser(r.users!),
    }));
  }

  async createGroupMessage(message: InsertGroupMessage): Promise<GroupMessage> {
    const [result] = await db.insert(groupMessages).values(message).returning();
    
    // Update group's updatedAt timestamp
    await db
      .update(groupChats)
      .set({ updatedAt: new Date() })
      .where(eq(groupChats.id, message.groupId));
    
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

  // ============================================
  // EVENT GROUP (PLANNING GROUP) METHODS
  // ============================================
  
  async createEventGroup(data: InsertEventGroup): Promise<EventGroup> {
    const inviteCode = this.generateInviteCode();
    const [result] = await db.insert(eventGroups).values({
      ...data,
      inviteCode,
    }).returning();
    
    await db.insert(eventGroupMembers).values({
      groupId: result.id,
      userId: data.createdById,
      role: 'host',
      status: 'active',
    });
    
    return result;
  }
  
  private generateInviteCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }
  
  async getEventGroup(id: string): Promise<EventGroup | undefined> {
    const [group] = await db.select().from(eventGroups).where(eq(eventGroups.id, id));
    return group || undefined;
  }
  
  async getUserEventGroups(userId: string): Promise<(EventGroup & { memberCount: number })[]> {
    const memberships = await db
      .select({ groupId: eventGroupMembers.groupId })
      .from(eventGroupMembers)
      .where(eq(eventGroupMembers.userId, userId));
    
    const groupIds = memberships.map(m => m.groupId);
    
    if (groupIds.length === 0) return [];
    
    const results = await Promise.all(
      groupIds.map(async (groupId) => {
        const [group] = await db.select().from(eventGroups).where(eq(eventGroups.id, groupId));
        if (!group) return null;
        
        const memberCountResult = await db
          .select({ count: sql<number>`count(*)` })
          .from(eventGroupMembers)
          .where(eq(eventGroupMembers.groupId, groupId));
        
        return {
          ...group,
          memberCount: Number(memberCountResult[0]?.count || 0),
        };
      })
    );
    
    return results.filter((g): g is NonNullable<typeof g> => g !== null)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  
  async updateEventGroup(id: string, data: Partial<InsertEventGroup>): Promise<EventGroup | undefined> {
    const [result] = await db
      .update(eventGroups)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(eventGroups.id, id))
      .returning();
    return result || undefined;
  }
  
  async deleteEventGroup(id: string): Promise<void> {
    await db.delete(eventGroups).where(eq(eventGroups.id, id));
  }
  
  async getEventGroupByInviteCode(code: string): Promise<EventGroup | undefined> {
    const [group] = await db.select().from(eventGroups).where(eq(eventGroups.inviteCode, code));
    return group || undefined;
  }
  
  // Event Group Member methods
  async addEventGroupMember(member: InsertEventGroupMember): Promise<EventGroupMember> {
    const [result] = await db.insert(eventGroupMembers).values(member).returning();
    return result;
  }
  
  async removeEventGroupMember(groupId: string, userId: string): Promise<void> {
    await db.delete(eventGroupMembers)
      .where(and(eq(eventGroupMembers.groupId, groupId), eq(eventGroupMembers.userId, userId)));
  }
  
  async getEventGroupMembers(groupId: string): Promise<(EventGroupMember & { user: User })[]> {
    const members = await db.select().from(eventGroupMembers).where(eq(eventGroupMembers.groupId, groupId));
    
    return Promise.all(
      members.map(async (member) => {
        const [user] = await db.select().from(users).where(eq(users.id, member.userId));
        return { ...member, user: sanitizeUser(user) };
      })
    );
  }
  
  async isUserEventGroupMember(groupId: string, userId: string): Promise<boolean> {
    const [member] = await db.select().from(eventGroupMembers)
      .where(and(eq(eventGroupMembers.groupId, groupId), eq(eventGroupMembers.userId, userId)));
    return !!member;
  }
  
  async updateEventGroupMemberRole(groupId: string, userId: string, role: string, planningRole?: string): Promise<void> {
    await db.update(eventGroupMembers)
      .set({ role, planningRole })
      .where(and(eq(eventGroupMembers.groupId, groupId), eq(eventGroupMembers.userId, userId)));
  }
  
  async updateMemberAttendance(groupId: string, userId: string, status: string): Promise<void> {
    await db.update(eventGroupMembers)
      .set({ attendanceStatus: status })
      .where(and(eq(eventGroupMembers.groupId, groupId), eq(eventGroupMembers.userId, userId)));
  }
  
  // Group Invitation methods
  async createGroupInvitation(invitation: InsertGroupInvitation): Promise<GroupInvitation> {
    const [result] = await db.insert(groupInvitations).values(invitation).returning();
    return result;
  }
  
  async getGroupInvitations(groupId: string): Promise<GroupInvitation[]> {
    return db.select().from(groupInvitations).where(eq(groupInvitations.groupId, groupId));
  }
  
  async getInvitationByCode(code: string): Promise<GroupInvitation | undefined> {
    const [invitation] = await db.select().from(groupInvitations).where(eq(groupInvitations.inviteCode, code));
    return invitation || undefined;
  }
  
  async acceptGroupInvitation(code: string, userId: string): Promise<void> {
    const invitation = await this.getInvitationByCode(code);
    if (!invitation) throw new Error('Invitation not found');
    
    await db.update(groupInvitations)
      .set({ status: 'accepted', acceptedAt: new Date(), acceptedByUserId: userId })
      .where(eq(groupInvitations.inviteCode, code));
    
    const existingMember = await this.isUserEventGroupMember(invitation.groupId, userId);
    if (!existingMember) {
      await this.addEventGroupMember({
        groupId: invitation.groupId,
        userId,
        role: 'member',
        status: 'active',
      });
    }
  }
  
  async cancelGroupInvitation(id: string): Promise<void> {
    await db.update(groupInvitations)
      .set({ status: 'cancelled' })
      .where(eq(groupInvitations.id, id));
  }
  
  // Group Poll methods
  async createGroupPoll(poll: InsertGroupPoll, options: string[]): Promise<GroupPoll> {
    const [createdPoll] = await db.insert(groupPolls).values(poll).returning();
    
    for (const optionText of options) {
      await db.insert(groupPollOptions).values({
        pollId: createdPoll.id,
        optionText,
      });
    }
    
    return createdPoll;
  }
  
  async getGroupPolls(groupId: string): Promise<(GroupPoll & { options: GroupPollOption[], votes: GroupPollVote[] })[]> {
    const polls = await db.select().from(groupPolls)
      .where(eq(groupPolls.groupId, groupId))
      .orderBy(desc(groupPolls.createdAt));
    
    return Promise.all(
      polls.map(async (poll) => {
        const options = await db.select().from(groupPollOptions).where(eq(groupPollOptions.pollId, poll.id));
        const votes = await db.select().from(groupPollVotes).where(eq(groupPollVotes.pollId, poll.id));
        return { ...poll, options, votes };
      })
    );
  }
  
  async getPoll(id: string): Promise<(GroupPoll & { options: GroupPollOption[], votes: GroupPollVote[] }) | undefined> {
    const [poll] = await db.select().from(groupPolls).where(eq(groupPolls.id, id));
    if (!poll) return undefined;
    
    const options = await db.select().from(groupPollOptions).where(eq(groupPollOptions.pollId, id));
    const votes = await db.select().from(groupPollVotes).where(eq(groupPollVotes.pollId, id));
    
    return { ...poll, options, votes };
  }
  
  async voteOnPoll(pollId: string, optionId: string, userId: string): Promise<void> {
    const poll = await this.getPoll(pollId);
    if (!poll || poll.status !== 'active') throw new Error('Poll not available for voting');
    
    if (!poll.allowMultiple) {
      await db.delete(groupPollVotes)
        .where(and(eq(groupPollVotes.pollId, pollId), eq(groupPollVotes.userId, userId)));
    }
    
    await db.insert(groupPollVotes).values({ pollId, optionId, userId });
    
    await db.update(groupPollOptions)
      .set({ voteCount: sql`vote_count + 1` })
      .where(eq(groupPollOptions.id, optionId));
  }
  
  async closePoll(pollId: string, finalizedOptionId?: string): Promise<void> {
    await db.update(groupPolls)
      .set({ status: 'closed', closedAt: new Date(), finalizedOptionId })
      .where(eq(groupPolls.id, pollId));
  }
  
  // Group Itinerary methods
  async createItineraryItem(item: InsertGroupItineraryItem): Promise<GroupItineraryItem> {
    const [result] = await db.insert(groupItineraryItems).values(item).returning();
    return result;
  }
  
  async getGroupItinerary(groupId: string): Promise<(GroupItineraryItem & { assignedTo: User | null })[]> {
    const items = await db.select().from(groupItineraryItems)
      .where(eq(groupItineraryItems.groupId, groupId))
      .orderBy(groupItineraryItems.sortOrder, groupItineraryItems.startTime);
    
    return Promise.all(
      items.map(async (item) => {
        let assignedTo: User | null = null;
        if (item.assignedToId) {
          const [user] = await db.select().from(users).where(eq(users.id, item.assignedToId));
          assignedTo = user ? sanitizeUser(user) : null;
        }
        return { ...item, assignedTo };
      })
    );
  }
  
  async updateItineraryItem(id: string, data: Partial<InsertGroupItineraryItem>): Promise<GroupItineraryItem | undefined> {
    const [result] = await db.update(groupItineraryItems)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(groupItineraryItems.id, id))
      .returning();
    return result || undefined;
  }
  
  async deleteItineraryItem(id: string): Promise<void> {
    await db.delete(groupItineraryItems).where(eq(groupItineraryItems.id, id));
  }
  
  // Event Photo methods
  async uploadEventPhoto(photo: InsertEventPhoto): Promise<EventPhoto> {
    const [result] = await db.insert(eventPhotos).values(photo).returning();
    return result;
  }
  
  async getEventPhotos(groupId: string): Promise<(EventPhoto & { uploadedBy: User })[]> {
    const photos = await db.select().from(eventPhotos)
      .where(eq(eventPhotos.groupId, groupId))
      .orderBy(desc(eventPhotos.createdAt));
    
    return Promise.all(
      photos.map(async (photo) => {
        const [user] = await db.select().from(users).where(eq(users.id, photo.uploadedById));
        return { ...photo, uploadedBy: sanitizeUser(user) };
      })
    );
  }
  
  async deleteEventPhoto(id: string): Promise<void> {
    await db.delete(eventPhotos).where(eq(eventPhotos.id, id));
  }
  
  // Vendor Shortlist methods
  async addToVendorShortlist(item: InsertVendorShortlist): Promise<VendorShortlist> {
    const [result] = await db.insert(vendorShortlist).values(item).returning();
    return result;
  }
  
  async getVendorShortlist(groupId: string): Promise<(VendorShortlist & { vendor: Vendor, addedBy: User })[]> {
    const items = await db.select().from(vendorShortlist).where(eq(vendorShortlist.groupId, groupId));
    
    return Promise.all(
      items.map(async (item) => {
        const [vendor] = await db.select().from(vendors).where(eq(vendors.id, item.vendorId));
        const [addedBy] = await db.select().from(users).where(eq(users.id, item.addedById));
        return { ...item, vendor, addedBy: sanitizeUser(addedBy) };
      })
    );
  }
  
  async voteForVendor(shortlistId: string): Promise<void> {
    await db.update(vendorShortlist)
      .set({ voteCount: sql`vote_count + 1` })
      .where(eq(vendorShortlist.id, shortlistId));
  }
  
  async removeFromVendorShortlist(id: string): Promise<void> {
    await db.delete(vendorShortlist).where(eq(vendorShortlist.id, id));
  }
  
  // Event Group Message methods
  async getEventGroupMessages(groupId: string): Promise<(EventGroupMessage & { sender: User })[]> {
    const msgs = await db.select().from(eventGroupMessages)
      .where(eq(eventGroupMessages.groupId, groupId))
      .orderBy(eventGroupMessages.createdAt);
    
    return Promise.all(
      msgs.map(async (msg) => {
        const [sender] = await db.select().from(users).where(eq(users.id, msg.senderId));
        return { ...msg, sender: sanitizeUser(sender) };
      })
    );
  }
  
  async createEventGroupMessage(message: InsertEventGroupMessage): Promise<EventGroupMessage> {
    const [result] = await db.insert(eventGroupMessages).values(message).returning();
    return result;
  }
  
  // Group Expense methods
  async createGroupExpense(expense: InsertGroupExpense, splits: { userId: string; amount: string; percentage?: string }[]): Promise<GroupExpense> {
    const [createdExpense] = await db.insert(groupExpenses).values(expense).returning();
    
    for (const split of splits) {
      await db.insert(groupExpenseSplits).values({
        expenseId: createdExpense.id,
        userId: split.userId,
        amount: split.amount,
        percentage: split.percentage,
      });
    }
    
    return createdExpense;
  }
  
  async getGroupExpenses(groupId: string): Promise<(GroupExpense & { paidBy: User, splits: (GroupExpenseSplit & { user: User })[] })[]> {
    const expenseList = await db.select().from(groupExpenses)
      .where(eq(groupExpenses.groupId, groupId))
      .orderBy(desc(groupExpenses.createdAt));
    
    return Promise.all(
      expenseList.map(async (expense) => {
        const [paidBy] = await db.select().from(users).where(eq(users.id, expense.paidById));
        const splits = await db.select().from(groupExpenseSplits).where(eq(groupExpenseSplits.expenseId, expense.id));
        
        const splitsWithUsers = await Promise.all(
          splits.map(async (split) => {
            const [user] = await db.select().from(users).where(eq(users.id, split.userId));
            return { ...split, user: sanitizeUser(user) };
          })
        );
        
        return { ...expense, paidBy: sanitizeUser(paidBy), splits: splitsWithUsers };
      })
    );
  }
  
  async markExpenseSplitPaid(splitId: string, paymentMethod: string, paymentReference?: string): Promise<void> {
    await db.update(groupExpenseSplits)
      .set({ isPaid: true, paidAt: new Date(), paymentMethod, paymentReference })
      .where(eq(groupExpenseSplits.id, splitId));
  }
  
  async getGroupExpenseSummary(groupId: string): Promise<{ totalExpenses: number; perPersonBalance: Record<string, number> }> {
    const expenses = await this.getGroupExpenses(groupId);
    
    let totalExpenses = 0;
    const balances: Record<string, number> = {};
    
    for (const expense of expenses) {
      totalExpenses += parseFloat(expense.amount);
      
      balances[expense.paidById] = (balances[expense.paidById] || 0) + parseFloat(expense.amount);
      
      for (const split of expense.splits) {
        balances[split.userId] = (balances[split.userId] || 0) - parseFloat(split.amount);
      }
    }
    
    return { totalExpenses, perPersonBalance: balances };
  }
  
  // Event Feedback methods
  async submitEventFeedback(feedback: InsertEventFeedback): Promise<EventFeedback> {
    const [result] = await db.insert(eventFeedback).values(feedback).returning();
    return result;
  }
  
  async getEventFeedback(groupId: string): Promise<(EventFeedback & { user: User })[]> {
    const feedbackList = await db.select().from(eventFeedback).where(eq(eventFeedback.groupId, groupId));
    
    return Promise.all(
      feedbackList.map(async (fb) => {
        const [user] = await db.select().from(users).where(eq(users.id, fb.userId));
        return { ...fb, user: sanitizeUser(user) };
      })
    );
  }
}

export const storage = new DatabaseStorage();

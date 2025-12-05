import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean, jsonb, decimal, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table - required for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Users table - supports both custom auth (username/password) and social auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull().default(sql`gen_random_uuid()`),
  username: varchar("username").unique(), // For custom auth
  password: varchar("password"), // Hashed password for custom auth (null for social auth users)
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  role: text("role").notNull().default("user"), // user, master_user, admin, super_admin
  profileImageUrl: varchar("profile_image_url"),
  
  // OAuth provider fields
  provider: varchar("provider"), // 'local', 'google', 'facebook', 'twitter'
  providerId: varchar("provider_id"), // Unique ID from the OAuth provider
  
  // User profile fields
  age: integer("age"),
  dateOfBirth: timestamp("date_of_birth"),
  phone: varchar("phone"),
  bio: text("bio"),
  college: varchar("college"),
  graduationYear: integer("graduation_year"),
  degree: varchar("degree"),
  currentCity: varchar("current_city"),
  profession: varchar("profession"),
  company: varchar("company"),
  
  // Online presence fields
  isOnline: boolean("is_online").notNull().default(false),
  lastSeen: timestamp("last_seen"),
  
  // Event preferences for personalized experience
  eventPreferences: text("event_preferences").array(), // ['group_planning', 'private_events', 'public_events']
  onboardingCompleted: boolean("onboarding_completed").notNull().default(false),
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
  createdEvents: many(events),
  eventParticipations: many(eventParticipants),
  messages: many(messages),
  expenses: many(expenses),
  bookings: many(bookings),
  aiConversations: many(aiConversations),
}));

// Events table
export const events = pgTable("events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  date: timestamp("date").notNull(),
  location: text("location").notNull(),
  imageUrl: text("image_url"),
  invitationCardUrl: text("invitation_card_url"), // AI-generated or template-based invitation card
  isPublic: boolean("is_public").notNull().default(false), // false = private, true = public
  creatorId: varchar("creator_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const eventsRelations = relations(events, ({ one, many }) => ({
  creator: one(users, {
    fields: [events.creatorId],
    references: [users.id],
  }),
  participants: many(eventParticipants),
  messages: many(messages),
  expenses: many(expenses),
  bookings: many(bookings),
}));

// Event Participants table (many-to-many)
export const eventParticipants = pgTable("event_participants", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  eventId: varchar("event_id").notNull().references(() => events.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  status: text("status").notNull().default("going"), // going, maybe, declined
  joinedAt: timestamp("joined_at").notNull().defaultNow(),
});

export const eventParticipantsRelations = relations(eventParticipants, ({ one }) => ({
  event: one(events, {
    fields: [eventParticipants.eventId],
    references: [events.id],
  }),
  user: one(users, {
    fields: [eventParticipants.userId],
    references: [users.id],
  }),
}));

// User Followed Events table (for tracking which public events users want to see)
export const userFollowedEvents = pgTable("user_followed_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  eventId: varchar("event_id").notNull().references(() => events.id, { onDelete: "cascade" }),
  followedAt: timestamp("followed_at").notNull().defaultNow(),
});

export const userFollowedEventsRelations = relations(userFollowedEvents, ({ one }) => ({
  user: one(users, {
    fields: [userFollowedEvents.userId],
    references: [users.id],
  }),
  event: one(events, {
    fields: [userFollowedEvents.eventId],
    references: [events.id],
  }),
}));

// Messages table (for event chat)
export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  eventId: varchar("event_id").notNull().references(() => events.id, { onDelete: "cascade" }),
  senderId: varchar("sender_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  fileUrl: text("file_url"),
  fileName: text("file_name"),
  fileSize: integer("file_size"),
  fileType: text("file_type"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const messagesRelations = relations(messages, ({ one }) => ({
  event: one(events, {
    fields: [messages.eventId],
    references: [events.id],
  }),
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
  }),
}));

// Direct Messages table (for private 1-on-1 conversations)
export const directMessages = pgTable("direct_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  senderId: varchar("sender_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  recipientId: varchar("recipient_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  isRead: boolean("is_read").notNull().default(false),
  isEdited: boolean("is_edited").notNull().default(false),
  editedAt: timestamp("edited_at"),
  fileUrl: text("file_url"),
  fileName: text("file_name"),
  fileSize: integer("file_size"),
  fileType: text("file_type"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const directMessagesRelations = relations(directMessages, ({ one }) => ({
  sender: one(users, {
    fields: [directMessages.senderId],
    references: [users.id],
  }),
  recipient: one(users, {
    fields: [directMessages.recipientId],
    references: [users.id],
  }),
}));

// Group Chats table
export const groupChats = pgTable("group_chats", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  createdById: varchar("created_by_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const groupChatsRelations = relations(groupChats, ({ one, many }) => ({
  createdBy: one(users, {
    fields: [groupChats.createdById],
    references: [users.id],
  }),
  members: many(groupChatMembers),
  messages: many(groupMessages),
}));

// Group Chat Members table
export const groupChatMembers = pgTable("group_chat_members", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  groupId: varchar("group_id").notNull().references(() => groupChats.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  role: text("role").notNull().default("member"), // admin, member
  joinedAt: timestamp("joined_at").notNull().defaultNow(),
});

export const groupChatMembersRelations = relations(groupChatMembers, ({ one }) => ({
  group: one(groupChats, {
    fields: [groupChatMembers.groupId],
    references: [groupChats.id],
  }),
  user: one(users, {
    fields: [groupChatMembers.userId],
    references: [users.id],
  }),
}));

// Group Messages table
export const groupMessages = pgTable("group_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  groupId: varchar("group_id").notNull().references(() => groupChats.id, { onDelete: "cascade" }),
  senderId: varchar("sender_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  isEdited: boolean("is_edited").notNull().default(false),
  editedAt: timestamp("edited_at"),
  fileUrl: text("file_url"),
  fileName: text("file_name"),
  fileSize: integer("file_size"),
  fileType: text("file_type"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const groupMessagesRelations = relations(groupMessages, ({ one }) => ({
  group: one(groupChats, {
    fields: [groupMessages.groupId],
    references: [groupChats.id],
  }),
  sender: one(users, {
    fields: [groupMessages.senderId],
    references: [users.id],
  }),
}));

// Chat Invites table - for sharing chat invite links
export const chatInvites = pgTable("chat_invites", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  inviteCode: varchar("invite_code").notNull().unique(),
  inviteType: text("invite_type").notNull(), // 'direct' for direct message, 'group' for group chat
  creatorId: varchar("creator_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  groupChatId: varchar("group_chat_id").references(() => groupChats.id, { onDelete: "cascade" }), // Only for group invites
  message: text("message"), // Optional custom message for the invite
  expiresAt: timestamp("expires_at"),
  maxUses: integer("max_uses"), // Optional limit on how many times the invite can be used
  useCount: integer("use_count").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const chatInvitesRelations = relations(chatInvites, ({ one }) => ({
  creator: one(users, {
    fields: [chatInvites.creatorId],
    references: [users.id],
  }),
  groupChat: one(groupChats, {
    fields: [chatInvites.groupChatId],
    references: [groupChats.id],
  }),
}));

export const insertChatInviteSchema = createInsertSchema(chatInvites).omit({
  id: true,
  createdAt: true,
  useCount: true,
});

export type InsertChatInvite = z.infer<typeof insertChatInviteSchema>;
export type ChatInvite = typeof chatInvites.$inferSelect;

// Expenses table
export const expenses = pgTable("expenses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  eventId: varchar("event_id").notNull().references(() => events.id, { onDelete: "cascade" }),
  description: text("description").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  paidById: varchar("paid_by_id").notNull().references(() => users.id),
  splitAmong: integer("split_among").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const expensesRelations = relations(expenses, ({ one, many }) => ({
  event: one(events, {
    fields: [expenses.eventId],
    references: [events.id],
  }),
  paidBy: one(users, {
    fields: [expenses.paidById],
    references: [users.id],
  }),
  splits: many(expenseSplits),
}));

// Expense Splits table
export const expenseSplits = pgTable("expense_splits", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  expenseId: varchar("expense_id").notNull().references(() => expenses.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  isPaid: boolean("is_paid").notNull().default(false),
});

export const expenseSplitsRelations = relations(expenseSplits, ({ one }) => ({
  expense: one(expenses, {
    fields: [expenseSplits.expenseId],
    references: [expenses.id],
  }),
  user: one(users, {
    fields: [expenseSplits.userId],
    references: [users.id],
  }),
}));

// Vendors table
export const vendors = pgTable("vendors", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id), // Link to vendor user account
  name: text("name").notNull(),
  category: text("category").notNull(), // venue, catering, photography, decoration
  description: text("description"),
  imageUrl: text("image_url"),
  location: text("location").notNull(),
  priceRange: text("price_range").notNull(),
  rating: decimal("rating", { precision: 2, scale: 1 }).notNull().default("0"),
  reviewCount: integer("review_count").notNull().default(0),
  responseTime: text("response_time").notNull().default("24 hours"),
  approvalStatus: text("approval_status").notNull().default("pending"), // pending, approved, rejected
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const vendorsRelations = relations(vendors, ({ one, many }) => ({
  user: one(users, {
    fields: [vendors.userId],
    references: [users.id],
  }),
  bookings: many(bookings),
}));

// Bookings table
export const bookings = pgTable("bookings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  eventId: varchar("event_id").notNull().references(() => events.id, { onDelete: "cascade" }),
  vendorId: varchar("vendor_id").notNull().references(() => vendors.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  status: text("status").notNull().default("pending"), // pending, confirmed, cancelled
  message: text("message"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const bookingsRelations = relations(bookings, ({ one }) => ({
  event: one(events, {
    fields: [bookings.eventId],
    references: [events.id],
  }),
  vendor: one(vendors, {
    fields: [bookings.vendorId],
    references: [vendors.id],
  }),
  user: one(users, {
    fields: [bookings.userId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertEventSchema = createInsertSchema(events).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertEventParticipantSchema = createInsertSchema(eventParticipants).omit({
  id: true,
  joinedAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
});

export const insertDirectMessageSchema = createInsertSchema(directMessages).omit({
  id: true,
  createdAt: true,
  isRead: true,
});

export const insertGroupChatSchema = createInsertSchema(groupChats).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertGroupChatMemberSchema = createInsertSchema(groupChatMembers).omit({
  id: true,
  joinedAt: true,
});

export const insertGroupMessageSchema = createInsertSchema(groupMessages).omit({
  id: true,
  createdAt: true,
});

export const insertExpenseSchema = createInsertSchema(expenses).omit({
  id: true,
  createdAt: true,
});

export const insertExpenseSplitSchema = createInsertSchema(expenseSplits).omit({
  id: true,
});

export const insertVendorSchema = createInsertSchema(vendors).omit({
  id: true,
  createdAt: true,
});

export const insertBookingSchema = createInsertSchema(bookings).omit({
  id: true,
  createdAt: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export const updateProfileSchema = z.object({
  firstName: z.string().min(1, "First name is required").optional(),
  lastName: z.string().min(1, "Last name is required").optional(),
  profileImageUrl: z.string().optional().nullable().refine(
    (val) => {
      if (!val) return true; // Allow empty/null
      
      // Allow HTTP(S) URLs
      if (val.startsWith('http://') || val.startsWith('https://')) {
        try {
          new URL(val);
          return true;
        } catch {
          return false;
        }
      }
      
      // Allow data URLs but check size (max ~3.5MB base64 = ~2.6MB file)
      if (val.startsWith('data:image/')) {
        const base64Data = val.split(',')[1];
        if (base64Data && base64Data.length > 3500000) {
          return false; // Too large
        }
        return true;
      }
      
      return false; // Invalid format
    },
    {
      message: "Profile image must be a valid URL or image data under 2.5MB",
    }
  ),
  age: z.number().min(1).max(150).optional().nullable(),
  dateOfBirth: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  bio: z.string().max(500).optional().nullable(),
  college: z.string().optional().nullable(),
  graduationYear: z.number().min(1950).max(2030).optional().nullable(),
  degree: z.string().optional().nullable(),
  currentCity: z.string().optional().nullable(),
  profession: z.string().optional().nullable(),
  company: z.string().optional().nullable(),
  eventPreferences: z.array(z.enum(["group_planning", "private_events", "public_events"])).optional().nullable(),
  onboardingCompleted: z.boolean().optional(),
});

export const updateEventPreferencesSchema = z.object({
  eventPreferences: z.array(z.enum(["group_planning", "private_events", "public_events"])),
  onboardingCompleted: z.boolean().optional(),
});

export type UpdateProfile = z.infer<typeof updateProfileSchema>;

export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Event = typeof events.$inferSelect;

export type InsertEventParticipant = z.infer<typeof insertEventParticipantSchema>;
export type EventParticipant = typeof eventParticipants.$inferSelect;

export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;

export type InsertDirectMessage = z.infer<typeof insertDirectMessageSchema>;
export type DirectMessage = typeof directMessages.$inferSelect;

export type InsertGroupChat = z.infer<typeof insertGroupChatSchema>;
export type GroupChat = typeof groupChats.$inferSelect;

export type InsertGroupChatMember = z.infer<typeof insertGroupChatMemberSchema>;
export type GroupChatMember = typeof groupChatMembers.$inferSelect;

export type InsertGroupMessage = z.infer<typeof insertGroupMessageSchema>;
export type GroupMessage = typeof groupMessages.$inferSelect;

export type InsertExpense = z.infer<typeof insertExpenseSchema>;
export type Expense = typeof expenses.$inferSelect;

export type InsertExpenseSplit = z.infer<typeof insertExpenseSplitSchema>;
export type ExpenseSplit = typeof expenseSplits.$inferSelect;

export type InsertVendor = z.infer<typeof insertVendorSchema>;
export type Vendor = typeof vendors.$inferSelect;

export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type Booking = typeof bookings.$inferSelect;

// AI Conversations table
export const aiConversations = pgTable("ai_conversations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull().default("New Chat"),
  isOnboarding: boolean("is_onboarding").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const aiConversationsRelations = relations(aiConversations, ({ one, many }) => ({
  user: one(users, {
    fields: [aiConversations.userId],
    references: [users.id],
  }),
  messages: many(aiMessages),
}));

// AI Messages table
export const aiMessages = pgTable("ai_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  conversationId: varchar("conversation_id").notNull().references(() => aiConversations.id, { onDelete: "cascade" }),
  role: text("role").notNull(), // user or assistant
  content: text("content").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const aiMessagesRelations = relations(aiMessages, ({ one }) => ({
  conversation: one(aiConversations, {
    fields: [aiMessages.conversationId],
    references: [aiConversations.id],
  }),
}));

// WebAuthn Credentials table (for biometric authentication)
export const webauthnCredentials = pgTable("webauthn_credentials", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  credentialId: text("credential_id").notNull().unique(),
  publicKey: text("public_key").notNull(),
  counter: integer("counter").notNull().default(0),
  transports: jsonb("transports"), // USB, NFC, BLE, internal
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const webauthnCredentialsRelations = relations(webauthnCredentials, ({ one }) => ({
  user: one(users, {
    fields: [webauthnCredentials.userId],
    references: [users.id],
  }),
}));

// Quotes table (for event cost estimation)
export const quotes = pgTable("quotes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }), // Null for guest submissions
  guestName: varchar("guest_name").notNull(),
  email: varchar("email").notNull(),
  phone: varchar("phone").notNull(),
  eventType: text("event_type").notNull(),
  eventDateTime: timestamp("event_date_time").notNull(),
  locationCity: varchar("location_city").notNull(),
  locationState: varchar("location_state"),
  guestCount: integer("guest_count"),
  estimateJson: jsonb("estimate_json"), // Stores AI-generated estimation details
  status: text("status").notNull().default("draft"), // draft, saved
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const quotesRelations = relations(quotes, ({ one }) => ({
  user: one(users, {
    fields: [quotes.userId],
    references: [users.id],
  }),
}));

// Insert schemas for AI tables
export const insertAiConversationSchema = createInsertSchema(aiConversations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAiMessageSchema = createInsertSchema(aiMessages).omit({
  id: true,
  createdAt: true,
});

// Insert schema for WebAuthn credentials
export const insertWebAuthnCredentialSchema = createInsertSchema(webauthnCredentials).omit({
  id: true,
  createdAt: true,
});

// Types for AI tables
export type InsertAiConversation = z.infer<typeof insertAiConversationSchema>;
export type AiConversation = typeof aiConversations.$inferSelect;

export type InsertAiMessage = z.infer<typeof insertAiMessageSchema>;
export type AiMessage = typeof aiMessages.$inferSelect;

// Types for WebAuthn
export type InsertWebAuthnCredential = z.infer<typeof insertWebAuthnCredentialSchema>;
export type WebAuthnCredential = typeof webauthnCredentials.$inferSelect;

// Insert schema for quotes
export const insertQuoteSchema = createInsertSchema(quotes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  eventDateTime: z.coerce.date(),
  guestCount: z.coerce.number().min(1).optional(),
});

// Types for quotes
export type InsertQuote = z.infer<typeof insertQuoteSchema>;
export type Quote = typeof quotes.$inferSelect;

// ============================================
// GROUP PLANNING TABLES
// ============================================

// Event Planning Groups table - Enhanced groups linked to events
export const eventGroups = pgTable("event_groups", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  bannerImageUrl: text("banner_image_url"), // Custom banner image uploaded by user
  themeColor: text("theme_color"), // Custom theme color (hex or gradient name)
  eventType: text("event_type").notNull(), // reunion, birthday, wedding, family_meet, corporate, other
  eventDate: timestamp("event_date"),
  locationCity: text("location_city"),
  locationPreference: text("location_preference"), // indoor, outdoor, both
  budget: decimal("budget", { precision: 12, scale: 2 }),
  inviteCode: varchar("invite_code").unique(), // Unique invite code for sharing
  qrCodeUrl: text("qr_code_url"), // QR code image URL
  eventId: varchar("event_id").references(() => events.id, { onDelete: "set null" }), // Link to created event
  createdById: varchar("created_by_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  status: text("status").notNull().default("planning"), // planning, finalized, completed, cancelled
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const eventGroupsRelations = relations(eventGroups, ({ one, many }) => ({
  createdBy: one(users, {
    fields: [eventGroups.createdById],
    references: [users.id],
  }),
  event: one(events, {
    fields: [eventGroups.eventId],
    references: [events.id],
  }),
  members: many(eventGroupMembers),
  polls: many(groupPolls),
  itineraryItems: many(groupItineraryItems),
  invitations: many(groupInvitations),
  photos: many(eventPhotos),
  shortlistedVendors: many(vendorShortlist),
  groupMessages: many(eventGroupMessages),
}));

// Event Group Members table with enhanced roles
export const eventGroupMembers = pgTable("event_group_members", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  groupId: varchar("group_id").notNull().references(() => eventGroups.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  role: text("role").notNull().default("member"), // host, admin, member
  planningRole: text("planning_role"), // treasurer, planner, venue_manager, food_manager, transport_manager, photographer
  status: text("status").notNull().default("active"), // active, invited, left
  attendanceStatus: text("attendance_status"), // confirmed, maybe, declined, attended
  joinedAt: timestamp("joined_at").notNull().defaultNow(),
});

export const eventGroupMembersRelations = relations(eventGroupMembers, ({ one }) => ({
  group: one(eventGroups, {
    fields: [eventGroupMembers.groupId],
    references: [eventGroups.id],
  }),
  user: one(users, {
    fields: [eventGroupMembers.userId],
    references: [users.id],
  }),
}));

// Group Invitations table
export const groupInvitations = pgTable("group_invitations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  groupId: varchar("group_id").notNull().references(() => eventGroups.id, { onDelete: "cascade" }),
  invitedById: varchar("invited_by_id").notNull().references(() => users.id),
  inviteeEmail: text("invitee_email"),
  inviteePhone: text("invitee_phone"),
  inviteCode: varchar("invite_code").notNull().unique(),
  inviteType: text("invite_type").notNull().default("link"), // link, email, sms, whatsapp, qr
  status: text("status").notNull().default("pending"), // pending, accepted, expired, cancelled
  expiresAt: timestamp("expires_at"),
  acceptedAt: timestamp("accepted_at"),
  acceptedByUserId: varchar("accepted_by_user_id").references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const groupInvitationsRelations = relations(groupInvitations, ({ one }) => ({
  group: one(eventGroups, {
    fields: [groupInvitations.groupId],
    references: [eventGroups.id],
  }),
  invitedBy: one(users, {
    fields: [groupInvitations.invitedById],
    references: [users.id],
    relationName: "invitedBy",
  }),
  acceptedBy: one(users, {
    fields: [groupInvitations.acceptedByUserId],
    references: [users.id],
    relationName: "acceptedBy",
  }),
}));

// Group Polls table
export const groupPolls = pgTable("group_polls", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  groupId: varchar("group_id").notNull().references(() => eventGroups.id, { onDelete: "cascade" }),
  createdById: varchar("created_by_id").notNull().references(() => users.id),
  question: text("question").notNull(),
  pollType: text("poll_type").notNull().default("single"), // single, multiple, date, budget, venue
  allowMultiple: boolean("allow_multiple").notNull().default(false),
  isAnonymous: boolean("is_anonymous").notNull().default(false),
  status: text("status").notNull().default("active"), // active, closed, finalized
  finalizedOptionId: varchar("finalized_option_id"),
  endsAt: timestamp("ends_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  closedAt: timestamp("closed_at"),
});

export const groupPollsRelations = relations(groupPolls, ({ one, many }) => ({
  group: one(eventGroups, {
    fields: [groupPolls.groupId],
    references: [eventGroups.id],
  }),
  createdBy: one(users, {
    fields: [groupPolls.createdById],
    references: [users.id],
  }),
  options: many(groupPollOptions),
  votes: many(groupPollVotes),
}));

// Group Poll Options table
export const groupPollOptions = pgTable("group_poll_options", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  pollId: varchar("poll_id").notNull().references(() => groupPolls.id, { onDelete: "cascade" }),
  optionText: text("option_text").notNull(),
  optionValue: text("option_value"), // For date/budget polls, stores the actual value
  voteCount: integer("vote_count").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const groupPollOptionsRelations = relations(groupPollOptions, ({ one, many }) => ({
  poll: one(groupPolls, {
    fields: [groupPollOptions.pollId],
    references: [groupPolls.id],
  }),
  votes: many(groupPollVotes),
}));

// Group Poll Votes table
export const groupPollVotes = pgTable("group_poll_votes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  pollId: varchar("poll_id").notNull().references(() => groupPolls.id, { onDelete: "cascade" }),
  optionId: varchar("option_id").notNull().references(() => groupPollOptions.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const groupPollVotesRelations = relations(groupPollVotes, ({ one }) => ({
  poll: one(groupPolls, {
    fields: [groupPollVotes.pollId],
    references: [groupPolls.id],
  }),
  option: one(groupPollOptions, {
    fields: [groupPollVotes.optionId],
    references: [groupPollOptions.id],
  }),
  user: one(users, {
    fields: [groupPollVotes.userId],
    references: [users.id],
  }),
}));

// Itinerary category to vendor category mapping
export const ITINERARY_VENDOR_MAPPING: Record<string, string> = {
  // Food related
  "breakfast": "catering",
  "lunch": "catering",
  "dinner": "catering",
  "snacks": "catering",
  "tea": "catering",
  "food": "catering",
  "catering": "catering",
  // Venue related
  "venue": "venue",
  "ceremony": "venue",
  "reception": "venue",
  "meeting": "venue",
  "conference": "venue",
  // Transport related
  "transport": "transport",
  "travel": "transport",
  "pickup": "transport",
  "drop": "transport",
  "ride": "transport",
  // Photography related
  "photography": "photography",
  "photo": "photography",
  "videography": "photography",
  "video": "photography",
  // Decoration related
  "decoration": "decoration",
  "decor": "decoration",
  "setup": "decoration",
  "flowers": "decoration",
  // Entertainment
  "entertainment": "entertainment",
  "music": "entertainment",
  "dj": "entertainment",
  "band": "entertainment",
  "games": "entertainment",
  "activity": "entertainment",
};

// Group Itinerary Items table
export const groupItineraryItems = pgTable("group_itinerary_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  groupId: varchar("group_id").notNull().references(() => eventGroups.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  category: text("category"), // breakfast, lunch, dinner, venue, transport, photography, decoration, entertainment, other
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time"),
  location: text("location"),
  assignedToId: varchar("assigned_to_id").references(() => users.id),
  bookedVendorId: varchar("booked_vendor_id").references(() => vendors.id),
  status: text("status").notNull().default("scheduled"), // scheduled, in_progress, completed, cancelled
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const groupItineraryItemsRelations = relations(groupItineraryItems, ({ one }) => ({
  group: one(eventGroups, {
    fields: [groupItineraryItems.groupId],
    references: [eventGroups.id],
  }),
  assignedTo: one(users, {
    fields: [groupItineraryItems.assignedToId],
    references: [users.id],
  }),
  bookedVendor: one(vendors, {
    fields: [groupItineraryItems.bookedVendorId],
    references: [vendors.id],
  }),
}));

// Event Photos table (gallery)
export const eventPhotos = pgTable("event_photos", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  groupId: varchar("group_id").notNull().references(() => eventGroups.id, { onDelete: "cascade" }),
  uploadedById: varchar("uploaded_by_id").notNull().references(() => users.id),
  imageUrl: text("image_url").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  caption: text("caption"),
  isAlbumCover: boolean("is_album_cover").notNull().default(false),
  photoType: text("photo_type").notNull().default("event"), // event, planning, memory
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const eventPhotosRelations = relations(eventPhotos, ({ one }) => ({
  group: one(eventGroups, {
    fields: [eventPhotos.groupId],
    references: [eventGroups.id],
  }),
  uploadedBy: one(users, {
    fields: [eventPhotos.uploadedById],
    references: [users.id],
  }),
}));

// Vendor Shortlist table (for group vendor voting)
export const vendorShortlist = pgTable("vendor_shortlist", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  groupId: varchar("group_id").notNull().references(() => eventGroups.id, { onDelete: "cascade" }),
  vendorId: varchar("vendor_id").notNull().references(() => vendors.id, { onDelete: "cascade" }),
  addedById: varchar("added_by_id").notNull().references(() => users.id),
  notes: text("notes"),
  status: text("status").notNull().default("shortlisted"), // shortlisted, voted, selected, rejected
  voteCount: integer("vote_count").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const vendorShortlistRelations = relations(vendorShortlist, ({ one }) => ({
  group: one(eventGroups, {
    fields: [vendorShortlist.groupId],
    references: [eventGroups.id],
  }),
  vendor: one(vendors, {
    fields: [vendorShortlist.vendorId],
    references: [vendors.id],
  }),
  addedBy: one(users, {
    fields: [vendorShortlist.addedById],
    references: [users.id],
  }),
}));

// Event Group Messages table (separate from groupChats for planning-specific chat)
export const eventGroupMessages = pgTable("event_group_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  groupId: varchar("group_id").notNull().references(() => eventGroups.id, { onDelete: "cascade" }),
  senderId: varchar("sender_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  content: text("content"),
  isEdited: boolean("is_edited").notNull().default(false),
  editedAt: timestamp("edited_at"),
  fileUrl: text("file_url"),
  fileName: text("file_name"),
  fileSize: integer("file_size"),
  fileType: text("file_type"),
  messageType: text("message_type").notNull().default("text"), // text, file, image, video, system
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const eventGroupMessagesRelations = relations(eventGroupMessages, ({ one }) => ({
  group: one(eventGroups, {
    fields: [eventGroupMessages.groupId],
    references: [eventGroups.id],
  }),
  sender: one(users, {
    fields: [eventGroupMessages.senderId],
    references: [users.id],
  }),
}));

// Group Expenses table (enhanced expense tracking for groups)
export const groupExpenses = pgTable("group_expenses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  groupId: varchar("group_id").notNull().references(() => eventGroups.id, { onDelete: "cascade" }),
  description: text("description").notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  category: text("category").notNull().default("general"), // venue, food, decoration, transport, entertainment, other
  paidById: varchar("paid_by_id").notNull().references(() => users.id),
  splitType: text("split_type").notNull().default("equal"), // equal, custom, percentage
  receiptUrl: text("receipt_url"),
  isSettled: boolean("is_settled").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  settledAt: timestamp("settled_at"),
});

export const groupExpensesRelations = relations(groupExpenses, ({ one, many }) => ({
  group: one(eventGroups, {
    fields: [groupExpenses.groupId],
    references: [eventGroups.id],
  }),
  paidBy: one(users, {
    fields: [groupExpenses.paidById],
    references: [users.id],
  }),
  splits: many(groupExpenseSplits),
}));

// Group Expense Splits table
export const groupExpenseSplits = pgTable("group_expense_splits", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  expenseId: varchar("expense_id").notNull().references(() => groupExpenses.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  percentage: decimal("percentage", { precision: 5, scale: 2 }),
  isPaid: boolean("is_paid").notNull().default(false),
  paidAt: timestamp("paid_at"),
  paymentMethod: text("payment_method"), // upi, cash, bank_transfer, wallet
  paymentReference: text("payment_reference"), // UPI transaction ID, etc.
});

export const groupExpenseSplitsRelations = relations(groupExpenseSplits, ({ one }) => ({
  expense: one(groupExpenses, {
    fields: [groupExpenseSplits.expenseId],
    references: [groupExpenses.id],
  }),
  user: one(users, {
    fields: [groupExpenseSplits.userId],
    references: [users.id],
  }),
}));

// Event Feedback table (post-event feedback polls)
export const eventFeedback = pgTable("event_feedback", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  groupId: varchar("group_id").notNull().references(() => eventGroups.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  overallRating: integer("overall_rating"), // 1-5
  venueRating: integer("venue_rating"),
  foodRating: integer("food_rating"),
  organizationRating: integer("organization_rating"),
  comments: text("comments"),
  highlights: text("highlights"), // What they loved
  improvements: text("improvements"), // What could be better
  isAnonymous: boolean("is_anonymous").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const eventFeedbackRelations = relations(eventFeedback, ({ one }) => ({
  group: one(eventGroups, {
    fields: [eventFeedback.groupId],
    references: [eventGroups.id],
  }),
  user: one(users, {
    fields: [eventFeedback.userId],
    references: [users.id],
  }),
}));

// ============================================
// INSERT SCHEMAS FOR GROUP PLANNING
// ============================================

export const insertEventGroupSchema = createInsertSchema(eventGroups).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  inviteCode: true,
  qrCodeUrl: true,
});

export const insertEventGroupMemberSchema = createInsertSchema(eventGroupMembers).omit({
  id: true,
  joinedAt: true,
});

export const insertGroupInvitationSchema = createInsertSchema(groupInvitations).omit({
  id: true,
  createdAt: true,
  acceptedAt: true,
});

export const insertGroupPollSchema = createInsertSchema(groupPolls).omit({
  id: true,
  createdAt: true,
  closedAt: true,
});

export const insertGroupPollOptionSchema = createInsertSchema(groupPollOptions).omit({
  id: true,
  createdAt: true,
  voteCount: true,
});

export const insertGroupPollVoteSchema = createInsertSchema(groupPollVotes).omit({
  id: true,
  createdAt: true,
});

export const insertGroupItineraryItemSchema = createInsertSchema(groupItineraryItems).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertEventPhotoSchema = createInsertSchema(eventPhotos).omit({
  id: true,
  createdAt: true,
});

export const insertVendorShortlistSchema = createInsertSchema(vendorShortlist).omit({
  id: true,
  createdAt: true,
  voteCount: true,
});

export const insertEventGroupMessageSchema = createInsertSchema(eventGroupMessages).omit({
  id: true,
  createdAt: true,
});

export const insertGroupExpenseSchema = createInsertSchema(groupExpenses).omit({
  id: true,
  createdAt: true,
  settledAt: true,
});

export const insertGroupExpenseSplitSchema = createInsertSchema(groupExpenseSplits).omit({
  id: true,
  paidAt: true,
});

export const insertEventFeedbackSchema = createInsertSchema(eventFeedback).omit({
  id: true,
  createdAt: true,
});

// ============================================
// TYPES FOR GROUP PLANNING
// ============================================

export type InsertEventGroup = z.infer<typeof insertEventGroupSchema>;
export type EventGroup = typeof eventGroups.$inferSelect;

export type InsertEventGroupMember = z.infer<typeof insertEventGroupMemberSchema>;
export type EventGroupMember = typeof eventGroupMembers.$inferSelect;

export type InsertGroupInvitation = z.infer<typeof insertGroupInvitationSchema>;
export type GroupInvitation = typeof groupInvitations.$inferSelect;

export type InsertGroupPoll = z.infer<typeof insertGroupPollSchema>;
export type GroupPoll = typeof groupPolls.$inferSelect;

export type InsertGroupPollOption = z.infer<typeof insertGroupPollOptionSchema>;
export type GroupPollOption = typeof groupPollOptions.$inferSelect;

export type InsertGroupPollVote = z.infer<typeof insertGroupPollVoteSchema>;
export type GroupPollVote = typeof groupPollVotes.$inferSelect;

export type InsertGroupItineraryItem = z.infer<typeof insertGroupItineraryItemSchema>;
export type GroupItineraryItem = typeof groupItineraryItems.$inferSelect;

export type InsertEventPhoto = z.infer<typeof insertEventPhotoSchema>;
export type EventPhoto = typeof eventPhotos.$inferSelect;

export type InsertVendorShortlist = z.infer<typeof insertVendorShortlistSchema>;
export type VendorShortlist = typeof vendorShortlist.$inferSelect;

export type InsertEventGroupMessage = z.infer<typeof insertEventGroupMessageSchema>;
export type EventGroupMessage = typeof eventGroupMessages.$inferSelect;

export type InsertGroupExpense = z.infer<typeof insertGroupExpenseSchema>;
export type GroupExpense = typeof groupExpenses.$inferSelect;

export type InsertGroupExpenseSplit = z.infer<typeof insertGroupExpenseSplitSchema>;
export type GroupExpenseSplit = typeof groupExpenseSplits.$inferSelect;

export type InsertEventFeedback = z.infer<typeof insertEventFeedbackSchema>;
export type EventFeedback = typeof eventFeedback.$inferSelect;

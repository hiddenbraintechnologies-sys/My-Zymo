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
  // Expense split settings
  enableExpenseSplit: boolean("enable_expense_split").notNull().default(false),
  expenseSplitType: text("expense_split_type").default("equal"), // equal, percentage, custom
  estimatedBudget: decimal("estimated_budget", { precision: 12, scale: 2 }),
  expenseCategories: jsonb("expense_categories").$type<string[]>(), // Categories like venue, food, decorations
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

// ============================================
// PLANNING GROUPS - Event Planning Workflow
// ============================================

// Planning Groups table - Main group for event planning
export const planningGroups = pgTable("planning_groups", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  eventType: text("event_type").notNull(), // reunion, birthday, wedding, family_meet, etc.
  eventDate: timestamp("event_date"),
  locationPreference: text("location_preference"), // city or venue type preference
  imageUrl: text("image_url"),
  description: text("description"),
  hostId: varchar("host_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  eventId: varchar("event_id").references(() => events.id, { onDelete: "set null" }), // Link to created event
  status: text("status").notNull().default("planning"), // planning, finalized, completed, cancelled
  inviteCode: varchar("invite_code").unique(), // For sharing invite links
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const planningGroupsRelations = relations(planningGroups, ({ one, many }) => ({
  host: one(users, {
    fields: [planningGroups.hostId],
    references: [users.id],
  }),
  event: one(events, {
    fields: [planningGroups.eventId],
    references: [events.id],
  }),
  members: many(planningGroupMembers),
  polls: many(groupPolls),
  itineraryItems: many(itineraryItems),
}));

// Planning Group Members table
export const planningGroupMembers = pgTable("planning_group_members", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  groupId: varchar("group_id").notNull().references(() => planningGroups.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  role: text("role").notNull().default("member"), // host, treasurer, planner, venue_manager, food_manager, transport_manager, member
  roleTitle: text("role_title"), // Custom role title for display
  status: text("status").notNull().default("active"), // active, invited, left
  joinedAt: timestamp("joined_at").notNull().defaultNow(),
});

export const planningGroupMembersRelations = relations(planningGroupMembers, ({ one }) => ({
  group: one(planningGroups, {
    fields: [planningGroupMembers.groupId],
    references: [planningGroups.id],
  }),
  user: one(users, {
    fields: [planningGroupMembers.userId],
    references: [users.id],
  }),
}));

// Planning Group Invites table - For tracking pending invitations
export const planningGroupInvites = pgTable("planning_group_invites", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  groupId: varchar("group_id").notNull().references(() => planningGroups.id, { onDelete: "cascade" }),
  invitedById: varchar("invited_by_id").notNull().references(() => users.id),
  inviteType: text("invite_type").notNull().default("link"), // link, email, phone, qr
  inviteTarget: text("invite_target"), // Email or phone number if specific
  inviteCode: varchar("invite_code").unique().notNull(),
  status: text("status").notNull().default("pending"), // pending, accepted, expired
  expiresAt: timestamp("expires_at"),
  acceptedById: varchar("accepted_by_id").references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const planningGroupInvitesRelations = relations(planningGroupInvites, ({ one }) => ({
  group: one(planningGroups, {
    fields: [planningGroupInvites.groupId],
    references: [planningGroups.id],
  }),
  invitedBy: one(users, {
    fields: [planningGroupInvites.invitedById],
    references: [users.id],
  }),
  acceptedBy: one(users, {
    fields: [planningGroupInvites.acceptedById],
    references: [users.id],
  }),
}));

// Group Polls table - For voting on decisions
export const groupPolls = pgTable("group_polls", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  groupId: varchar("group_id").notNull().references(() => planningGroups.id, { onDelete: "cascade" }),
  createdById: varchar("created_by_id").notNull().references(() => users.id),
  question: text("question").notNull(),
  pollType: text("poll_type").notNull().default("single"), // single, multiple
  category: text("category"), // date, venue, budget, food, other
  isAnonymous: boolean("is_anonymous").notNull().default(false),
  allowAddOptions: boolean("allow_add_options").notNull().default(false),
  status: text("status").notNull().default("active"), // active, closed, decided
  finalDecision: text("final_decision"), // Host's final decision
  endsAt: timestamp("ends_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const groupPollsRelations = relations(groupPolls, ({ one, many }) => ({
  group: one(planningGroups, {
    fields: [groupPolls.groupId],
    references: [planningGroups.id],
  }),
  createdBy: one(users, {
    fields: [groupPolls.createdById],
    references: [users.id],
  }),
  options: many(pollOptions),
  votes: many(pollVotes),
}));

// Poll Options table
export const pollOptions = pgTable("poll_options", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  pollId: varchar("poll_id").notNull().references(() => groupPolls.id, { onDelete: "cascade" }),
  optionText: text("option_text").notNull(),
  addedById: varchar("added_by_id").references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const pollOptionsRelations = relations(pollOptions, ({ one, many }) => ({
  poll: one(groupPolls, {
    fields: [pollOptions.pollId],
    references: [groupPolls.id],
  }),
  addedBy: one(users, {
    fields: [pollOptions.addedById],
    references: [users.id],
  }),
  votes: many(pollVotes),
}));

// Poll Votes table
export const pollVotes = pgTable("poll_votes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  pollId: varchar("poll_id").notNull().references(() => groupPolls.id, { onDelete: "cascade" }),
  optionId: varchar("option_id").notNull().references(() => pollOptions.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const pollVotesRelations = relations(pollVotes, ({ one }) => ({
  poll: one(groupPolls, {
    fields: [pollVotes.pollId],
    references: [groupPolls.id],
  }),
  option: one(pollOptions, {
    fields: [pollVotes.optionId],
    references: [pollOptions.id],
  }),
  user: one(users, {
    fields: [pollVotes.userId],
    references: [users.id],
  }),
}));

// Itinerary Items table - Event schedule/timeline
export const itineraryItems = pgTable("itinerary_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  groupId: varchar("group_id").notNull().references(() => planningGroups.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time"),
  location: text("location"),
  assignedTo: varchar("assigned_to").references(() => users.id),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const itineraryItemsRelations = relations(itineraryItems, ({ one }) => ({
  group: one(planningGroups, {
    fields: [itineraryItems.groupId],
    references: [planningGroups.id],
  }),
  assignee: one(users, {
    fields: [itineraryItems.assignedTo],
    references: [users.id],
  }),
}));

// Vendor Shortlists table - For group vendor voting
export const vendorShortlists = pgTable("vendor_shortlists", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  groupId: varchar("group_id").notNull().references(() => planningGroups.id, { onDelete: "cascade" }),
  vendorId: varchar("vendor_id").notNull().references(() => vendors.id, { onDelete: "cascade" }),
  addedById: varchar("added_by_id").notNull().references(() => users.id),
  notes: text("notes"),
  status: text("status").notNull().default("shortlisted"), // shortlisted, selected, rejected
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const vendorShortlistsRelations = relations(vendorShortlists, ({ one, many }) => ({
  group: one(planningGroups, {
    fields: [vendorShortlists.groupId],
    references: [planningGroups.id],
  }),
  vendor: one(vendors, {
    fields: [vendorShortlists.vendorId],
    references: [vendors.id],
  }),
  addedBy: one(users, {
    fields: [vendorShortlists.addedById],
    references: [users.id],
  }),
  votes: many(vendorShortlistVotes),
}));

// Vendor Shortlist Votes table
export const vendorShortlistVotes = pgTable("vendor_shortlist_votes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  shortlistId: varchar("shortlist_id").notNull().references(() => vendorShortlists.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  voteType: text("vote_type").notNull().default("up"), // up, down
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const vendorShortlistVotesRelations = relations(vendorShortlistVotes, ({ one }) => ({
  shortlist: one(vendorShortlists, {
    fields: [vendorShortlistVotes.shortlistId],
    references: [vendorShortlists.id],
  }),
  user: one(users, {
    fields: [vendorShortlistVotes.userId],
    references: [users.id],
  }),
}));

// ============================================
// END PLANNING GROUPS
// ============================================

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

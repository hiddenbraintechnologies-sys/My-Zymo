import { db } from "./db";
import { events, eventParticipants, users } from "@shared/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;

export async function ensureSuperAdmin() {
  try {
    console.log('[Seed] Checking for super admin user...');
    
    // Check if we already have a super admin
    const superAdmins = await db.select().from(users).where(eq(users.role, 'super_admin')).limit(1);
    if (superAdmins.length > 0) {
      console.log('[Seed] Super admin already exists:', superAdmins[0].email);
      return;
    }

    // Create initial super admin user
    // Require SUPER_ADMIN_PASSWORD environment variable for security
    const password = process.env.SUPER_ADMIN_PASSWORD;
    if (!password) {
      console.error('[Seed] ERROR: SUPER_ADMIN_PASSWORD environment variable is required!');
      console.error('[Seed] Please set SUPER_ADMIN_PASSWORD to create the super admin account.');
      return;
    }
    
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    
    const [superAdmin] = await db.insert(users).values({
      username: 'admin',
      email: 'admin@myzymo.com',
      firstName: 'Super',
      lastName: 'Admin',
      password: hashedPassword,
      role: 'super_admin',
    }).returning();

    console.log('[Seed] Created super admin user:');
    console.log('  Username: admin');
    console.log('  Email: admin@myzymo.com');
    console.log('  ✓ Password set from SUPER_ADMIN_PASSWORD environment variable');
    
  } catch (error) {
    console.error('[Seed] Error creating super admin:', error);
  }
}

export async function seedDefaultEvents() {
  try {
    console.log('[Seed] Checking for existing sample events...');
    
    // Check if we already have the specific sample event (IIT Delhi Reunion)
    const iitEvent = await db.select().from(events).where(eq(events.title, 'IIT Delhi Class of 2015 Reunion')).limit(1);
    if (iitEvent.length > 0) {
      console.log('[Seed] Sample events already exist, skipping seed');
      return;
    }

    // Get the first user to be the creator (or create a system user)
    let systemUser = await db.select().from(users).limit(1);
    
    if (systemUser.length === 0) {
      console.log('[Seed] No users found, creating system user for sample events');
      const [newUser] = await db.insert(users).values({
        id: 'system-myzymo-user',
        email: 'system@myzymo.com',
        firstName: 'Myzymo',
        lastName: 'Team',
      }).returning();
      systemUser = [newUser];
    }

    const creatorId = systemUser[0].id;
    console.log('[Seed] Creating sample events with creator:', creatorId);

    // Sample events for Indian celebrations
    const sampleEvents = [
      {
        title: 'IIT Delhi Class of 2015 Reunion',
        description: 'Reconnect with your batchmates! Join us for a memorable evening of nostalgia, stories, and celebration. Let\'s relive the good old days!',
        date: new Date('2025-12-15T18:00:00'),
        location: 'India Habitat Centre, New Delhi',
        imageUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800',
        creatorId,
      },
      {
        title: 'Rahul\'s 30th Birthday Bash',
        description: 'Join us for an evening of music, dance, and delicious food as we celebrate Rahul turning 30! Dress code: Smart casual',
        date: new Date('2025-11-30T19:00:00'),
        location: 'The Leela Palace, Bangalore',
        imageUrl: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800',
        creatorId,
      },
      {
        title: 'Priya & Arjun\'s Wedding Reception',
        description: 'You are cordially invited to celebrate the union of Priya and Arjun. Join us for an evening of joy, music, and festivities!',
        date: new Date('2025-12-20T18:30:00'),
        location: 'Taj Mahal Palace, Mumbai',
        imageUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800',
        creatorId,
      },
      {
        title: 'Diwali Celebration 2025',
        description: 'Celebrate the festival of lights with friends and family! Traditional food, music, and festivities. Bring your loved ones!',
        date: new Date('2025-11-12T17:00:00'),
        location: 'Community Hall, Pune',
        imageUrl: 'https://images.unsplash.com/photo-1605641948603-a4e2f0e3b48f?w=800',
        creatorId,
      },
      {
        title: 'College Farewell Party 2025',
        description: 'A bittersweet goodbye to our graduating seniors. Let\'s make memories that will last a lifetime!',
        date: new Date('2025-05-15T16:00:00'),
        location: 'College Auditorium, Delhi University',
        imageUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800',
        creatorId,
      },
      {
        title: 'New Year\'s Eve Gala 2026',
        description: 'Ring in the New Year with style! Live DJ, unlimited food and drinks, and a spectacular fireworks show at midnight.',
        date: new Date('2025-12-31T20:00:00'),
        location: 'JW Marriott, Hyderabad',
        imageUrl: 'https://images.unsplash.com/photo-1467810563316-b5476525c0f9?w=800',
        creatorId,
      },
      {
        title: 'Holi Celebration 2026',
        description: 'Join us for a colorful Holi celebration! Music, colors, thandai, and traditional snacks. Wear white and get ready to get colorful!',
        date: new Date('2026-03-14T11:00:00'),
        location: 'Open Grounds, Jaipur',
        imageUrl: 'https://images.unsplash.com/photo-1583241800698-c57b06c3c5ef?w=800',
        creatorId,
      },
    ];

    // Insert sample events
    for (const event of sampleEvents) {
      const [createdEvent] = await db.insert(events).values(event).returning();
      
      // Add creator as participant
      await db.insert(eventParticipants).values({
        eventId: createdEvent.id,
        userId: creatorId,
        status: 'going',
      });
      
      console.log('[Seed] Created event:', createdEvent.title);
    }

    console.log('[Seed] Successfully created', sampleEvents.length, 'sample events');
  } catch (error) {
    console.error('[Seed] Error seeding events:', error);
  }
}

import type { Express } from "express";
import { z } from "zod";
import { storage } from "./storage";
import { requireAdmin, requireSuperAdmin, requireMasterUser, ROLES, hasRole } from "./adminAuth";
import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;

export function setupAdminRoutes(app: Express) {
  
  // ==================== USER MANAGEMENT ====================
  
  // Get all users (Admin+)
  app.get('/api/admin/users', requireAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });
  
  // Get user stats (Admin+)
  app.get('/api/admin/stats', requireAdmin, async (req, res) => {
    try {
      const [users, events, vendors] = await Promise.all([
        storage.getAllUsers(),
        storage.getAllEvents(),
        storage.getAllVendors(),
      ]);
      
      res.json({
        totalUsers: users.length,
        totalEvents: events.length,
        totalVendors: vendors.length,
        usersByRole: {
          users: users.filter(u => u.role === 'user').length,
          masterUsers: users.filter(u => u.role === 'master_user').length,
          admins: users.filter(u => u.role === 'admin').length,
          superAdmins: users.filter(u => u.role === 'super_admin').length,
        },
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });
  
  // Create admin or master user (Super Admin only)
  app.post('/api/admin/users/create-privileged', requireSuperAdmin, async (req, res) => {
    try {
      const schema = z.object({
        username: z.string().min(3).max(30),
        password: z.string().min(6),
        email: z.string().email(),
        firstName: z.string().min(1),
        lastName: z.string().min(1),
        role: z.enum(['admin', 'master_user']),
      });
      
      const data = schema.parse(req.body);
      
      // Check if username or email already exists
      const existingUser = await storage.getUserByUsername(data.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      const existingEmail = await storage.getUserByEmail(data.email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);
      
      // Create privileged user
      const user = await storage.createUserWithRole({
        username: data.username,
        password: hashedPassword,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role,
      });
      
      res.json({ message: "Privileged user created successfully", user });
    } catch (error: any) {
      console.error("Error creating privileged user:", error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create user" });
    }
  });
  
  // Update user role (Super Admin only)
  app.patch('/api/admin/users/:userId/role', requireSuperAdmin, async (req, res) => {
    try {
      const schema = z.object({
        role: z.enum(['user', 'master_user', 'admin', 'super_admin']),
      });
      
      const data = schema.parse(req.body);
      const { userId } = req.params;
      
      const user = await storage.updateUserRole(userId, data.role);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json({ message: "User role updated successfully", user });
    } catch (error: any) {
      console.error("Error updating user role:", error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update user role" });
    }
  });
  
  // Delete user (Admin+)
  app.delete('/api/admin/users/:userId', requireAdmin, async (req: any, res) => {
    try {
      const { userId } = req.params;
      const currentUser = req.user;
      
      // Get the user to be deleted
      const userToDelete = await storage.getUser(userId);
      if (!userToDelete) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Prevent self-deletion
      if (userId === currentUser.id) {
        return res.status(400).json({ message: "Cannot delete your own account" });
      }
      
      // Only super admins can delete other admins or super admins
      if (hasRole(userToDelete.role || 'user', ROLES.ADMIN) && currentUser.role !== ROLES.SUPER_ADMIN) {
        return res.status(403).json({ message: "Only super admins can delete other privileged users" });
      }
      
      await storage.deleteUser(userId);
      res.json({ message: "User deleted successfully" });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Failed to delete user" });
    }
  });
  
  // ==================== EVENT MANAGEMENT ====================
  
  // Get all events (Admin+)
  app.get('/api/admin/events', requireAdmin, async (req, res) => {
    try {
      const events = await storage.getAllEventsForAdmin();
      res.json(events);
    } catch (error) {
      console.error("Error fetching events:", error);
      res.status(500).json({ message: "Failed to fetch events" });
    }
  });
  
  // Delete any event (Master User+)
  app.delete('/api/admin/events/:eventId', requireMasterUser, async (req, res) => {
    try {
      const { eventId } = req.params;
      
      const event = await storage.getEvent(eventId);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      await storage.deleteEvent(eventId);
      res.json({ message: "Event deleted successfully" });
    } catch (error) {
      console.error("Error deleting event:", error);
      res.status(500).json({ message: "Failed to delete event" });
    }
  });
  
  // ==================== VENDOR MANAGEMENT ====================
  
  // Create vendor (Master User+)
  app.post('/api/admin/vendors', requireMasterUser, async (req, res) => {
    try {
      const schema = z.object({
        name: z.string().min(1),
        category: z.string().min(1),
        description: z.string().optional(),
        priceRange: z.string().optional(),
        rating: z.number().min(0).max(5).default(0),
        imageUrl: z.string().optional(),
        contactEmail: z.string().email().optional(),
        contactPhone: z.string().optional(),
      });
      
      const data = schema.parse(req.body);
      const vendor = await storage.createVendor(data as any);
      
      res.json({ message: "Vendor created successfully", vendor });
    } catch (error: any) {
      console.error("Error creating vendor:", error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create vendor" });
    }
  });
  
  // Update vendor (Master User+)
  app.patch('/api/admin/vendors/:vendorId', requireMasterUser, async (req, res) => {
    try {
      const schema = z.object({
        name: z.string().min(1).optional(),
        category: z.string().min(1).optional(),
        description: z.string().optional(),
        priceRange: z.string().optional(),
        rating: z.number().min(0).max(5).optional(),
        imageUrl: z.string().optional(),
        contactEmail: z.string().email().optional(),
        contactPhone: z.string().optional(),
      });
      
      const data = schema.parse(req.body);
      const { vendorId } = req.params;
      
      const vendor = await storage.updateVendor(vendorId, data as any);
      if (!vendor) {
        return res.status(404).json({ message: "Vendor not found" });
      }
      
      res.json({ message: "Vendor updated successfully", vendor });
    } catch (error: any) {
      console.error("Error updating vendor:", error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update vendor" });
    }
  });
  
  // Delete vendor (Master User+)
  app.delete('/api/admin/vendors/:vendorId', requireMasterUser, async (req, res) => {
    try {
      const { vendorId } = req.params;
      
      const vendor = await storage.getVendor(vendorId);
      if (!vendor) {
        return res.status(404).json({ message: "Vendor not found" });
      }
      
      await storage.deleteVendor(vendorId);
      res.json({ message: "Vendor deleted successfully" });
    } catch (error) {
      console.error("Error deleting vendor:", error);
      res.status(500).json({ message: "Failed to delete vendor" });
    }
  });
}

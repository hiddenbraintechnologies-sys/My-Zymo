import bcrypt from "bcrypt";
import type { Express } from "express";
import { storage } from "./storage";
import { z } from "zod";
import { ROLES } from "./adminAuth";

const SALT_ROUNDS = 10;

// Vendor registration schema
const vendorSignupSchema = z.object({
  // User credentials
  username: z.string().min(3).max(30),
  password: z.string().min(6),
  email: z.string().email(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  
  // Vendor business details
  businessName: z.string().min(1),
  category: z.string().min(1),
  description: z.string().optional(),
  location: z.string().min(1),
  priceRange: z.string().min(1),
  imageUrl: z.string().optional(),
});

// Vendor login schema
const vendorLoginSchema = z.object({
  username: z.string(),
  password: z.string(),
});

export async function setupVendorAuth(app: Express) {
  
  // Vendor signup route
  app.post('/api/vendor/signup', async (req, res) => {
    try {
      const validatedData = vendorSignupSchema.parse(req.body);
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(validatedData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      // Check if email already exists
      const existingEmail = await storage.getUserByEmail(validatedData.email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(validatedData.password, SALT_ROUNDS);
      
      // Create vendor user account
      const user = await storage.createUserWithPassword({
        username: validatedData.username,
        password: hashedPassword,
        email: validatedData.email,
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        role: ROLES.VENDOR,
      });
      
      // Create vendor business profile
      const vendor = await storage.createVendor({
        userId: user.id,
        name: validatedData.businessName,
        category: validatedData.category,
        description: validatedData.description || '',
        location: validatedData.location,
        priceRange: validatedData.priceRange,
        imageUrl: validatedData.imageUrl,
      });
      
      // SECURITY: Regenerate session to prevent session fixation attacks
      await new Promise<void>((resolve, reject) => {
        req.session.regenerate((err) => {
          if (err) {
            console.error("Session regeneration error during vendor signup:", err);
            reject(err);
          } else {
            resolve();
          }
        });
      });
      
      // Set session
      (req.session as any).userId = user.id;
      
      // Ensure session is saved before responding
      await new Promise<void>((resolve, reject) => {
        req.session.save((err) => {
          if (err) {
            console.error("Session save error during vendor signup:", err);
            reject(err);
          } else {
            resolve();
          }
        });
      });
      
      res.json({ 
        message: "Vendor registration successful", 
        userId: user.id,
        vendorId: vendor.id
      });
    } catch (error: any) {
      console.error("Vendor signup error:", error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid signup data", errors: error.errors });
      }
      res.status(500).json({ message: "Vendor registration failed" });
    }
  });

  // Vendor login route
  app.post('/api/vendor/login', async (req, res) => {
    try {
      const validatedData = vendorLoginSchema.parse(req.body);
      console.log('[Vendor Login] Attempting login for:', validatedData.username);
      
      // Find user by username OR email
      let user = await storage.getUserByUsername(validatedData.username);
      console.log('[Vendor Login] Username lookup result:', user ? `Found user ${user.id}` : 'Not found');
      let passwordMatch = false;
      
      if (user && user.password) {
        passwordMatch = await bcrypt.compare(validatedData.password, user.password);
        console.log('[Vendor Login] Username password match:', passwordMatch);
      }
      
      // If username authentication failed and input contains @, try email lookup
      if (!passwordMatch && validatedData.username.includes('@')) {
        console.log('[Vendor Login] Trying email lookup for:', validatedData.username);
        const emailUser = await storage.getUserByEmail(validatedData.username);
        console.log('[Vendor Login] Email lookup result:', emailUser ? `Found user ${emailUser.id}` : 'Not found');
        if (emailUser && emailUser.password) {
          passwordMatch = await bcrypt.compare(validatedData.password, emailUser.password);
          console.log('[Vendor Login] Email password match:', passwordMatch);
          if (passwordMatch) {
            user = emailUser;
          }
        }
      }
      
      // Final authentication check
      if (!user || !user.password || !passwordMatch) {
        console.log('[Vendor Login] Authentication failed for:', validatedData.username);
        return res.status(401).json({ message: "Invalid username or password" });
      }
      
      // Check if user is a vendor
      if (user.role !== ROLES.VENDOR) {
        console.log('[Vendor Login] User is not a vendor:', user.role);
        return res.status(403).json({ message: "Access denied. This login is for vendors only." });
      }
      
      console.log('[Vendor Login] Authentication successful for vendor:', user.id);
      
      // SECURITY: Regenerate session to prevent session fixation attacks
      await new Promise<void>((resolve, reject) => {
        req.session.regenerate((err) => {
          if (err) {
            console.error("Session regeneration error during vendor login:", err);
            reject(err);
          } else {
            resolve();
          }
        });
      });
      
      // Set session
      (req.session as any).userId = user.id;
      
      // Ensure session is saved before responding
      await new Promise<void>((resolve, reject) => {
        req.session.save((err) => {
          if (err) {
            console.error("Session save error during vendor login:", err);
            reject(err);
          } else {
            resolve();
          }
        });
      });
      
      res.json({ message: "Vendor login successful", userId: user.id });
    } catch (error: any) {
      console.error("Vendor login error:", error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid login data", errors: error.errors });
      }
      res.status(500).json({ message: "Vendor login failed" });
    }
  });
}

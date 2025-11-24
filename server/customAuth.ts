import bcrypt from "bcrypt";
import type { Express, RequestHandler } from "express";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";
import { z } from "zod";
import { sanitizeUser } from "@shared/sanitize";

const SALT_ROUNDS = 10;

// Export sessionStore for WebSocket verification
const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
const pgStore = connectPg(session);
export const sessionStore = new pgStore({
  conString: process.env.DATABASE_URL,
  createTableIfMissing: false,
  ttl: sessionTtl,
  tableName: "sessions",
});

export function getSession() {
  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: true,
      maxAge: sessionTtl,
    },
  });
}

// Signup schema
const signupSchema = z.object({
  username: z.string().min(3).max(30),
  password: z.string().min(6),
  email: z.string().email(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
});

// Login schema
const loginSchema = z.object({
  username: z.string(),
  password: z.string(),
});

export async function setupCustomAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());

  // Signup route
  app.post('/api/auth/signup', async (req, res) => {
    try {
      const validatedData = signupSchema.parse(req.body);
      
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
      
      // Create user
      const user = await storage.createUserWithPassword({
        username: validatedData.username,
        password: hashedPassword,
        email: validatedData.email,
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
      });
      
      // SECURITY: Regenerate session to prevent session fixation attacks
      await new Promise<void>((resolve, reject) => {
        req.session.regenerate((err) => {
          if (err) {
            console.error("Session regeneration error during signup:", err);
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
            console.error("Session save error during signup:", err);
            reject(err);
          } else {
            resolve();
          }
        });
      });
      
      res.json({ message: "Signup successful", userId: user.id });
    } catch (error: any) {
      console.error("Signup error:", error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid signup data", errors: error.errors });
      }
      res.status(500).json({ message: "Signup failed" });
    }
  });

  // Login route
  app.post('/api/auth/login', async (req, res) => {
    try {
      const validatedData = loginSchema.parse(req.body);
      console.log('[Login] Attempting login for:', validatedData.username);
      
      // Find user by username OR email
      // Try username first
      let user = await storage.getUserByUsername(validatedData.username);
      console.log('[Login] Username lookup result:', user ? `Found user ${user.id}` : 'Not found');
      let passwordMatch = false;
      
      if (user && user.password) {
        passwordMatch = await bcrypt.compare(validatedData.password, user.password);
        console.log('[Login] Username password match:', passwordMatch);
      }
      
      // If username authentication failed and input contains @, try email lookup
      if (!passwordMatch && validatedData.username.includes('@')) {
        console.log('[Login] Trying email lookup for:', validatedData.username);
        const emailUser = await storage.getUserByEmail(validatedData.username);
        console.log('[Login] Email lookup result:', emailUser ? `Found user ${emailUser.id}` : 'Not found');
        if (emailUser && emailUser.password) {
          passwordMatch = await bcrypt.compare(validatedData.password, emailUser.password);
          console.log('[Login] Email password match:', passwordMatch);
          if (passwordMatch) {
            user = emailUser;
          }
        }
      }
      
      // Final authentication check
      if (!user || !user.password || !passwordMatch) {
        console.log('[Login] Authentication failed for:', validatedData.username);
        return res.status(401).json({ message: "Invalid username or password" });
      }
      
      console.log('[Login] Authentication successful for user:', user.id);
      
      // SECURITY: Regenerate session to prevent session fixation attacks
      await new Promise<void>((resolve, reject) => {
        req.session.regenerate((err) => {
          if (err) {
            console.error("Session regeneration error during login:", err);
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
            console.error("Session save error during login:", err);
            reject(err);
          } else {
            resolve();
          }
        });
      });
      
      res.json({ message: "Login successful", userId: user.id });
    } catch (error: any) {
      console.error("Login error:", error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid login data", errors: error.errors });
      }
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Logout route (POST for API calls)
  app.post('/api/auth/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logout successful" });
    });
  });
  
  // Logout route (GET for browser navigation)
  app.get('/api/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error("Logout error:", err);
      }
      res.redirect('/');
    });
  });
}

// Middleware to check if user is authenticated
export const isAuthenticated: RequestHandler = async (req: any, res, next) => {
  const userId = (req.session as any).userId;
  
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  // Attach user to request for convenience
  try {
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    // SECURITY: Always sanitize user object before attaching to request
    req.user = sanitizeUser(user);
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(401).json({ message: "Unauthorized" });
  }
};

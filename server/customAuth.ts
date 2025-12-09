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

// Signup schema with comprehensive validation matching frontend
const signupSchema = z.object({
  username: z.string()
    .min(4, "Username must be at least 4 characters")
    .max(30, "Username cannot exceed 30 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores")
    .refine((username) => /[a-zA-Z0-9]/.test(username), {
      message: "Username must contain at least one letter or number",
    })
    .refine((username) => /^[a-zA-Z]/.test(username), {
      message: "Username must start with a letter",
    }),
  password: z.string()
    .min(6, "Password must be at least 6 characters")
    .max(128, "Password cannot exceed 128 characters")
    .refine((password) => !password.includes(" "), {
      message: "Password cannot contain spaces",
    }),
  email: z.string()
    .max(254, "Email cannot exceed 254 characters")
    .email("Please enter a valid email address")
    .refine((email) => {
      const localPart = email.split("@")[0];
      return localPart && /[a-zA-Z0-9]/.test(localPart);
    }, {
      message: "Email must contain at least one letter or number before the @",
    })
    .refine((email) => {
      // Validate domain structure: must have a dot and valid TLD
      const domain = email.split("@")[1];
      if (!domain) return false;
      const parts = domain.split(".");
      if (parts.length < 2) return false;
      const tld = parts[parts.length - 1];
      return tld.length >= 2 && tld.length <= 10 && /^[a-zA-Z]+$/.test(tld);
    }, {
      message: "Please enter a valid email with a proper domain",
    }),
  firstName: z.string()
    .min(1, "First name is required")
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name cannot exceed 50 characters")
    .regex(/^[a-zA-Z\s'-]+$/, "First name can only contain letters, spaces, hyphens, and apostrophes")
    .refine((name) => /[a-zA-Z]/.test(name), {
      message: "First name must contain at least one letter",
    }),
  lastName: z.string()
    .min(1, "Last name is required")
    .min(2, "Last name must be at least 2 characters")
    .max(50, "Last name cannot exceed 50 characters")
    .regex(/^[a-zA-Z\s'-]+$/, "Last name can only contain letters, spaces, hyphens, and apostrophes")
    .refine((name) => /[a-zA-Z]/.test(name), {
      message: "Last name must contain at least one letter",
    }),
});

// Login schema
const loginSchema = z.object({
  username: z.string(),
  password: z.string(),
});

export async function setupCustomAuth(app: Express) {
  // NOTE: Session is already set up by setupReplitAuth
  // Don't set up session again to avoid conflicts

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

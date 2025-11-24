import type { RequestHandler } from "express";
import { storage } from "./storage";

// Role hierarchy for permission checking
export const ROLES = {
  USER: 'user',
  VENDOR: 'vendor',
  MASTER_USER: 'master_user',
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin',
} as const;

// Role levels for comparison (higher number = more permissions)
const ROLE_LEVELS = {
  [ROLES.USER]: 0,
  [ROLES.VENDOR]: 0,
  [ROLES.MASTER_USER]: 1,
  [ROLES.ADMIN]: 2,
  [ROLES.SUPER_ADMIN]: 3,
} as const;

/**
 * Check if a user has at least the specified role level
 */
export function hasRole(userRole: string, requiredRole: string): boolean {
  const userLevel = ROLE_LEVELS[userRole as keyof typeof ROLE_LEVELS] ?? 0;
  const requiredLevel = ROLE_LEVELS[requiredRole as keyof typeof ROLE_LEVELS] ?? 0;
  return userLevel >= requiredLevel;
}

/**
 * Middleware to require admin access (admin or super_admin)
 */
export const requireAdmin: RequestHandler = async (req: any, res, next) => {
  const userId = (req.session as any).userId;
  
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  try {
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    if (!hasRole(user.role || 'user', ROLES.ADMIN)) {
      return res.status(403).json({ message: "Forbidden: Admin access required" });
    }
    
    req.user = user;
    next();
  } catch (error) {
    console.error("Admin auth error:", error);
    res.status(500).json({ message: "Authentication error" });
  }
};

/**
 * Middleware to require super admin access
 */
export const requireSuperAdmin: RequestHandler = async (req: any, res, next) => {
  const userId = (req.session as any).userId;
  
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  try {
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    if (user.role !== ROLES.SUPER_ADMIN) {
      return res.status(403).json({ message: "Forbidden: Super admin access required" });
    }
    
    req.user = user;
    next();
  } catch (error) {
    console.error("Super admin auth error:", error);
    res.status(500).json({ message: "Authentication error" });
  }
};

/**
 * Middleware to require master user or higher access
 */
export const requireMasterUser: RequestHandler = async (req: any, res, next) => {
  const userId = (req.session as any).userId;
  
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  try {
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    if (!hasRole(user.role || 'user', ROLES.MASTER_USER)) {
      return res.status(403).json({ message: "Forbidden: Master user access required" });
    }
    
    req.user = user;
    next();
  } catch (error) {
    console.error("Master user auth error:", error);
    res.status(500).json({ message: "Authentication error" });
  }
};

/**
 * Middleware to require vendor access
 */
export const requireVendor: RequestHandler = async (req: any, res, next) => {
  const userId = (req.session as any).userId;
  
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  try {
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    if (user.role !== ROLES.VENDOR) {
      return res.status(403).json({ message: "Forbidden: Vendor access required" });
    }
    
    req.user = user;
    next();
  } catch (error) {
    console.error("Vendor auth error:", error);
    res.status(500).json({ message: "Authentication error" });
  }
};

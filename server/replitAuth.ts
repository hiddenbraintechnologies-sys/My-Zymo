// Replit Auth integration - blueprint: javascript_log_in_with_replit
import * as client from "openid-client";
import { Strategy, type VerifyFunction } from "openid-client/passport";

import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";

const getOidcConfig = memoize(
  async () => {
    return await client.discovery(
      new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
      process.env.REPL_ID!
    );
  },
  { maxAge: 3600 * 1000 }
);

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

function updateUserSession(
  user: any,
  tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers
) {
  user.claims = tokens.claims();
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  user.expires_at = user.claims?.exp;
}

async function upsertUser(
  claims: any,
) {
  await storage.upsertUser({
    id: claims["sub"],
    email: claims["email"],
    firstName: claims["first_name"],
    lastName: claims["last_name"],
    profileImageUrl: claims["profile_image_url"],
  });
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  const config = await getOidcConfig();

  const verify: VerifyFunction = async (
    tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers,
    verified: passport.AuthenticateCallback
  ) => {
    const user = {};
    updateUserSession(user, tokens);
    await upsertUser(tokens.claims());
    verified(null, user);
  };

  // Keep track of registered strategies
  const registeredStrategies = new Set<string>();

  // Helper function to ensure strategy exists for a domain
  const ensureStrategy = (domain: string) => {
    const strategyName = `replitauth:${domain}`;
    if (!registeredStrategies.has(strategyName)) {
      const strategy = new Strategy(
        {
          name: strategyName,
          config,
          scope: "openid email profile offline_access",
          callbackURL: `https://${domain}/api/callback`,
        },
        verify,
      );
      passport.use(strategy);
      registeredStrategies.add(strategyName);
    }
  };

  passport.serializeUser((user: Express.User, cb) => cb(null, user));
  passport.deserializeUser((user: Express.User, cb) => cb(null, user));

  app.get("/api/login", (req, res, next) => {
    ensureStrategy(req.hostname);
    passport.authenticate(`replitauth:${req.hostname}`, {
      scope: ["openid", "email", "profile", "offline_access"],
    })(req, res, next);
  });

  app.get("/api/callback", async (req, res, next) => {
    ensureStrategy(req.hostname);
    passport.authenticate(`replitauth:${req.hostname}`, async (err: any, user: any) => {
      if (err) {
        return res.redirect("/api/login");
      }
      if (!user) {
        return res.redirect("/api/login");
      }
      
      // Log the user in
      req.login(user, async (loginErr) => {
        if (loginErr) {
          return res.redirect("/api/login");
        }
        
        try {
          // Get the user from database by email to check role and profile status
          // We use email instead of Replit subject ID because existing users may have different IDs
          const userEmail = user.claims.email;
          const dbUser = await storage.getUserByEmail(userEmail);
          
          // Check for admin role and redirect to admin dashboard
          if (dbUser && (dbUser.role === "super_admin" || dbUser.role === "admin" || dbUser.role === "master_user")) {
            return res.redirect("/admin");
          }
          
          // Check if user has completed their profile (beyond auth fields)
          // New users will only have firstName/lastName from auth
          // Existing users will have additional profile fields
          const hasCompletedProfile = dbUser && (
            dbUser.phone || 
            dbUser.college || 
            dbUser.profession || 
            dbUser.currentCity ||
            dbUser.bio
          );
          
          // Check for returnTo parameter
          const returnTo = (req.session as any)?.returnTo;
          if (returnTo) {
            delete (req.session as any).returnTo;
            return res.redirect(returnTo);
          }
          
          // Redirect based on profile completion status
          if (hasCompletedProfile) {
            return res.redirect("/dashboard");
          } else {
            return res.redirect("/profile");
          }
        } catch (error) {
          console.error("Error checking profile status:", error);
          // Default to profile page if there's an error
          return res.redirect("/profile");
        }
      });
    })(req, res, next);
  });

  app.get("/api/logout", (req, res) => {
    req.logout(() => {
      res.redirect(
        client.buildEndSessionUrl(config, {
          client_id: process.env.REPL_ID!,
          post_logout_redirect_uri: `${req.protocol}://${req.hostname}`,
        }).href
      );
    });
  });

  // Vendor-specific Replit Auth endpoints with separate strategy
  const ensureVendorStrategy = (domain: string) => {
    const strategyName = `replitauth-vendor:${domain}`;
    if (!registeredStrategies.has(strategyName)) {
      const strategy = new Strategy(
        {
          name: strategyName,
          config,
          scope: "openid email profile offline_access",
          callbackURL: `https://${domain}/api/vendor/auth/callback`,
        },
        verify,
      );
      passport.use(strategy);
      registeredStrategies.add(strategyName);
    }
  };

  app.get("/api/vendor/auth/login", (req, res, next) => {
    ensureVendorStrategy(req.hostname);
    // Store vendor context in session to handle vendor registration in callback
    (req.session as any).vendorSignup = true;
    passport.authenticate(`replitauth-vendor:${req.hostname}`, {
      scope: ["openid", "email", "profile", "offline_access"],
    })(req, res, next);
  });

  app.get("/api/vendor/auth/callback", async (req, res, next) => {
    ensureVendorStrategy(req.hostname);
    passport.authenticate(`replitauth-vendor:${req.hostname}`, async (err: any, user: any) => {
      if (err) {
        return res.redirect("/vendor/login");
      }
      if (!user) {
        return res.redirect("/vendor/login");
      }
      
      // Log the user in
      req.login(user, async (loginErr) => {
        if (loginErr) {
          return res.redirect("/vendor/login");
        }
        
        try {
          const userEmail = user.claims.email;
          const oidcUserId = user.claims.sub;
          const isVendorSignup = (req.session as any)?.vendorSignup;
          if (req.session) {
            delete (req.session as any).vendorSignup;
          }

          // Check if user exists
          let dbUser = await storage.getUserByEmail(userEmail);
          
          if (!dbUser) {
            // User should exist from verify() callback, but handle gracefully
            return res.redirect("/vendor/signup");
          }

          // IMPORTANT: Set session userId to DATABASE user ID for downstream routes
          (req.session as any).userId = dbUser.id;
          
          // Save session before proceeding
          await new Promise<void>((resolve, reject) => {
            req.session.save((err) => {
              if (err) {
                console.error("Session save error during vendor callback:", err);
                reject(err);
              } else {
                resolve();
              }
            });
          });
          
          // If this is a vendor signup flow and user doesn't have vendor role, create vendor
          if (isVendorSignup) {
            
            // Check if user is already a vendor
            const existingVendor = await storage.getVendorByUserId(dbUser.id);
            if (!existingVendor) {
              // User exists but is not a vendor yet, update role to vendor
              await storage.updateUserRole(dbUser.id, 'vendor');
              dbUser = await storage.getUser(dbUser.id);
            }
          }
          
          // Check if user is a vendor
          if (dbUser && dbUser.role === 'vendor') {
            const vendor = await storage.getVendorByUserId(dbUser.id);
            if (!vendor) {
              // Vendor role but no vendor profile, redirect to complete signup
              return res.redirect("/vendor/signup");
            }
            // Check approval status
            if (vendor.approvalStatus === 'pending') {
              return res.redirect("/vendor/dashboard"); // Dashboard will show pending message
            }
            if (vendor.approvalStatus === 'rejected') {
              return res.redirect("/vendor/dashboard"); // Dashboard will show rejected message
            }
            // Approved vendor, go to dashboard
            return res.redirect("/vendor/dashboard");
          }
          
          // Not a vendor, redirect to vendor signup
          return res.redirect("/vendor/signup");
        } catch (error) {
          console.error("Error in vendor auth callback:", error);
          return res.redirect("/vendor/signup");
        }
      });
    })(req, res, next);
  });
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  const user = req.user as any;

  if (!req.isAuthenticated() || !user.expires_at) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const now = Math.floor(Date.now() / 1000);
  if (now <= user.expires_at) {
    return next();
  }

  const refreshToken = user.refresh_token;
  if (!refreshToken) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const config = await getOidcConfig();
    const tokenResponse = await client.refreshTokenGrant(config, refreshToken);
    updateUserSession(user, tokenResponse);
    return next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
};

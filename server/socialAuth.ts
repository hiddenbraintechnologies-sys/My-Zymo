import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as FacebookStrategy } from "passport-facebook";
import { Strategy as TwitterStrategy } from "passport-twitter";
import type { Express } from "express";
import { storage } from "./storage";

export function setupSocialAuth(app: Express) {
  // Google OAuth Strategy
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(
      new GoogleStrategy(
        {
          clientID: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          callbackURL: "/api/auth/google/callback",
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            // Check if user exists
            let user = await storage.findUserByProviderId("google", profile.id);
            
            if (!user) {
              // Create new user from Google profile
              user = await storage.createSocialUser({
                provider: "google",
                providerId: profile.id,
                email: profile.emails?.[0]?.value || "",
                firstName: profile.name?.givenName || "",
                lastName: profile.name?.familyName || "",
                profileImageUrl: profile.photos?.[0]?.value,
              });
            }
            
            return done(null, user);
          } catch (error) {
            return done(error as Error);
          }
        }
      )
    );
  }

  // Facebook OAuth Strategy
  if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
    passport.use(
      new FacebookStrategy(
        {
          clientID: process.env.FACEBOOK_APP_ID,
          clientSecret: process.env.FACEBOOK_APP_SECRET,
          callbackURL: "/api/auth/facebook/callback",
          profileFields: ["id", "emails", "name", "picture.type(large)"],
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            let user = await storage.findUserByProviderId("facebook", profile.id);
            
            if (!user) {
              user = await storage.createSocialUser({
                provider: "facebook",
                providerId: profile.id,
                email: profile.emails?.[0]?.value || "",
                firstName: profile.name?.givenName || "",
                lastName: profile.name?.familyName || "",
                profileImageUrl: profile.photos?.[0]?.value,
              });
            }
            
            return done(null, user);
          } catch (error) {
            return done(error as Error);
          }
        }
      )
    );
  }

  // Twitter OAuth Strategy
  if (process.env.TWITTER_CONSUMER_KEY && process.env.TWITTER_CONSUMER_SECRET) {
    passport.use(
      new TwitterStrategy(
        {
          consumerKey: process.env.TWITTER_CONSUMER_KEY,
          consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
          callbackURL: "/api/auth/twitter/callback",
          includeEmail: true,
        },
        async (token, tokenSecret, profile, done) => {
          try {
            let user = await storage.findUserByProviderId("twitter", profile.id);
            
            if (!user) {
              user = await storage.createSocialUser({
                provider: "twitter",
                providerId: profile.id,
                email: profile.emails?.[0]?.value || "",
                firstName: profile.displayName?.split(" ")[0] || "",
                lastName: profile.displayName?.split(" ")[1] || "",
                profileImageUrl: profile.photos?.[0]?.value,
              });
            }
            
            return done(null, user);
          } catch (error) {
            return done(error as Error);
          }
        }
      )
    );
  }

  // OAuth routes
  app.get(
    "/api/auth/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
  );

  app.get(
    "/api/auth/google/callback",
    passport.authenticate("google", { failureRedirect: "/login" }),
    (req, res) => {
      res.redirect("/");
    }
  );

  app.get(
    "/api/auth/facebook",
    passport.authenticate("facebook", { scope: ["email"] })
  );

  app.get(
    "/api/auth/facebook/callback",
    passport.authenticate("facebook", { failureRedirect: "/login" }),
    (req, res) => {
      res.redirect("/");
    }
  );

  app.get("/api/auth/twitter", passport.authenticate("twitter"));

  app.get(
    "/api/auth/twitter/callback",
    passport.authenticate("twitter", { failureRedirect: "/login" }),
    (req, res) => {
      res.redirect("/");
    }
  );
}

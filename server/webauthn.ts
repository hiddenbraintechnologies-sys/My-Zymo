import type { Express } from "express";
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from "@simplewebauthn/server";
import type {
  RegistrationResponseJSON,
  AuthenticationResponseJSON,
} from "@simplewebauthn/types";
import { db } from "./db";
import { users, webauthnCredentials } from "@shared/schema";
import { eq } from "drizzle-orm";

// Relying Party info
const rpName = "Myzymo";
const rpID = process.env.RP_ID || "localhost";
const origin = process.env.ORIGIN || `https://${rpID}`;

export function setupWebAuthn(app: Express) {
  // Generate registration options (for biometric enrollment)
  app.post("/api/webauthn/register/options", async (req: any, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const user = req.user;
      const userId = user.id;

      // Get existing credentials for this user
      const existingCredentials = await db
        .select()
        .from(webauthnCredentials)
        .where(eq(webauthnCredentials.userId, userId));

      const options = await generateRegistrationOptions({
        rpName,
        rpID,
        userName: user.email || user.username,
        userDisplayName: `${user.firstName} ${user.lastName}`,
        attestationType: "none",
        excludeCredentials: existingCredentials.map((cred) => ({
          id: Buffer.from(cred.credentialId, "base64url"),
          type: "public-key",
          transports: cred.transports as AuthenticatorTransport[],
        })),
        authenticatorSelection: {
          residentKey: "preferred",
          userVerification: "preferred",
          authenticatorAttachment: "platform", // For biometric (fingerprint, Face ID)
        },
      });

      // Store challenge in session
      req.session.webauthnChallenge = options.challenge;

      res.json(options);
    } catch (error) {
      console.error("[WebAuthn] Error generating registration options:", error);
      res.status(500).json({ message: "Failed to generate registration options" });
    }
  });

  // Verify registration response and store credential
  app.post("/api/webauthn/register/verify", async (req: any, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const body: RegistrationResponseJSON = req.body;
      const expectedChallenge = req.session.webauthnChallenge;

      if (!expectedChallenge) {
        return res.status(400).json({ message: "No challenge found in session" });
      }

      const verification = await verifyRegistrationResponse({
        response: body,
        expectedChallenge,
        expectedOrigin: origin,
        expectedRPID: rpID,
      });

      if (!verification.verified || !verification.registrationInfo) {
        return res.status(400).json({ message: "Verification failed" });
      }

      const { credentialPublicKey, credentialID, counter } = verification.registrationInfo;

      // Store credential in database
      await db.insert(webauthnCredentials).values({
        userId: req.user.id,
        credentialId: Buffer.from(credentialID).toString("base64url"),
        publicKey: Buffer.from(credentialPublicKey).toString("base64url"),
        counter,
        transports: body.response.transports || [],
      });

      // Clear challenge from session
      delete req.session.webauthnChallenge;

      res.json({ verified: true });
    } catch (error) {
      console.error("[WebAuthn] Error verifying registration:", error);
      res.status(500).json({ message: "Failed to verify registration" });
    }
  });

  // Generate authentication options (for biometric login)
  app.post("/api/webauthn/auth/options", async (req, res) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ message: "Email required" });
      }

      // Find user by email
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.email, email));

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Get user's credentials
      const userCredentials = await db
        .select()
        .from(webauthnCredentials)
        .where(eq(webauthnCredentials.userId, user.id));

      if (userCredentials.length === 0) {
        return res.status(404).json({ message: "No credentials registered" });
      }

      const options = await generateAuthenticationOptions({
        rpID,
        allowCredentials: userCredentials.map((cred) => ({
          id: Buffer.from(cred.credentialId, "base64url"),
          type: "public-key",
          transports: cred.transports as AuthenticatorTransport[],
        })),
        userVerification: "preferred",
      });

      // Store challenge and user ID in session
      (req.session as any).webauthnChallenge = options.challenge;
      (req.session as any).webauthnUserId = user.id;

      res.json(options);
    } catch (error) {
      console.error("[WebAuthn] Error generating auth options:", error);
      res.status(500).json({ message: "Failed to generate authentication options" });
    }
  });

  // Verify authentication response and log user in
  app.post("/api/webauthn/auth/verify", async (req, res) => {
    try {
      const body: AuthenticationResponseJSON = req.body;
      const expectedChallenge = (req.session as any).webauthnChallenge;
      const userId = (req.session as any).webauthnUserId;

      if (!expectedChallenge || !userId) {
        return res.status(400).json({ message: "Invalid session" });
      }

      // Get the credential from database
      const [credential] = await db
        .select()
        .from(webauthnCredentials)
        .where(
          eq(webauthnCredentials.credentialId, Buffer.from(body.id, "base64url").toString("base64url"))
        );

      if (!credential) {
        return res.status(404).json({ message: "Credential not found" });
      }

      const verification = await verifyAuthenticationResponse({
        response: body,
        expectedChallenge,
        expectedOrigin: origin,
        expectedRPID: rpID,
        authenticator: {
          credentialID: Buffer.from(credential.credentialId, "base64url"),
          credentialPublicKey: Buffer.from(credential.publicKey, "base64url"),
          counter: credential.counter,
        },
      });

      if (!verification.verified) {
        return res.status(400).json({ message: "Verification failed" });
      }

      // Update counter
      await db
        .update(webauthnCredentials)
        .set({ counter: verification.authenticationInfo.newCounter })
        .where(eq(webauthnCredentials.id, credential.id));

      // Log user in - get full user object
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, userId));

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Set user in session (same as custom auth)
      (req.session as any).userId = user.id;
      await new Promise<void>((resolve) => req.session.save(() => resolve()));

      // Clear WebAuthn challenge from session
      delete (req.session as any).webauthnChallenge;
      delete (req.session as any).webauthnUserId;

      res.json({ verified: true, user });
    } catch (error) {
      console.error("[WebAuthn] Error verifying authentication:", error);
      res.status(500).json({ message: "Failed to verify authentication" });
    }
  });

  // Check if user has biometric credentials
  app.get("/api/webauthn/has-credentials", async (req: any, res) => {
    try {
      if (!req.user) {
        return res.json({ hasCredentials: false });
      }

      const credentials = await db
        .select()
        .from(webauthnCredentials)
        .where(eq(webauthnCredentials.userId, req.user.id));

      res.json({ hasCredentials: credentials.length > 0 });
    } catch (error) {
      console.error("[WebAuthn] Error checking credentials:", error);
      res.status(500).json({ message: "Failed to check credentials" });
    }
  });
}

import type { User } from './schema';

/**
 * SECURITY: Remove password field from user objects
 * This function should be called before sending user data in API responses
 * @param user - User object potentially containing password hash
 * @returns User object without password field
 */
export function sanitizeUser(user: User): User {
  const { password, ...sanitized } = user;
  return sanitized as User;
}

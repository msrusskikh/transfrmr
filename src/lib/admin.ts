/**
 * Admin access control utilities
 */

export const ADMIN_EMAIL = 'msrusskikh@gmail.com'

/**
 * Check if the provided email belongs to an admin user
 * @param email - The email address to check
 * @returns true if the email is the admin email, false otherwise
 */
export function isAdminEmail(email: string | null | undefined): boolean {
  return email === ADMIN_EMAIL
}

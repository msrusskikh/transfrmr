import bcrypt from 'bcrypt'

const SALT_ROUNDS = 12

/**
 * Hash a password using bcrypt with cost factor 12
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS)
}

/**
 * Compare a plain text password with a hashed password
 * Always runs comparison to prevent timing attacks
 */
export async function comparePassword(
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(plainPassword, hashedPassword)
}

/**
 * Compare password with a dummy hash if user not found
 * This prevents timing attacks by always running bcrypt
 */
export async function comparePasswordSafe(
  plainPassword: string,
  hashedPassword: string | null
): Promise<boolean> {
  if (!hashedPassword) {
    // Use a dummy hash to prevent timing attacks
    const dummyHash = '$2b$12$dummy.hash.to.prevent.timing.attacks.here'
    await bcrypt.compare(plainPassword, dummyHash)
    return false
  }
  return bcrypt.compare(plainPassword, hashedPassword)
}

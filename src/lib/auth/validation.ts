import { z } from 'zod'

// Email validation schema
export const emailSchema = z
  .string()
  .email('Неверный формат email')
  .toLowerCase()
  .trim()

// Password validation: min 8 chars, at least 1 uppercase, 1 number
export const passwordSchema = z
  .string()
  .min(8, 'Пароль должен содержать минимум 8 символов')
  .regex(/[A-Z]/, 'Пароль должен содержать хотя бы одну заглавную букву')
  .regex(/[0-9]/, 'Пароль должен содержать хотя бы одну цифру')

// Registration schema
export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
})

// Login schema
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Пароль обязателен'),
})

// Forgot password schema
export const forgotPasswordSchema = z.object({
  email: emailSchema,
})

// Reset password schema
export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Токен обязателен'),
  password: passwordSchema,
})

// Email verification schema
export const verifyEmailSchema = z.object({
  token: z.string().min(1, 'Токен обязателен'),
})

// Type exports
export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>

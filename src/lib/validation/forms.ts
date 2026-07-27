import { z } from "zod";

export const signUpSchema = z
  .object({
    displayName: z.string().trim().min(1, "Enter a display name.").max(60),
    email: z.string().trim().email("Enter a valid email address."),
    password: z.string().min(8, "Password must be at least 8 characters."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });
export type SignUpFormValues = z.infer<typeof signUpSchema>;

export const signInSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
  password: z.string().min(1, "Enter your password."),
});
export type SignInFormValues = z.infer<typeof signInSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
});
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export const contactSchema = z.object({
  name: z.string().trim().min(1, "Enter your name.").max(80),
  email: z.string().trim().email("Enter a valid email address."),
  message: z
    .string()
    .trim()
    .min(10, "Message should be at least 10 characters.")
    .max(2000),
});
export type ContactFormValues = z.infer<typeof contactSchema>;

export const profileFormSchema = z.object({
  displayName: z.string().trim().min(1, "Enter a display name.").max(60),
  preferredField: z.string().max(80).optional(),
  preferredRole: z.string().max(80).optional(),
  experienceLevel: z
    .enum(["entry", "associate", "mid", "senior", "lead", "manager"])
    .optional(),
  preferredWorkArrangement: z.enum(["remote", "hybrid", "onsite"]).optional(),
});
export type ProfileFormValues = z.infer<typeof profileFormSchema>;

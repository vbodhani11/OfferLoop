"use client";

import { useState } from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { MailCheck } from "lucide-react";
import { AuthCard } from "@/features/auth/components/AuthCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  forgotPasswordSchema,
  type ForgotPasswordFormValues,
} from "@/lib/validation/forms";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const configured = isSupabaseConfigured();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({ resolver: zodResolver(forgotPasswordSchema) });

  const onSubmit = async (values: ForgotPasswordFormValues) => {
    setFormError(null);
    const client = getSupabaseBrowserClient();
    if (!client) {
      setFormError(
        "Password reset requires Supabase to be configured for this deployment.",
      );
      return;
    }
    const { error } = await client.auth.resetPasswordForEmail(values.email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) {
      setFormError("We could not send a reset link. Try again in a moment.");
      return;
    }
    setSent(true);
  };

  if (sent) {
    return (
      <AuthCard
        title="Check your email"
        description="If an account exists for that address, a reset link is on its way."
      >
        <div className="flex flex-col items-center gap-3 py-4 text-center">
          <MailCheck className="text-brand h-10 w-10" aria-hidden="true" />
          <p className="text-muted-foreground text-sm">
            Follow the link in your email to choose a new password.
          </p>
          <Button asChild variant="secondary" className="mt-2">
            <Link href="/sign-in">Back to sign in</Link>
          </Button>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Reset your password"
      description="Enter your account email and we'll send you a link to choose a new password."
      footer={
        <Link
          href="/sign-in"
          className="focus-ring text-brand rounded font-medium hover:underline"
        >
          Back to sign in
        </Link>
      }
    >
      {!configured ? (
        <p className="border-border bg-surface-muted text-muted-foreground rounded-[var(--radius-md)] border px-3 py-2 text-xs">
          Supabase is not configured in this environment, so password reset is
          unavailable.
        </p>
      ) : null}
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            {...register("email")}
            aria-invalid={Boolean(errors.email)}
          />
          {errors.email ? (
            <p className="text-danger text-sm">{errors.email.message}</p>
          ) : null}
        </div>
        {formError ? (
          <p role="alert" className="text-danger text-sm">
            {formError}
          </p>
        ) : null}
        <Button type="submit" loading={isSubmitting} disabled={!configured}>
          Send reset link
        </Button>
      </form>
    </AuthCard>
  );
}

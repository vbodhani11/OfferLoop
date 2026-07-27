"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { AuthCard } from "@/features/auth/components/AuthCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  resetPasswordSchema,
  type ResetPasswordFormValues,
} from "@/lib/validation/forms";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const configured = isSupabaseConfigured();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({ resolver: zodResolver(resetPasswordSchema) });

  useEffect(() => {
    const client = getSupabaseBrowserClient();
    if (!client) return;
    // The recovery link Supabase emails to the user establishes a temporary
    // session automatically when this page loads (detectSessionInUrl).
    client.auth.getSession().then(({ data }) => {
      setReady(Boolean(data.session));
    });
  }, []);

  const onSubmit = async (values: ResetPasswordFormValues) => {
    setFormError(null);
    const client = getSupabaseBrowserClient();
    if (!client) {
      setFormError(
        "Password reset requires Supabase to be configured for this deployment.",
      );
      return;
    }
    const { error } = await client.auth.updateUser({ password: values.password });
    if (error) {
      setFormError(
        "We could not update your password. Request a new reset link and try again.",
      );
      return;
    }
    toast.success("Password updated. You're signed in.");
    router.push("/accept");
    router.refresh();
  };

  return (
    <AuthCard
      title="Choose a new password"
      description="Set a new password for your OfferLoop account."
    >
      {!configured ? (
        <p className="border-border bg-surface-muted text-muted-foreground rounded-[var(--radius-md)] border px-3 py-2 text-xs">
          Supabase is not configured in this environment, so password reset is
          unavailable.
        </p>
      ) : !ready ? (
        <p className="text-muted-foreground text-sm">
          This link may have expired. Request a new one from the{" "}
          <a href="/forgot-password" className="text-brand font-medium hover:underline">
            forgot password
          </a>{" "}
          page.
        </p>
      ) : null}
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password">New password</Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            {...register("password")}
            aria-invalid={Boolean(errors.password)}
          />
          {errors.password ? (
            <p className="text-danger text-sm">{errors.password.message}</p>
          ) : null}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="confirmPassword">Confirm new password</Label>
          <Input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            {...register("confirmPassword")}
            aria-invalid={Boolean(errors.confirmPassword)}
          />
          {errors.confirmPassword ? (
            <p className="text-danger text-sm">{errors.confirmPassword.message}</p>
          ) : null}
        </div>
        {formError ? (
          <p role="alert" className="text-danger text-sm">
            {formError}
          </p>
        ) : null}
        <Button type="submit" loading={isSubmitting} disabled={!configured || !ready}>
          Update password
        </Button>
      </form>
    </AuthCard>
  );
}

"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { AuthCard } from "@/features/auth/components/AuthCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signInSchema, type SignInFormValues } from "@/lib/validation/forms";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { safeRedirectPath } from "@/lib/security/safeRedirect";

export default function SignInPage() {
  return (
    <Suspense fallback={null}>
      <SignInPageContent />
    </Suspense>
  );
}

function SignInPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formError, setFormError] = useState<string | null>(null);
  const configured = isSupabaseConfigured();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInFormValues>({ resolver: zodResolver(signInSchema) });

  const onSubmit = async (values: SignInFormValues) => {
    setFormError(null);
    const client = getSupabaseBrowserClient();
    if (!client) {
      setFormError("Sign-in requires Supabase to be configured for this deployment.");
      return;
    }
    const { error } = await client.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    });
    if (error) {
      setFormError(
        "We could not sign you in. Check your email and password and try again.",
      );
      return;
    }
    toast.success("Welcome back!");
    router.push(safeRedirectPath(searchParams.get("next")));
    router.refresh();
  };

  return (
    <AuthCard
      title="Sign in to OfferLoop"
      description="Sign in to sync your fictional offers and saved jobs across devices."
      footer={
        <>
          Don&apos;t have an account?{" "}
          <Link
            href="/sign-up"
            className="focus-ring text-brand rounded font-medium hover:underline"
          >
            Create one
          </Link>
        </>
      }
    >
      {!configured ? (
        <p className="border-border bg-surface-muted text-muted-foreground rounded-[var(--radius-md)] border px-3 py-2 text-xs">
          Supabase is not configured in this environment, so sign-in is unavailable. You
          can still use OfferLoop as a guest — your data stays on this device.
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
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link
              href="/forgot-password"
              className="focus-ring text-muted-foreground hover:text-brand rounded text-xs"
            >
              Forgot password?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            {...register("password")}
            aria-invalid={Boolean(errors.password)}
          />
          {errors.password ? (
            <p className="text-danger text-sm">{errors.password.message}</p>
          ) : null}
        </div>
        {formError ? (
          <p role="alert" className="text-danger text-sm">
            {formError}
          </p>
        ) : null}
        <Button type="submit" loading={isSubmitting} disabled={!configured}>
          Sign in
        </Button>
      </form>
    </AuthCard>
  );
}

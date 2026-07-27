"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { MailCheck } from "lucide-react";
import { AuthCard } from "@/features/auth/components/AuthCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signUpSchema, type SignUpFormValues } from "@/lib/validation/forms";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default function SignUpPage() {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const [needsVerification, setNeedsVerification] = useState(false);
  const configured = isSupabaseConfigured();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpFormValues>({ resolver: zodResolver(signUpSchema) });

  const onSubmit = async (values: SignUpFormValues) => {
    setFormError(null);
    const client = getSupabaseBrowserClient();
    if (!client) {
      setFormError("Sign-up requires Supabase to be configured for this deployment.");
      return;
    }
    const { data, error } = await client.auth.signUp({
      email: values.email,
      password: values.password,
      options: { data: { display_name: values.displayName } },
    });
    if (error) {
      setFormError(
        error.message.toLowerCase().includes("already registered")
          ? "An account with that email already exists. Try signing in instead."
          : "We could not create your account. Try again.",
      );
      return;
    }

    if (data.session) {
      await client
        .from("profiles")
        .upsert({ id: data.user!.id, display_name: values.displayName });
      toast.success("Account created. Welcome to OfferLoop!");
      router.push("/accept");
      router.refresh();
      return;
    }

    setNeedsVerification(true);
  };

  if (needsVerification) {
    return (
      <AuthCard
        title="Check your email"
        description="We sent a verification link to confirm your new account."
      >
        <div className="flex flex-col items-center gap-3 py-4 text-center">
          <MailCheck className="text-brand h-10 w-10" aria-hidden="true" />
          <p className="text-muted-foreground text-sm">
            Click the link in your email to verify your address, then come back and sign
            in.
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
      title="Create your OfferLoop account"
      description="Save your fictional offers and recruiting decisions across devices."
      footer={
        <>
          Already have an account?{" "}
          <Link
            href="/sign-in"
            className="focus-ring text-brand rounded font-medium hover:underline"
          >
            Sign in
          </Link>
        </>
      }
    >
      {!configured ? (
        <p className="border-border bg-surface-muted text-muted-foreground rounded-[var(--radius-md)] border px-3 py-2 text-xs">
          Supabase is not configured in this environment, so account creation is
          unavailable. You can still use OfferLoop as a guest — your data stays on this
          device.
        </p>
      ) : null}

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="displayName">Display name</Label>
          <Input
            id="displayName"
            autoComplete="name"
            {...register("displayName")}
            aria-invalid={Boolean(errors.displayName)}
          />
          {errors.displayName ? (
            <p className="text-danger text-sm">{errors.displayName.message}</p>
          ) : null}
        </div>
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
          <Label htmlFor="password">Password</Label>
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
          <Label htmlFor="confirmPassword">Confirm password</Label>
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
        <Button type="submit" loading={isSubmitting} disabled={!configured}>
          Create account
        </Button>
        <p className="text-muted-foreground text-center text-xs">
          OfferLoop never asks for a real résumé, government ID, or financial information.
        </p>
      </form>
    </AuthCard>
  );
}

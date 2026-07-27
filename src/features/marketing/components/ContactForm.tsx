"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { contactSchema, type ContactFormValues } from "@/lib/validation/forms";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormValues>({ resolver: zodResolver(contactSchema) });

  const onSubmit = async (values: ContactFormValues) => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    void values;
    setSubmitted(true);
    reset();
    toast.success("Message sent", {
      description: "Thanks for the note — we'll follow up by email.",
    });
  };

  if (submitted) {
    return (
      <div
        role="status"
        className="border-accept/30 bg-accept-muted text-accept rounded-[var(--radius-lg)] border px-5 py-6 text-sm"
      >
        Thanks for reaching out! This is a simulation contact form — we&apos;ll follow up
        outside of OfferLoop.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="contact-name">Name</Label>
        <Input
          id="contact-name"
          {...register("name")}
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? "contact-name-error" : undefined}
        />
        {errors.name ? (
          <p id="contact-name-error" className="text-danger text-sm">
            {errors.name.message}
          </p>
        ) : null}
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="contact-email">Email</Label>
        <Input
          id="contact-email"
          type="email"
          {...register("email")}
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? "contact-email-error" : undefined}
        />
        {errors.email ? (
          <p id="contact-email-error" className="text-danger text-sm">
            {errors.email.message}
          </p>
        ) : null}
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="contact-message">Message</Label>
        <Textarea
          id="contact-message"
          {...register("message")}
          aria-invalid={Boolean(errors.message)}
          aria-describedby={errors.message ? "contact-message-error" : undefined}
        />
        {errors.message ? (
          <p id="contact-message-error" className="text-danger text-sm">
            {errors.message.message}
          </p>
        ) : null}
      </div>
      <Button type="submit" loading={isSubmitting} className="w-fit">
        Send message
      </Button>
    </form>
  );
}

"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useSupabaseUser } from "@/lib/auth/useSupabaseUser";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { getSupabaseRepositorySet } from "@/lib/repositories";
import { hasGuestDataToMigrate, migrateGuestData } from "./migrateGuestData";
import { ConfirmationDialog } from "@/components/feedback/ConfirmationDialog";

/**
 * Mounted once near the app root. Watches for a guest becoming authenticated
 * and, if local guest data exists, offers a one-time prompt to migrate it
 * into their new account. Declining leaves the guest data untouched so the
 * user can try again from their next sign-in.
 */
export function GuestMigrationPrompt() {
  const { user } = useSupabaseUser();
  const [promptedUserId, setPromptedUserId] = useState<string | null>(null);
  const [migrating, setMigrating] = useState(false);

  const shouldPrompt =
    Boolean(user) && user!.id !== promptedUserId && hasGuestDataToMigrate();

  const dismiss = () => setPromptedUserId(user?.id ?? null);

  const handleMigrate = async () => {
    if (!user) return;
    const client = getSupabaseBrowserClient();
    if (!client) {
      dismiss();
      return;
    }
    setMigrating(true);
    try {
      const repositories = getSupabaseRepositorySet(client);
      const summary = await migrateGuestData(user.id, repositories);
      const total =
        summary.offersMigrated + summary.savedJobsMigrated + summary.applicationsMigrated;
      if (total > 0) {
        toast.success(
          `Migrated ${summary.offersMigrated} offer${summary.offersMigrated === 1 ? "" : "s"} and ${summary.savedJobsMigrated} saved job${summary.savedJobsMigrated === 1 ? "" : "s"} to your account.`,
        );
      } else {
        toast("No guest data needed migrating.");
      }
      if (summary.milestonesSynced) {
        toast.success("Progress synced", {
          description: "Your fictional milestones are now connected to your account.",
        });
      }
    } catch {
      toast.error(
        "We could not migrate all of your guest data. You can try again from your profile.",
      );
    } finally {
      setMigrating(false);
      dismiss();
    }
  };

  return (
    <ConfirmationDialog
      open={shouldPrompt}
      onOpenChange={(open) => !open && dismiss()}
      title="Move your guest data into your account?"
      description="You have fictional offers or saved jobs stored on this device as a guest. We can copy them into your new OfferLoop account so they're available anywhere you sign in."
      confirmLabel="Migrate my data"
      cancelLabel="Not now"
      loading={migrating}
      onConfirm={handleMigrate}
    />
  );
}

"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { Download, LogOut, Trash2 } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { SectionHeading } from "@/components/layout/SectionHeading";
import { SimulationBadge } from "@/components/branding/SimulationBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ConfirmationDialog } from "@/components/feedback/ConfirmationDialog";
import {
  EXPERIENCE_LEVEL_LABELS,
  EXPERIENCE_LEVELS,
  WORK_ARRANGEMENT_LABELS,
  WORK_ARRANGEMENTS,
} from "@/lib/constants/categories";
import { profileFormSchema, type ProfileFormValues } from "@/lib/validation/forms";
import { useRepositories } from "@/lib/repositories/useRepositories";
import { useGuestSession } from "@/lib/context/GuestSessionContext";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { clearAllGuestData } from "@/lib/storage/guestStore";
import { ProgressSummaryCard } from "@/features/milestones/components/ProgressSummaryCard";
import { useMilestones } from "@/features/milestones/MilestoneProvider";

export default function ProfilePage() {
  const router = useRouter();
  const { repositories, userId, isGuest } = useRepositories();
  const { setDisplayName: setGuestDisplayName } = useGuestSession();
  const { lifetimeCounts, unlockedAchievements } = useMilestones();
  const [loaded, setLoaded] = useState(false);
  const [deleteHistoryOpen, setDeleteHistoryOpen] = useState(false);
  const [deleteAccountOpen, setDeleteAccountOpen] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: { displayName: "Future You" },
  });

  const load = useCallback(async () => {
    const profile = await repositories.profile.getProfile(userId);
    if (profile) {
      setValue("displayName", profile.displayName);
      setValue("preferredField", profile.preferredField ?? "");
      setValue("preferredRole", profile.preferredRole ?? "");
      setValue("experienceLevel", profile.experienceLevel ?? undefined);
      setValue("preferredWorkArrangement", profile.preferredWorkArrangement ?? undefined);
    }
    setLoaded(true);
  }, [repositories, userId, setValue]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-mount pattern; setLoaded fires once data is available
    void load();
  }, [load]);

  const onSubmit = async (values: ProfileFormValues) => {
    try {
      await repositories.profile.updateProfile(userId, values);
      if (isGuest) setGuestDisplayName(values.displayName);
      toast.success("Profile updated.");
    } catch {
      toast.error("We could not save your profile. Try again.");
    }
  };

  const handleExportData = async () => {
    try {
      const [profile, offers, savedJobs] = await Promise.all([
        repositories.profile.getProfile(userId),
        repositories.offers.listOffers(userId),
        repositories.savedJobs.listSavedJobs(userId),
      ]);
      const payload = {
        profile,
        offers,
        savedJobs,
        exportedAt: new Date().toISOString(),
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "offerloop-simulation-data.json";
      link.click();
      URL.revokeObjectURL(url);
      toast.success("Simulation data exported.");
    } catch {
      toast.error("We could not export your data. Try again.");
    }
  };

  const handleDeleteHistory = async () => {
    try {
      const offers = await repositories.offers.listOffers(userId);
      await Promise.all(
        offers.map((offer) => repositories.offers.deleteOffer(userId, offer.id)),
      );
      await repositories.savedJobs.clearAll(userId);
      toast.success("Simulation history deleted.");
    } catch {
      toast.error("We could not delete your simulation history. Try again.");
    } finally {
      setDeleteHistoryOpen(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (isGuest) {
      clearAllGuestData();
      toast.success("Guest simulation data cleared.");
      setDeleteAccountOpen(false);
      router.push("/");
      return;
    }
    const client = getSupabaseBrowserClient();
    if (!client) {
      toast.error("Account deletion requires Supabase configuration. Contact support.");
      setDeleteAccountOpen(false);
      return;
    }
    await client.auth.signOut();
    toast.success(
      "You've been signed out. Full account deletion requires an administrator — see DEPLOYMENT.md for manual steps.",
    );
    setDeleteAccountOpen(false);
    router.push("/");
  };

  const handleSignOut = async () => {
    const client = getSupabaseBrowserClient();
    if (client) await client.auth.signOut();
    router.push("/");
  };

  return (
    <PageContainer className="flex max-w-2xl flex-col gap-8 py-10">
      <div className="flex flex-col gap-4">
        <SimulationBadge />
        <SectionHeading
          title="Your OfferLoop profile"
          description="These preferences personalize your fictional applications and hiring simulations. Nothing here is shared with real employers."
        />
      </div>

      {loaded ? (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="border-border bg-surface flex flex-col gap-5 rounded-[var(--radius-lg)] border p-6"
        >
          <div className="flex flex-col gap-2">
            <Label htmlFor="displayName">Display name</Label>
            <Input
              id="displayName"
              {...register("displayName")}
              aria-invalid={!!errors.displayName}
            />
            {errors.displayName ? (
              <p className="text-danger text-sm">{errors.displayName.message}</p>
            ) : null}
            <p className="text-muted-foreground text-xs">
              Shown on your fictional offers instead of your real name.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="preferredField">Preferred career field</Label>
              <Input
                id="preferredField"
                placeholder="e.g. Software Engineering"
                {...register("preferredField")}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="preferredRole">Preferred role</Label>
              <Input
                id="preferredRole"
                placeholder="e.g. Product Manager"
                {...register("preferredRole")}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="experienceLevel">Experience level</Label>
              <Controller
                control={control}
                name="experienceLevel"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="experienceLevel">
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      {EXPERIENCE_LEVELS.map((level) => (
                        <SelectItem key={level} value={level}>
                          {EXPERIENCE_LEVEL_LABELS[level]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="preferredWorkArrangement">Preferred work arrangement</Label>
              <Controller
                control={control}
                name="preferredWorkArrangement"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="preferredWorkArrangement">
                      <SelectValue placeholder="Select arrangement" />
                    </SelectTrigger>
                    <SelectContent>
                      {WORK_ARRANGEMENTS.map((arrangement) => (
                        <SelectItem key={arrangement} value={arrangement}>
                          {WORK_ARRANGEMENT_LABELS[arrangement]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            loading={isSubmitting}
            className="w-fit"
          >
            Save profile
          </Button>
        </form>
      ) : null}

      <div id="achievements">
        <ProgressSummaryCard
          counts={lifetimeCounts}
          unlocked={unlockedAchievements}
          isGuest={isGuest}
        />
      </div>

      <div className="border-border bg-surface flex flex-col gap-3 rounded-[var(--radius-lg)] border p-6">
        <h2 className="text-foreground text-lg font-semibold">Data & account</h2>
        <p className="text-muted-foreground text-sm">
          Manage your simulation data.{" "}
          {isGuest ? "You're browsing as a guest — data lives only on this device." : ""}
        </p>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary" onClick={handleExportData}>
            <Download className="h-4 w-4" /> Export simulation data
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="text-danger hover:text-danger"
            onClick={() => setDeleteHistoryOpen(true)}
          >
            <Trash2 className="h-4 w-4" /> Delete simulation history
          </Button>
          {!isGuest ? (
            <Button type="button" variant="ghost" onClick={handleSignOut}>
              <LogOut className="h-4 w-4" /> Sign out
            </Button>
          ) : null}
          <Button
            type="button"
            variant="danger"
            onClick={() => setDeleteAccountOpen(true)}
          >
            {isGuest ? "Clear guest data" : "Delete account"}
          </Button>
        </div>
      </div>

      <ConfirmationDialog
        open={deleteHistoryOpen}
        onOpenChange={setDeleteHistoryOpen}
        title="Delete simulation history?"
        description="This will permanently delete all your fictional offers and saved jobs. This action cannot be undone."
        confirmLabel="Delete history"
        destructive
        onConfirm={handleDeleteHistory}
      />

      <ConfirmationDialog
        open={deleteAccountOpen}
        onOpenChange={setDeleteAccountOpen}
        title={isGuest ? "Clear guest data?" : "Delete your account?"}
        description={
          isGuest
            ? "This removes all guest simulation data stored on this device. This action cannot be undone."
            : "This will sign you out and request account deletion. This action cannot be undone."
        }
        confirmLabel={isGuest ? "Clear data" : "Delete account"}
        destructive
        onConfirm={handleDeleteAccount}
      />
    </PageContainer>
  );
}

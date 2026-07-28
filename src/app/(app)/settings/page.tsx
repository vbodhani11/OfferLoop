"use client";

import { useState } from "react";
import { useTheme } from "next-themes";
import { PageContainer } from "@/components/layout/PageContainer";
import { SectionHeading } from "@/components/layout/SectionHeading";
import { SimulationBadge } from "@/components/branding/SimulationBadge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMotionPreference } from "@/lib/motion/MotionPreferenceContext";
import { useRepositories } from "@/lib/repositories/useRepositories";
import { useHasMounted } from "@/lib/motion/useHasMounted";
import { readGuestSettings, writeGuestSettings } from "@/lib/storage/guestStore";
import {
  QUICK_REJECTION_DEFAULT_CODES,
  REJECTION_REASON_LABEL_BY_CODE,
  type QuickRejectionDefaultCode,
} from "@/features/reject/services/rejectionReasons";
import type { CelebrationIntensity } from "@/types/domain";

const CELEBRATION_OPTIONS: {
  value: CelebrationIntensity;
  label: string;
  description: string;
}[] = [
  {
    value: "minimal",
    label: "Minimal",
    description: "Quick reveal, no confetti particles.",
  },
  {
    value: "standard",
    label: "Standard",
    description: "Balanced celebration with confetti.",
  },
  {
    value: "maximum",
    label: "Maximum",
    description: "Extra particles for the biggest celebration.",
  },
];

export default function SettingsPage() {
  const {
    reducedMotionOverride,
    setReducedMotionOverride,
    celebrationIntensity,
    setCelebrationIntensity,
    confettiEnabled,
    setConfettiEnabled,
    soundEnabled,
    setSoundEnabled,
    systemReducedMotion,
  } = useMotionPreference();
  const { theme, setTheme } = useTheme();
  const { repositories, userId } = useRepositories();
  const mounted = useHasMounted();

  const [quickRejectionEnabled, setQuickRejectionEnabled] = useState(
    () => readGuestSettings().quickRejectionEnabled,
  );
  const [defaultRejectionReason, setDefaultRejectionReason] =
    useState<QuickRejectionDefaultCode>(() => readGuestSettings().defaultRejectionReason);

  const persistToProfile = (
    updates: Parameters<typeof repositories.profile.updateProfile>[1],
  ) => {
    void repositories.profile.updateProfile(userId, updates);
  };

  const persistQuickRejection = (partial: {
    quickRejectionEnabled?: boolean;
    defaultRejectionReason?: QuickRejectionDefaultCode;
  }) => {
    const current = readGuestSettings();
    const next = {
      ...current,
      ...partial,
    };
    writeGuestSettings(next);
    setQuickRejectionEnabled(next.quickRejectionEnabled);
    setDefaultRejectionReason(next.defaultRejectionReason);
  };

  return (
    <PageContainer className="flex max-w-2xl flex-col gap-8 py-10">
      <div className="flex flex-col gap-4">
        <SimulationBadge />
        <SectionHeading
          title="Settings"
          description="Control motion, sound, and appearance for your OfferLoop simulation experience."
        />
      </div>

      <section className="border-border bg-surface flex flex-col gap-5 rounded-[var(--radius-lg)] border p-6">
        <h2 className="text-foreground text-lg font-semibold">Appearance</h2>
        <div className="flex flex-col gap-2">
          <Label htmlFor="theme-select">Theme</Label>
          {mounted ? (
            <Select
              value={theme}
              onValueChange={(value) => {
                setTheme(value);
                persistToProfile({
                  themePreference: value as "system" | "light" | "dark",
                });
              }}
            >
              <SelectTrigger id="theme-select" className="w-full sm:w-56">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="system">System</SelectItem>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
              </SelectContent>
            </Select>
          ) : (
            <div
              className="bg-surface-muted h-10 w-56 rounded-[var(--radius-md)]"
              aria-hidden="true"
            />
          )}
        </div>
      </section>

      <section className="border-border bg-surface flex flex-col gap-5 rounded-[var(--radius-lg)] border p-6">
        <h2 className="text-foreground text-lg font-semibold">Motion & celebration</h2>

        <div className="flex items-center justify-between gap-4">
          <div>
            <Label htmlFor="reduced-motion">Reduce motion</Label>
            <p className="text-muted-foreground text-xs">
              {systemReducedMotion
                ? "Currently enabled by your system's accessibility settings."
                : "Turn off large animations across OfferLoop."}
            </p>
          </div>
          <Switch
            id="reduced-motion"
            checked={reducedMotionOverride || systemReducedMotion}
            disabled={systemReducedMotion}
            onCheckedChange={(checked) => {
              setReducedMotionOverride(checked);
              persistToProfile({ reducedMotion: checked });
            }}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label>Celebration intensity</Label>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {CELEBRATION_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  setCelebrationIntensity(option.value);
                  persistToProfile({ celebrationIntensity: option.value });
                }}
                aria-pressed={celebrationIntensity === option.value}
                className={`focus-ring flex flex-col gap-1 rounded-[var(--radius-md)] border p-3 text-left text-sm transition-colors ${
                  celebrationIntensity === option.value
                    ? "border-brand bg-brand-muted text-brand"
                    : "border-border text-muted-foreground hover:border-brand/40"
                }`}
              >
                <span className="font-medium">{option.label}</span>
                <span className="text-xs">{option.description}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div>
            <Label htmlFor="confetti-enabled">Confetti effects</Label>
            <p className="text-muted-foreground text-xs">
              Show confetti during offer celebrations.
            </p>
          </div>
          <Switch
            id="confetti-enabled"
            checked={confettiEnabled}
            onCheckedChange={(checked) => {
              setConfettiEnabled(checked);
              persistToProfile({ confettiEnabled: checked });
            }}
          />
        </div>

        <div className="flex items-center justify-between gap-4">
          <div>
            <Label htmlFor="sound-enabled">Sound effects</Label>
            <p className="text-muted-foreground text-xs">
              Play subtle UI sounds. Off by default.
            </p>
          </div>
          <Switch
            id="sound-enabled"
            checked={soundEnabled}
            onCheckedChange={(checked) => {
              setSoundEnabled(checked);
              persistToProfile({ soundEnabled: checked });
            }}
          />
        </div>
      </section>

      <section className="border-border bg-surface flex flex-col gap-5 rounded-[var(--radius-lg)] border p-6">
        <div>
          <h2 className="text-foreground text-lg font-semibold">Reject Mode</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Quick rejection is off by default. When enabled, Reject uses your chosen
            default reason. You can still open the full reason dialog with &ldquo;Choose
            reason,&rdquo; and Undo always remains available.
          </p>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div>
            <Label htmlFor="quick-rejection">Quick rejection mode</Label>
            <p className="text-muted-foreground text-xs">
              Skip the reason dialog and use your default fictional reason.
            </p>
          </div>
          <Switch
            id="quick-rejection"
            checked={quickRejectionEnabled}
            onCheckedChange={(checked) => {
              persistQuickRejection({ quickRejectionEnabled: checked });
            }}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="default-rejection-reason">Default rejection reason</Label>
          <Select
            value={defaultRejectionReason}
            disabled={!quickRejectionEnabled}
            onValueChange={(value) => {
              persistQuickRejection({
                defaultRejectionReason: value as QuickRejectionDefaultCode,
              });
            }}
          >
            <SelectTrigger id="default-rejection-reason" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {QUICK_REJECTION_DEFAULT_CODES.map((code) => (
                <SelectItem key={code} value={code}>
                  {REJECTION_REASON_LABEL_BY_CODE[code]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-muted-foreground text-xs">
            &ldquo;Other&rdquo; cannot be used as the automatic default.
          </p>
        </div>
      </section>
    </PageContainer>
  );
}

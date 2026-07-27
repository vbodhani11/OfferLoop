"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  ArrowRight,
  Building2,
  Calendar,
  Check,
  Copy,
  PartyPopper,
  RefreshCw,
  Share2,
  Sparkles,
  Wallet,
} from "lucide-react";
import { AppLogo } from "@/components/branding/AppLogo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { formatDate } from "@/lib/formatting/currency";
import { formatOfferSalaryLine, generateOfferId } from "@/lib/formatting/offer";
import { useMotionPreference } from "@/lib/motion/MotionPreferenceContext";
import { usePrefersReducedMotion } from "@/lib/motion/usePrefersReducedMotion";
import type { JobWithOrganization, Offer } from "@/types/domain";

interface OfferCelebrationProps {
  offer: Offer;
  job: JobWithOrganization;
  saveError?: boolean;
  saving?: boolean;
  onRetrySave?: () => void;
  autoPlayIntro?: boolean;
  onDelete?: () => void;
  initialShareOpen?: boolean;
}

export function OfferCelebration({
  offer,
  job,
  saveError = false,
  saving = false,
  onRetrySave,
  autoPlayIntro = true,
  onDelete,
  initialShareOpen = false,
}: OfferCelebrationProps) {
  const reducedMotion = usePrefersReducedMotion();
  const { confettiEnabled, celebrationIntensity } = useMotionPreference();
  const [phase, setPhase] = useState<"sealed" | "revealed">(
    autoPlayIntro ? "sealed" : "revealed",
  );
  const [shareOpen, setShareOpen] = useState(initialShareOpen);
  const isPreview = offer.id.startsWith("preview-");
  const offerId = generateOfferId(offer.id);

  useEffect(() => {
    if (phase !== "sealed") return;
    const timer = setTimeout(() => setPhase("revealed"), reducedMotion ? 0 : 1100);
    return () => clearTimeout(timer);
  }, [phase, reducedMotion]);

  useEffect(() => {
    if (phase !== "revealed" || !autoPlayIntro) return;
    if (reducedMotion || !confettiEnabled) return;
    let cancelled = false;
    import("canvas-confetti").then(({ default: confetti }) => {
      if (cancelled) return;
      const particleCount =
        celebrationIntensity === "minimal"
          ? 40
          : celebrationIntensity === "maximum"
            ? 160
            : 90;
      confetti({ particleCount, spread: 75, startVelocity: 45, origin: { y: 0.6 } });
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fire once when this celebration reveals
  }, [phase]);

  const replay = () => setPhase("sealed");

  const copyMessage = async () => {
    const text = `${offer.recipientDisplayName} received a fictional offer for ${job.title} at ${job.organization.name} on OfferLoop — a career simulation. Not a real job offer.`;
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Simulation message copied.");
    } catch {
      toast.error("Could not copy to clipboard.");
    }
  };

  return (
    <div className="relative flex min-h-[80vh] flex-col items-center justify-center overflow-hidden px-4 py-10">
      <AnimatePresence>
        {phase === "sealed" && autoPlayIntro ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 -z-10 bg-black/40"
            aria-hidden="true"
          />
        ) : null}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {phase === "sealed" && autoPlayIntro ? (
          <motion.div
            key="sealed"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05, rotateY: 90 }}
            transition={{ duration: reducedMotion ? 0.15 : 0.5 }}
            className="flex flex-col items-center gap-6 text-center"
          >
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="bg-brand-muted text-brand flex h-24 w-24 items-center justify-center rounded-full"
            >
              <AppLogo variant="icon" className="h-10 w-10" />
            </motion.div>
            <p className="text-lg font-medium text-white">
              Your fictional decision is ready
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="revealed"
            initial={autoPlayIntro ? { opacity: 0, y: 16, rotateX: -8 } : false}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ duration: reducedMotion ? 0.15 : 0.5 }}
            className="flex w-full max-w-2xl flex-col gap-6"
          >
            <div className="flex flex-col items-center gap-3 text-center">
              <Badge variant="brand" className="text-xs">
                Career Simulation — Not a Real Job Offer
              </Badge>
              <h1 className="text-foreground text-2xl font-semibold sm:text-3xl">
                Congratulations, {offer.recipientDisplayName}!
              </h1>
              <p className="text-muted-foreground max-w-lg text-sm">
                {offer.offerMessage}
              </p>
            </div>

            {saveError ? (
              <div className="border-danger/30 bg-danger/5 text-danger flex flex-col items-center gap-2 rounded-[var(--radius-md)] border px-4 py-3 text-center text-sm">
                <p>
                  We created your fictional offer, but could not save it. Your device may
                  be low on storage.
                </p>
                <Button
                  type="button"
                  variant="danger"
                  size="sm"
                  loading={saving}
                  onClick={onRetrySave}
                >
                  <RefreshCw className="h-4 w-4" /> Try saving again
                </Button>
              </div>
            ) : null}

            <div className="border-border bg-surface flex flex-col gap-5 rounded-[var(--radius-lg)] border p-6 shadow-[var(--shadow-soft-lg)] sm:p-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-[var(--radius-md)] text-sm font-semibold text-white"
                    style={{
                      backgroundImage: `linear-gradient(135deg, ${job.organization.logoStyle.gradientFrom}, ${job.organization.logoStyle.gradientTo})`,
                    }}
                    aria-hidden="true"
                  >
                    {job.organization.initials}
                  </div>
                  <div>
                    <p className="text-foreground font-semibold">
                      {job.organization.name}
                    </p>
                    <p className="text-muted-foreground flex items-center gap-1 text-xs">
                      <Building2 className="h-3 w-3" /> Fictional company
                    </p>
                  </div>
                </div>
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 260, damping: 18 }}
                  className="bg-accept-muted text-accept flex h-9 w-9 items-center justify-center rounded-full"
                >
                  <Check className="h-5 w-5" aria-hidden="true" />
                </motion.span>
              </div>

              <div>
                <h2 className="text-foreground text-xl font-semibold">{job.title}</h2>
                <p className="text-muted-foreground text-sm">
                  Reporting to {offer.fictionalManagerName} (fictional manager)
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <OfferStat
                  icon={Wallet}
                  label="Fictional salary"
                  value={formatOfferSalaryLine(offer)}
                />
                <OfferStat
                  icon={Calendar}
                  label="Fictional start date"
                  value={formatDate(offer.fictionalStartDate)}
                />
                <OfferStat
                  icon={Sparkles}
                  label="Work arrangement"
                  value={job.organization.industry}
                />
              </div>

              <div className="border-border text-muted-foreground flex flex-wrap items-center justify-between gap-2 border-t pt-4 text-xs">
                <span>Offer created {formatDate(offer.createdAt)}</span>
                <span>OfferLoop ID: {offerId}</span>
              </div>
              <p className="text-muted-foreground text-xs">
                This is an entertainment experience. It is not a real employment offer and
                has no legal or financial value.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2">
              <Button type="button" variant="accept" onClick={replay}>
                <PartyPopper className="h-4 w-4" /> Celebrate again
              </Button>
              <Button asChild variant="secondary">
                <Link href="/accept">
                  Browse more fictional jobs <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              {!isPreview ? (
                <Button asChild variant="secondary">
                  <Link href={`/offers/${offer.id}`}>View offer details</Link>
                </Button>
              ) : null}
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShareOpen(true)}
              >
                <Share2 className="h-4 w-4" /> Share simulation card
              </Button>
              {onDelete ? (
                <Button type="button" variant="danger" onClick={onDelete}>
                  Delete offer
                </Button>
              ) : null}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Dialog open={shareOpen} onOpenChange={setShareOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Simulation share card</DialogTitle>
            <DialogDescription>
              Screenshot this card to share, or copy the text version below.
            </DialogDescription>
          </DialogHeader>
          <div className="border-border from-brand/10 flex flex-col gap-3 rounded-[var(--radius-lg)] border bg-gradient-to-br to-transparent p-6 text-center">
            <span className="bg-foreground text-background mx-auto inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold tracking-widest uppercase">
              Career Simulation
            </span>
            <p className="text-foreground text-lg font-semibold">
              {offer.recipientDisplayName}
            </p>
            <p className="text-muted-foreground text-sm">{job.title}</p>
            <p className="text-brand text-sm font-medium">{job.organization.name}</p>
            <p className="text-muted-foreground text-xs">{formatDate(offer.createdAt)}</p>
            <p className="text-danger text-[10px] font-semibold tracking-wider uppercase">
              Not a real job offer
            </p>
            <div className="text-muted-foreground mx-auto flex items-center gap-1.5 text-xs">
              <AppLogo variant="icon" className="h-4 w-4" /> OfferLoop simulation
              watermark
            </div>
          </div>
          <Button type="button" variant="secondary" onClick={copyMessage}>
            <Copy className="h-4 w-4" /> Copy simulation message
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function OfferStat({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-surface-muted flex flex-col gap-1 rounded-[var(--radius-md)] px-3 py-2.5">
      <span className="text-muted-foreground flex items-center gap-1.5 text-xs">
        <Icon className="h-3.5 w-3.5" aria-hidden />
        {label}
      </span>
      <span className="text-foreground text-sm font-semibold">{value}</span>
    </div>
  );
}

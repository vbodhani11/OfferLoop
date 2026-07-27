import { cn } from "@/lib/utils";

interface AppLogoProps {
  variant?: "full" | "icon";
  className?: string;
  title?: string;
}

/**
 * Original OfferLoop mark: an abstract "O" built from two opposing arcs (the
 * accept path and the reject path) meeting at a checkmark node, suggesting a
 * loop between receiving offers and making decisions. Not derived from any
 * third-party logo, icon set, or brand.
 */
function LoopMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="OfferLoop"
    >
      <defs>
        <linearGradient
          id="offerloop-accept"
          x1="4"
          y1="4"
          x2="36"
          y2="20"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#6366f1" />
          <stop offset="1" stopColor="#22d3ee" />
        </linearGradient>
        <linearGradient
          id="offerloop-reject"
          x1="36"
          y1="36"
          x2="4"
          y2="20"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#f97316" />
          <stop offset="1" stopColor="#f43f5e" />
        </linearGradient>
      </defs>
      <path
        d="M20 4C11.163 4 4 11.163 4 20"
        stroke="url(#offerloop-accept)"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <path
        d="M20 4c8.837 0 16 7.163 16 16 0 4.06-1.512 7.766-4.003 10.59"
        stroke="url(#offerloop-accept)"
        strokeWidth="5"
        strokeLinecap="round"
        opacity="0.35"
      />
      <path
        d="M20 36c8.837 0 16-7.163 16-16"
        stroke="url(#offerloop-reject)"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <path
        d="M20 36c-8.837 0-16-7.163-16-16 0-4.06 1.512-7.766 4.003-10.59"
        stroke="url(#offerloop-reject)"
        strokeWidth="5"
        strokeLinecap="round"
        opacity="0.35"
      />
      <path
        d="M14.5 20.5l3.6 3.6 7.4-7.6"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-foreground"
      />
    </svg>
  );
}

export function AppLogo({
  variant = "full",
  className,
  title = "OfferLoop",
}: AppLogoProps) {
  if (variant === "icon") {
    return <LoopMark className={cn("h-8 w-8", className)} />;
  }
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 font-semibold tracking-tight",
        className,
      )}
    >
      <LoopMark className="h-7 w-7 shrink-0" />
      <span className="text-foreground text-lg leading-none">{title}</span>
    </span>
  );
}

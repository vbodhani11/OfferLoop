import type { AvatarStyle } from "@/types/domain";
import { cn } from "@/lib/utils";

const patternOverlay: Record<AvatarStyle["pattern"], string> = {
  diagonal:
    "repeating-linear-gradient(45deg, rgba(255,255,255,0.18) 0 6px, transparent 6px 14px)",
  grid: "repeating-linear-gradient(0deg, rgba(255,255,255,0.15) 0 2px, transparent 2px 12px), repeating-linear-gradient(90deg, rgba(255,255,255,0.15) 0 2px, transparent 2px 12px)",
  waves:
    "repeating-radial-gradient(circle at 0 0, rgba(255,255,255,0.2) 0 4px, transparent 4px 16px)",
  dots: "radial-gradient(circle, rgba(255,255,255,0.35) 1.5px, transparent 1.5px)",
  rings:
    "repeating-radial-gradient(circle, rgba(255,255,255,0.2) 0 2px, transparent 2px 10px)",
};

export function CandidateAvatar({
  initials,
  avatarStyle,
  className,
}: {
  initials: string;
  avatarStyle: AvatarStyle;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative flex items-center justify-center overflow-hidden rounded-full text-lg font-semibold text-white",
        className,
      )}
      style={{
        backgroundImage: `linear-gradient(135deg, ${avatarStyle.gradientFrom}, ${avatarStyle.gradientTo}), ${patternOverlay[avatarStyle.pattern]}`,
        backgroundSize: "cover, 14px 14px",
      }}
      aria-hidden="true"
    >
      {initials}
    </div>
  );
}

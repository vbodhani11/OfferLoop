import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3",
        align === "center" && "items-center text-center",
        className,
      )}
    >
      {eyebrow ? (
        <span className="text-brand text-xs font-semibold tracking-wider uppercase">
          {eyebrow}
        </span>
      ) : null}
      <h2 className="text-foreground text-3xl font-semibold tracking-tight sm:text-4xl">
        {title}
      </h2>
      {description ? (
        <p className="text-muted-foreground max-w-2xl text-base leading-relaxed">
          {description}
        </p>
      ) : null}
    </div>
  );
}

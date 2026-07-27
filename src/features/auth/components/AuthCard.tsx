import type { ReactNode } from "react";
import Link from "next/link";
import { PageContainer } from "@/components/layout/PageContainer";
import { AppLogo } from "@/components/branding/AppLogo";
import { SimulationBadge } from "@/components/branding/SimulationBadge";

interface AuthCardProps {
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function AuthCard({ title, description, children, footer }: AuthCardProps) {
  return (
    <PageContainer className="flex min-h-[70vh] items-center justify-center py-12">
      <div className="flex w-full max-w-md flex-col gap-6">
        <div className="flex flex-col items-center gap-4 text-center">
          <Link href="/" className="focus-ring rounded">
            <AppLogo />
          </Link>
          <SimulationBadge />
        </div>
        <div className="border-border bg-surface flex flex-col gap-6 rounded-[var(--radius-lg)] border p-6 shadow-[var(--shadow-soft)] sm:p-8">
          <div className="flex flex-col gap-1.5 text-center">
            <h1 className="text-foreground text-xl font-semibold">{title}</h1>
            <p className="text-muted-foreground text-sm">{description}</p>
          </div>
          {children}
        </div>
        {footer ? (
          <p className="text-muted-foreground text-center text-sm">{footer}</p>
        ) : null}
      </div>
    </PageContainer>
  );
}

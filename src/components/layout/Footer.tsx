import Link from "next/link";
import { AppLogo } from "@/components/branding/AppLogo";
import { PageContainer } from "./PageContainer";

const columns = [
  {
    title: "Simulation",
    links: [
      { href: "/accept", label: "Accept Mode" },
      { href: "/reject", label: "Reject Mode" },
      { href: "/simulation", label: "Simulation Notice" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About" },
      { href: "/contact", label: "Contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/privacy", label: "Privacy Policy" },
      { href: "/terms", label: "Terms of Use" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-border bg-surface border-t">
      <PageContainer className="flex flex-col gap-10 py-12">
        <div className="flex flex-col gap-8 sm:flex-row sm:justify-between">
          <div className="flex max-w-sm flex-col gap-3">
            <AppLogo />
            <p className="text-muted-foreground text-sm">
              A fictional career simulator for real job-search stress. OfferLoop is an
              entertainment experience — no real jobs, employers, or candidates are
              involved.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {columns.map((column) => (
              <div key={column.title} className="flex flex-col gap-2.5">
                <span className="text-foreground text-sm font-semibold">
                  {column.title}
                </span>
                {column.links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="focus-ring text-muted-foreground hover:text-foreground rounded text-sm"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="border-border text-muted-foreground flex flex-col gap-2 border-t pt-6 text-xs sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} OfferLoop. All jobs, companies, and candidates
            are fictional.
          </p>
          <p>Not affiliated with LinkedIn or any real employment platform.</p>
        </div>
      </PageContainer>
    </footer>
  );
}

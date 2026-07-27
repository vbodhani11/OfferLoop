import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppProviders } from "@/components/providers/AppProviders";
import { AppHeader } from "@/components/layout/AppHeader";
import { Footer } from "@/components/layout/Footer";
import { ServiceWorkerRegister } from "@/components/pwa/ServiceWorkerRegister";
import { InstallPrompt } from "@/components/pwa/InstallPrompt";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: "OfferLoop — A Fictional Career Simulator",
    template: "%s · OfferLoop",
  },
  description:
    "Browse fictional jobs, receive simulated offers, and make imaginary recruiting decisions in a clearly labeled entertainment experience.",
  applicationName: "OfferLoop",
  manifest: "/manifest.webmanifest",
  openGraph: {
    title: "OfferLoop — A Fictional Career Simulator",
    description:
      "Get the offer. Make the decision. Repeat the loop. A clearly labeled entertainment simulation — not a real job board.",
    url: appUrl,
    siteName: "OfferLoop",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "OfferLoop — A Fictional Career Simulator",
    description: "A fictional career simulator for real job-search stress.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf8f5" },
    { media: "(prefers-color-scheme: dark)", color: "#12131a" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="bg-background text-foreground flex min-h-full flex-col">
        <AppProviders>
          <a
            href="#main-content"
            className="skip-link bg-brand text-brand-foreground rounded-[var(--radius-sm)] px-4 py-2 text-sm font-medium"
          >
            Skip to content
          </a>
          <AppHeader />
          <main id="main-content" className="flex flex-1 flex-col">
            {children}
          </main>
          <Footer />
          <ServiceWorkerRegister />
          <InstallPrompt />
        </AppProviders>
      </body>
    </html>
  );
}

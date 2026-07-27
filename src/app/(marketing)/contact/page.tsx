import type { Metadata } from "next";
import { PageContainer } from "@/components/layout/PageContainer";
import { SectionHeading } from "@/components/layout/SectionHeading";
import { ContactForm } from "@/features/marketing/components/ContactForm";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch about the OfferLoop simulation.",
};

export default function ContactPage() {
  return (
    <PageContainer className="flex max-w-xl flex-col gap-8 py-16">
      <SectionHeading
        eyebrow="Get in touch"
        title="Contact us"
        description="Questions, feedback, or a bug report? Send a note — this form does not connect to any real hiring process."
      />
      <ContactForm />
    </PageContainer>
  );
}

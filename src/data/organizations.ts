import type { Organization } from "@/types/domain";
import { deterministicUuid } from "../lib/ids/deterministicId";

/**
 * All organizations in OfferLoop are entirely fictional. Names, initials, and
 * descriptions were invented for this simulation and do not represent real
 * companies. `logoStyle` drives an abstract, generated SVG mark — no real logos
 * are used anywhere in the product.
 *
 * `id` fields below are placeholder slugs; the real UUID id assigned to each
 * organization is derived deterministically from its slug just before export
 * (see the bottom of this file) so it matches the corresponding row inserted
 * by the generated Supabase seed data.
 */
const RAW_ORGANIZATIONS: Organization[] = [
  {
    id: "org-nova-systems",
    slug: "nova-systems",
    name: "Nova Systems",
    initials: "NS",
    industry: "Enterprise Software",
    shortDescription:
      "A fictional enterprise software company known for imaginative SAP and cloud modernization simulations.",
    logoStyle: { gradientFrom: "#6366f1", gradientTo: "#22d3ee", pattern: "diagonal" },
    isFictional: true,
    isActive: true,
  },
  {
    id: "org-orbit-technologies",
    slug: "orbit-technologies",
    name: "Orbit Technologies",
    initials: "OT",
    industry: "Cloud Infrastructure",
    shortDescription:
      "A fictional cloud infrastructure studio simulating distributed systems at imaginary scale.",
    logoStyle: { gradientFrom: "#0ea5e9", gradientTo: "#6366f1", pattern: "rings" },
    isFictional: true,
    isActive: true,
  },
  {
    id: "org-bluepeak-consulting",
    slug: "bluepeak-consulting",
    name: "BluePeak Consulting",
    initials: "BP",
    industry: "Technology Consulting",
    shortDescription:
      "A fictional consulting practice simulating client delivery for imaginary Fortune-style accounts.",
    logoStyle: { gradientFrom: "#0284c7", gradientTo: "#0ea5e9", pattern: "grid" },
    isFictional: true,
    isActive: true,
  },
  {
    id: "org-quantum-manufacturing",
    slug: "quantum-manufacturing",
    name: "Quantum Manufacturing",
    initials: "QM",
    industry: "Industrial Manufacturing",
    shortDescription:
      "A fictional manufacturing group simulating smart-factory and industrial automation programs.",
    logoStyle: { gradientFrom: "#f97316", gradientTo: "#f59e0b", pattern: "waves" },
    isFictional: true,
    isActive: true,
  },
  {
    id: "org-northstar-software",
    slug: "northstar-software",
    name: "Northstar Software",
    initials: "NR",
    industry: "Product Software",
    shortDescription:
      "A fictional product software company simulating a modern SaaS roadmap and release cadence.",
    logoStyle: { gradientFrom: "#4f46e5", gradientTo: "#818cf8", pattern: "dots" },
    isFictional: true,
    isActive: true,
  },
  {
    id: "org-lantern-labs",
    slug: "lantern-labs",
    name: "Lantern Labs",
    initials: "LL",
    industry: "Artificial Intelligence",
    shortDescription:
      "A fictional applied-AI lab simulating research-to-product pipelines for imaginary customers.",
    logoStyle: { gradientFrom: "#f59e0b", gradientTo: "#facc15", pattern: "rings" },
    isFictional: true,
    isActive: true,
  },
  {
    id: "org-cedarbridge-engineering",
    slug: "cedarbridge-engineering",
    name: "Cedarbridge Engineering",
    initials: "CE",
    industry: "Civil & Structural Engineering",
    shortDescription:
      "A fictional civil and structural engineering firm simulating infrastructure design programs.",
    logoStyle: { gradientFrom: "#16a34a", gradientTo: "#65a30d", pattern: "grid" },
    isFictional: true,
    isActive: true,
  },
  {
    id: "org-meridian-digital",
    slug: "meridian-digital",
    name: "Meridian Digital",
    initials: "MD",
    industry: "Digital Product Studio",
    shortDescription:
      "A fictional digital product studio simulating design-led product teams.",
    logoStyle: { gradientFrom: "#db2777", gradientTo: "#a855f7", pattern: "waves" },
    isFictional: true,
    isActive: true,
  },
  {
    id: "org-apex-river-consulting",
    slug: "apex-river-consulting",
    name: "Apex River Consulting",
    initials: "AR",
    industry: "Business & Data Consulting",
    shortDescription:
      "A fictional consulting group simulating analytics and business-transformation engagements.",
    logoStyle: { gradientFrom: "#0f766e", gradientTo: "#14b8a6", pattern: "diagonal" },
    isFictional: true,
    isActive: true,
  },
  {
    id: "org-horizon-foundry",
    slug: "horizon-foundry",
    name: "Horizon Foundry",
    initials: "HF",
    industry: "Product Design & Engineering",
    shortDescription:
      "A fictional product foundry simulating cross-functional design and engineering pods.",
    logoStyle: { gradientFrom: "#7c3aed", gradientTo: "#c084fc", pattern: "dots" },
    isFictional: true,
    isActive: true,
  },
  {
    id: "org-vertex-grove",
    slug: "vertex-grove",
    name: "Vertex Grove",
    initials: "VG",
    industry: "Data & Analytics",
    shortDescription:
      "A fictional data and analytics company simulating modern warehouse and BI platforms.",
    logoStyle: { gradientFrom: "#2563eb", gradientTo: "#38bdf8", pattern: "grid" },
    isFictional: true,
    isActive: true,
  },
  {
    id: "org-silverline-infrastructure",
    slug: "silverline-infrastructure",
    name: "Silverline Infrastructure",
    initials: "SI",
    industry: "Construction & Infrastructure",
    shortDescription:
      "A fictional infrastructure company simulating construction-technology and civil programs.",
    logoStyle: { gradientFrom: "#64748b", gradientTo: "#94a3b8", pattern: "waves" },
    isFictional: true,
    isActive: true,
  },
  {
    id: "org-harborstack",
    slug: "harborstack",
    name: "HarborStack",
    initials: "HS",
    industry: "Cloud Platform Engineering",
    shortDescription:
      "A fictional cloud platform company simulating developer-tooling and reliability engineering.",
    logoStyle: { gradientFrom: "#0891b2", gradientTo: "#67e8f9", pattern: "rings" },
    isFictional: true,
    isActive: true,
  },
  {
    id: "org-mosaic-grid",
    slug: "mosaic-grid",
    name: "Mosaic Grid",
    initials: "MG",
    industry: "Cybersecurity",
    shortDescription:
      "A fictional cybersecurity company simulating threat-detection and security-platform work.",
    logoStyle: { gradientFrom: "#dc2626", gradientTo: "#f97316", pattern: "diagonal" },
    isFictional: true,
    isActive: true,
  },
  {
    id: "org-cloudcrest-technologies",
    slug: "cloudcrest-technologies",
    name: "CloudCrest Technologies",
    initials: "CC",
    industry: "DevOps & Platform",
    shortDescription:
      "A fictional platform-engineering company simulating DevOps and reliability practices.",
    logoStyle: { gradientFrom: "#0d9488", gradientTo: "#22d3ee", pattern: "grid" },
    isFictional: true,
    isActive: true,
  },
  {
    id: "org-evertrail-engineering",
    slug: "evertrail-engineering",
    name: "Evertrail Engineering",
    initials: "EE",
    industry: "Civil Engineering",
    shortDescription:
      "A fictional civil-engineering company simulating transportation and site-development projects.",
    logoStyle: { gradientFrom: "#65a30d", gradientTo: "#a3e635", pattern: "dots" },
    isFictional: true,
    isActive: true,
  },
  {
    id: "org-brightforge",
    slug: "brightforge",
    name: "BrightForge",
    initials: "BF",
    industry: "Product Management & Strategy",
    shortDescription:
      "A fictional product organization simulating strategy, discovery, and roadmap ownership.",
    logoStyle: { gradientFrom: "#eab308", gradientTo: "#fb923c", pattern: "waves" },
    isFictional: true,
    isActive: true,
  },
  {
    id: "org-astralworks",
    slug: "astralworks",
    name: "AstralWorks",
    initials: "AW",
    industry: "Artificial Intelligence",
    shortDescription:
      "A fictional AI product company simulating applied-ML feature teams end to end.",
    logoStyle: { gradientFrom: "#4338ca", gradientTo: "#a78bfa", pattern: "rings" },
    isFictional: true,
    isActive: true,
  },
];

export const organizations: Organization[] = RAW_ORGANIZATIONS.map((org) => ({
  ...org,
  id: deterministicUuid(`organization:${org.slug}`),
}));

export function getOrganizationBySlug(slug: string): Organization | undefined {
  return organizations.find((org) => org.slug === slug);
}

export function getOrganizationById(id: string): Organization | undefined {
  return organizations.find((org) => org.id === id);
}

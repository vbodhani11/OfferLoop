import type { JobCategory } from "@/types/domain";

/**
 * Shared descriptive building blocks used to assemble varied, original fictional
 * job copy per category without hand-writing 36 fully bespoke essays. Every
 * sentence here was written for OfferLoop and describes only fictional work.
 */
export const CATEGORY_FLAVOR: Record<
  JobCategory,
  {
    intro: string;
    responsibilities: string[];
    qualifications: string[];
    skills: string[];
  }
> = {
  software_engineering: {
    intro:
      "you will design and ship features across a fictional product used by an imaginary customer base",
    responsibilities: [
      "Design and implement fictional services that power the simulated product surface",
      "Partner with an imaginary design team to translate concepts into working software",
      "Write automated tests that keep the simulated codebase easy to change safely",
      "Participate in fictional code reviews and mentor other simulated engineers",
    ],
    qualifications: [
      "Comfort working across a modern web stack in a simulated production environment",
      "A track record of shipping fictional features from design through release",
      "Strong fundamentals in data structures, testing, and API design",
    ],
    skills: ["TypeScript", "React", "Node.js", "PostgreSQL", "REST APIs"],
  },
  sap_enterprise_systems: {
    intro:
      "you will configure and extend a fictional SAP landscape supporting an imaginary global operation",
    responsibilities: [
      "Configure fictional SAP modules to match simulated business processes",
      "Partner with imaginary finance and operations stakeholders on requirements",
      "Build custom ABAP extensions for the simulated enterprise landscape",
      "Support simulated cutover events and post-launch stabilization",
    ],
    qualifications: [
      "Experience configuring enterprise resource planning systems in a simulated setting",
      "Familiarity with core financial or logistics modules and their fictional data flows",
      "Ability to translate simulated business requirements into system configuration",
    ],
    skills: ["SAP S/4HANA", "ABAP", "Fiori", "SAP MM", "Process Design"],
  },
  data_engineering: {
    intro:
      "you will build the fictional pipelines that keep simulated data flowing reliably",
    responsibilities: [
      "Design fictional ELT pipelines feeding the simulated analytics warehouse",
      "Monitor simulated data quality and resolve pipeline incidents",
      "Model fictional datasets for downstream imaginary analytics teams",
      "Automate simulated infrastructure for data ingestion and transformation",
    ],
    qualifications: [
      "Experience building resilient data pipelines in a simulated cloud environment",
      "Strong SQL and a working knowledge of distributed data processing concepts",
      "Comfort partnering with imaginary analytics and product stakeholders",
    ],
    skills: ["Python", "SQL", "Airflow", "dbt", "Cloud Data Warehouses"],
  },
  artificial_intelligence: {
    intro:
      "you will build and evaluate fictional machine-learning features for a simulated product",
    responsibilities: [
      "Prototype fictional models and evaluate them against simulated success metrics",
      "Partner with imaginary product teams to define what a fictional model should do",
      "Build simulated evaluation harnesses to catch regressions before fictional launch",
      "Document simulated model behavior and known limitations transparently",
    ],
    qualifications: [
      "Experience training, evaluating, or deploying machine-learning models",
      "Comfort with experimentation and reading simulated evaluation results critically",
      "Strong Python skills and familiarity with common ML tooling",
    ],
    skills: ["Python", "PyTorch", "Evaluation Design", "Vector Search", "MLOps"],
  },
  product_management: {
    intro:
      "you will own a fictional product area end-to-end for a simulated customer base",
    responsibilities: [
      "Define the fictional roadmap in partnership with imaginary engineering leads",
      "Run simulated discovery interviews to validate fictional customer problems",
      "Write clear fictional specs and prioritize the simulated backlog",
      "Track simulated launch metrics and iterate based on the results",
    ],
    qualifications: [
      "Experience owning a product area from discovery through simulated launch",
      "Comfort making prioritization calls with incomplete simulated information",
      "Strong written and verbal communication across imaginary stakeholders",
    ],
    skills: ["Roadmapping", "Discovery", "Analytics", "Stakeholder Communication"],
  },
  civil_engineering: {
    intro:
      "you will support the design of fictional infrastructure projects from concept through simulated delivery",
    responsibilities: [
      "Develop fictional site designs in coordination with imaginary municipal reviewers",
      "Prepare simulated drawings and specifications for infrastructure elements",
      "Support fictional field inspections during simulated construction phases",
      "Coordinate with imaginary contractors on simulated project sequencing",
    ],
    qualifications: [
      "Familiarity with civil design software and simulated permitting processes",
      "Understanding of fictional site grading, drainage, and utility coordination",
      "Strong attention to detail across simulated drawing sets",
    ],
    skills: ["AutoCAD Civil 3D", "Site Design", "Drainage Analysis", "Permitting"],
  },
  structural_engineering: {
    intro:
      "you will analyze and design fictional structural systems for simulated buildings",
    responsibilities: [
      "Perform fictional structural analysis for simulated building systems",
      "Prepare simulated calculations and drawings for structural elements",
      "Coordinate with imaginary architects on simulated design constraints",
      "Review fictional shop drawings during simulated construction administration",
    ],
    qualifications: [
      "Experience with structural analysis software in a simulated design context",
      "Understanding of fictional building codes and simulated load paths",
      "Comfort collaborating across imaginary multidisciplinary design teams",
    ],
    skills: ["Structural Analysis", "AutoCAD", "Revit", "Load Calculations"],
  },
  construction_technology: {
    intro:
      "you will bring fictional digital tools onto simulated job sites to improve delivery",
    responsibilities: [
      "Deploy fictional construction-technology tools across simulated project sites",
      "Train imaginary field teams on simulated digital workflows",
      "Analyze simulated project data to flag schedule or quality risks early",
      "Partner with fictional vendors to pilot new simulated site technology",
    ],
    qualifications: [
      "Interest in applying technology to simulated construction workflows",
      "Comfort working with both fictional field teams and simulated data tools",
      "Familiarity with BIM or project-management software",
    ],
    skills: ["BIM", "Project Data Analysis", "Field Technology", "Scheduling Tools"],
  },
  ux_product_design: {
    intro:
      "you will design fictional experiences that make a simulated product feel effortless",
    responsibilities: [
      "Design fictional flows and interface details for the simulated product",
      "Run simulated usability sessions with imaginary participants",
      "Maintain the shared design system used across simulated product surfaces",
      "Partner closely with fictional engineers during simulated implementation",
    ],
    qualifications: [
      "A portfolio demonstrating simulated end-to-end product design work",
      "Comfort with prototyping tools and simulated usability research",
      "Strong visual and interaction design fundamentals",
    ],
    skills: ["Figma", "Prototyping", "Design Systems", "Usability Research"],
  },
  cybersecurity: {
    intro: "you will help protect a fictional environment against simulated threats",
    responsibilities: [
      "Monitor simulated systems for suspicious fictional activity",
      "Run simulated vulnerability assessments across fictional infrastructure",
      "Partner with imaginary engineering teams to remediate simulated findings",
      "Maintain simulated incident-response runbooks and playbooks",
    ],
    qualifications: [
      "Understanding of common attack patterns in a simulated environment",
      "Experience with security tooling and simulated log analysis",
      "Clear communication skills for simulated incident reporting",
    ],
    skills: ["SIEM", "Threat Detection", "Vulnerability Management", "Cloud Security"],
  },
  cloud_engineering: {
    intro:
      "you will build and operate the fictional cloud infrastructure behind a simulated platform",
    responsibilities: [
      "Design fictional cloud architecture for simulated workloads",
      "Automate simulated infrastructure provisioning with infrastructure-as-code",
      "Monitor simulated systems for reliability and simulated cost efficiency",
      "Support imaginary teams migrating workloads onto the simulated platform",
    ],
    qualifications: [
      "Experience operating cloud infrastructure at a simulated production scale",
      "Comfort with infrastructure-as-code and simulated observability tooling",
      "Strong troubleshooting skills across simulated distributed systems",
    ],
    skills: ["AWS", "Terraform", "Kubernetes", "Observability"],
  },
  business_analysis: {
    intro:
      "you will translate fictional business needs into clear simulated requirements",
    responsibilities: [
      "Gather fictional requirements from imaginary business stakeholders",
      "Document simulated process flows and identify improvement opportunities",
      "Partner with fictional engineering teams to validate simulated solutions",
      "Track simulated project outcomes against the original business case",
    ],
    qualifications: [
      "Experience gathering and documenting requirements in a simulated setting",
      "Strong analytical skills and comfort with simulated process mapping",
      "Clear communication across imaginary technical and business audiences",
    ],
    skills: [
      "Requirements Gathering",
      "Process Mapping",
      "SQL",
      "Stakeholder Management",
    ],
  },
  quality_assurance: {
    intro:
      "you will help make sure a fictional product behaves reliably for simulated users",
    responsibilities: [
      "Design simulated test plans covering fictional product functionality",
      "Build and maintain automated tests for the simulated product surface",
      "Triage fictional defects and partner with engineers on simulated fixes",
      "Advocate for simulated quality practices across the fictional team",
    ],
    qualifications: [
      "Experience designing test strategies for a simulated software product",
      "Comfort writing automated tests and reading simulated bug reports critically",
      "Strong attention to detail across simulated edge cases",
    ],
    skills: ["Test Automation", "Playwright", "Test Planning", "Bug Triage"],
  },
  devops: {
    intro:
      "you will streamline how a fictional team ships and operates simulated software",
    responsibilities: [
      "Build and maintain simulated CI/CD pipelines for fictional services",
      "Improve simulated deployment reliability and rollback safety",
      "Partner with fictional engineering teams on simulated release practices",
      "Maintain simulated infrastructure monitoring and alerting",
    ],
    qualifications: [
      "Experience operating CI/CD pipelines in a simulated environment",
      "Comfort with containerization and simulated infrastructure automation",
      "Strong troubleshooting skills under simulated incident pressure",
    ],
    skills: ["CI/CD", "Docker", "Kubernetes", "Infrastructure as Code"],
  },
  analytics: {
    intro:
      "you will turn fictional data into decisions for a simulated product organization",
    responsibilities: [
      "Build simulated dashboards tracking fictional product and business metrics",
      "Partner with imaginary product teams to design simulated experiments",
      "Investigate simulated anomalies in fictional usage data",
      "Present simulated findings clearly to fictional stakeholders",
    ],
    qualifications: [
      "Strong SQL skills and experience with simulated data visualization tools",
      "Comfort designing and interpreting simulated experiments",
      "Clear storytelling with simulated data for non-technical audiences",
    ],
    skills: ["SQL", "Experimentation", "Data Visualization", "Statistics"],
  },
  project_management: {
    intro:
      "you will keep fictional cross-functional projects on track from kickoff to simulated delivery",
    responsibilities: [
      "Coordinate simulated timelines across fictional cross-functional teams",
      "Track simulated risks and communicate status to imaginary stakeholders",
      "Facilitate simulated planning ceremonies and retrospectives",
      "Maintain clear simulated documentation of decisions and next steps",
    ],
    qualifications: [
      "Experience coordinating cross-functional projects in a simulated setting",
      "Strong organizational skills and comfort with simulated ambiguity",
      "Clear, proactive communication across imaginary teams",
    ],
    skills: [
      "Project Planning",
      "Risk Management",
      "Agile Facilitation",
      "Communication",
    ],
  },
};

export const BENEFIT_POOL = [
  "Simulated comprehensive health coverage",
  "Simulated flexible time off",
  "Fictional 401(k)-style matching program",
  "Simulated home-office stipend",
  "Fictional annual learning budget",
  "Simulated parental leave program",
  "Fictional wellness reimbursement",
  "Simulated hybrid commuter benefit",
];

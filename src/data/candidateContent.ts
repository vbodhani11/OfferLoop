import type { JobCategory } from "@/types/domain";

export const CANDIDATE_CATEGORY_FLAVOR: Record<
  JobCategory,
  {
    headlineSuffix: string;
    summaryTemplates: string[];
    skills: string[];
    achievements: string[];
  }
> = {
  software_engineering: {
    headlineSuffix: "Software Engineer",
    summaryTemplates: [
      "Enjoys turning ambiguous fictional requirements into dependable simulated software.",
      "Has spent several simulated years building web products end to end.",
      "Known in the simulation for pragmatic code reviews and calm incident response.",
    ],
    skills: ["TypeScript", "React", "Node.js", "GraphQL"],
    achievements: ["Led a simulated migration to a modern frontend framework"],
  },
  sap_enterprise_systems: {
    headlineSuffix: "SAP Consultant",
    summaryTemplates: [
      "Specializes in configuring fictional SAP landscapes for simulated global teams.",
      "Bridges simulated finance operations and enterprise systems fluently.",
    ],
    skills: ["SAP S/4HANA", "ABAP", "Fiori", "Process Design"],
    achievements: ["Delivered a simulated multi-region SAP rollout"],
  },
  data_engineering: {
    headlineSuffix: "Data Engineer",
    summaryTemplates: [
      "Builds resilient fictional pipelines that simulated analytics teams trust.",
      "Cares deeply about data quality across every simulated pipeline stage.",
    ],
    skills: ["Python", "SQL", "Airflow", "dbt"],
    achievements: ["Cut simulated pipeline failure rate significantly"],
  },
  artificial_intelligence: {
    headlineSuffix: "AI/ML Engineer",
    summaryTemplates: [
      "Prototypes fictional ML features and evaluates them rigorously before simulated launch.",
      "Comfortable moving between simulated research notebooks and production code.",
    ],
    skills: ["Python", "PyTorch", "Evaluation Design"],
    achievements: ["Shipped a simulated recommendation feature end to end"],
  },
  product_management: {
    headlineSuffix: "Product Manager",
    summaryTemplates: [
      "Runs tight simulated discovery loops before committing to a fictional roadmap.",
      "Balances fictional customer needs with simulated business constraints.",
    ],
    skills: ["Roadmapping", "Discovery", "Analytics"],
    achievements: ["Launched a simulated product line from zero to steady adoption"],
  },
  civil_engineering: {
    headlineSuffix: "Civil Engineer",
    summaryTemplates: [
      "Has coordinated fictional site designs across several simulated municipalities.",
      "Detail-oriented about simulated drainage, grading, and utility coordination.",
    ],
    skills: ["AutoCAD Civil 3D", "Site Design", "Permitting"],
    achievements: ["Delivered a simulated corridor project ahead of schedule"],
  },
  structural_engineering: {
    headlineSuffix: "Structural Engineer",
    summaryTemplates: [
      "Enjoys the puzzle of simulated load paths on unusual fictional building shapes.",
      "Has reviewed simulated shop drawings for several fictional mid-rise projects.",
    ],
    skills: ["Structural Analysis", "Revit", "Load Calculations"],
    achievements: ["Designed the structural system for a simulated mixed-use building"],
  },
  construction_technology: {
    headlineSuffix: "Construction Technologist",
    summaryTemplates: [
      "Brings fictional digital workflows onto simulated job sites without disrupting crews.",
      "Translates simulated field data into decisions project leads actually use.",
    ],
    skills: ["BIM", "Scheduling Tools", "Field Technology"],
    achievements: ["Rolled out a simulated BIM workflow across several fictional sites"],
  },
  ux_product_design: {
    headlineSuffix: "Product Designer",
    summaryTemplates: [
      "Designs fictional interfaces that feel obvious in hindsight.",
      "Pairs closely with simulated engineers from concept through shipped detail.",
    ],
    skills: ["Figma", "Prototyping", "Design Systems"],
    achievements: [
      "Rebuilt a simulated design system adopted across every product surface",
    ],
  },
  cybersecurity: {
    headlineSuffix: "Security Engineer",
    summaryTemplates: [
      "Thinks like a fictional attacker to keep simulated systems safer.",
      "Has led simulated incident response for several fictional security events.",
    ],
    skills: ["SIEM", "Threat Detection", "Cloud Security"],
    achievements: ["Reduced simulated mean-time-to-detect for a fictional security team"],
  },
  cloud_engineering: {
    headlineSuffix: "Cloud Engineer",
    summaryTemplates: [
      "Operates fictional cloud infrastructure with an eye for simulated cost efficiency.",
      "Automates everything that can be automated on the simulated platform.",
    ],
    skills: ["AWS", "Terraform", "Kubernetes"],
    achievements: ["Migrated a simulated workload to a multi-region architecture"],
  },
  business_analysis: {
    headlineSuffix: "Business Analyst",
    summaryTemplates: [
      "Turns fuzzy fictional requirements into requirements engineers can build from.",
      "Comfortable mapping simulated processes across several imaginary departments.",
    ],
    skills: ["Requirements Gathering", "Process Mapping", "SQL"],
    achievements: ["Streamlined a simulated intake process across three fictional teams"],
  },
  quality_assurance: {
    headlineSuffix: "QA Engineer",
    summaryTemplates: [
      "Finds the fictional edge cases before simulated users do.",
      "Builds automated coverage that simulated teams actually keep up to date.",
    ],
    skills: ["Test Automation", "Playwright", "Test Planning"],
    achievements: ["Built a simulated regression suite covering critical product flows"],
  },
  devops: {
    headlineSuffix: "DevOps Engineer",
    summaryTemplates: [
      "Makes fictional deploys boring, in the best possible way.",
      "Has stabilized simulated release pipelines for fast-moving fictional teams.",
    ],
    skills: ["CI/CD", "Docker", "Kubernetes"],
    achievements: ["Cut simulated deployment time from hours to minutes"],
  },
  analytics: {
    headlineSuffix: "Analytics Lead",
    summaryTemplates: [
      "Turns fictional dashboards into decisions simulated teams actually act on.",
      "Designs simulated experiments that hold up to scrutiny.",
    ],
    skills: ["SQL", "Experimentation", "Data Visualization"],
    achievements: ["Built the simulated experimentation framework used company-wide"],
  },
  project_management: {
    headlineSuffix: "Project Manager",
    summaryTemplates: [
      "Keeps fictional cross-functional projects calm, clear, and on schedule.",
      "Known in the simulation for proactive risk flags well before they matter.",
    ],
    skills: ["Project Planning", "Risk Management", "Agile Facilitation"],
    achievements: ["Delivered a simulated multi-team program on time and on budget"],
  },
};

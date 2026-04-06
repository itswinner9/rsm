import type { OptimizedResumeData } from "@/lib/resume/types";

/**
 * Fictional sample resume for marketing previews (landing template gallery).
 * Same facts across all layouts so visitors can compare structure.
 */
export const demoResumeForMarketing: OptimizedResumeData = {
  full_name: "Alex Morgan",
  headline: "Product Operations · Program delivery",
  email: "alex.morgan@email.com",
  phone: "(555) 014-2201",
  location: "Toronto, ON",
  linkedin: "linkedin.com/in/alexmorgan-sample",
  summary:
    "Operations lead with a track record of shipping cross-functional programs: scope, timelines, and stakeholder alignment. Comfortable with ambiguity; strong written communication and metrics hygiene.",
  skills: [
    "Program management",
    "Stakeholder communication",
    "Process improvement",
    "SQL (basics)",
    "Documentation",
    "Vendor coordination",
  ],
  experience: [
    {
      title: "Senior Program Coordinator",
      company: "Northwind Collective (sample)",
      location: "Remote · Canada",
      dates: "2021 — Present",
      bullets: [
        "Owned quarterly planning rituals for a 12-person pod; reduced missed milestones by clarifying owners and exit criteria.",
        "Partnered with hiring managers to standardize role briefs; shortened time-to-first-screen for high-volume reqs.",
        "Published weekly status notes for leadership; surfaced risks early with proposed mitigations.",
      ],
    },
    {
      title: "Operations Analyst",
      company: "Harborline Services (sample)",
      location: "Toronto, ON",
      dates: "2018 — 2021",
      bullets: [
        "Maintained operational dashboards; flagged anomalies and coordinated follow-ups with account teams.",
        "Supported vendor renewals: requirements gathering, comparisons, and decision memos.",
      ],
    },
  ],
  education: [
    {
      institution: "Sample University",
      credential: "B.A. — Business Administration",
      dates: "2014 — 2018",
      details: ["Dean’s list (two terms)"],
    },
  ],
  certifications: ["Sample Foundations Certificate (2020)"],
  projects: [
    {
      name: "Volunteer intake refresh (sample)",
      description: "Non-profit",
      bullets: [
        "Redesigned a two-page volunteer form into a guided flow; fewer abandoned submissions in pilot.",
      ],
    },
  ],
};

// All portfolio copy and links live here, so updating content never means touching components.

/**
 * Every "Resume" / "Get CV" button downloads this file. To update the CV, upload a new PDF named
 * exactly `Selva-Jaya-Resume.pdf` to the root of the `master` branch; no code change needed.
 */
export const RESUME_URL =
  "https://raw.githubusercontent.com/selvajayarose/selvajaya/master/Selva-Jaya-Resume.pdf";

export const EMAIL = "selvajayarose@gmail.com";
export const LINKEDIN = "https://www.linkedin.com/in/selva-jaya-8a406a1b0/";
export const GITHUB = "https://github.com/selvajayarose";

export const NAV_LINKS = [
  { href: "#about", num: "01.", label: "About" },
  { href: "#work", num: "02.", label: "Work" },
  { href: "#contact", num: "03.", label: "Contact" },
] as const;

export type Milestone = {
  /** Mono kicker above the title, e.g. "2021 · TECHJAYS" */
  kicker: string;
  title: string;
  body: string;
  tags: string[];
  /** Short label for the timeline rail */
  rail: string;
};

export const MILESTONES: Milestone[] = [
  {
    kicker: "2021 · TECHJAYS",
    title: "Joined Techjays",
    body: "Started as a frontend developer in Coimbatore, turning Figma and Adobe XD designs into pixel-perfect, responsive UIs. Now a Senior AI Engineer, working remotely.",
    tags: ["Pixel-perfect UI", "React", "TypeScript", "Vue.js"],
    rail: "Techjays · 2021",
  },
  {
    kicker: "MIGRATION",
    title: "Angular → React",
    body: "Led the migration of a legacy Angular app for multi-region clients and built a reusable component library along the way.",
    tags: ["React", "Redux", "Material UI", "AWS Amplify"],
    rail: "Angular → React",
  },
  {
    kicker: "2023",
    title: "High Flyer Award",
    body: "Recognised for a scalable frontend architecture that cut development time by 30% and bugs by 35%.",
    tags: ["−30% dev time", "−35% bugs", "mentored 3 devs"],
    rail: "High Flyer · 2023",
  },
  {
    kicker: "MAY 2024",
    title: "MA, English Literature",
    body: "Alagappa University. Words still shape how I design interfaces, write UX copy and explain systems.",
    tags: ["Product thinking", "UX writing"],
    rail: "MA · 2024",
  },
  {
    kicker: "FLAGSHIP",
    title: "AimeeSays",
    body: "An LLM-powered chatbot for abuse survivors, with two-way voice for discreet, hands-free conversations. I built chat, document processing and auth, from the tRPC API through to the React UI.",
    tags: ["Next.js", "tRPC", "Prisma", "LLM"],
    rail: "AimeeSays",
  },
  {
    kicker: "NOW",
    title: "AI-driven engineering",
    body: "Claude agent skills and Playwright MCP automate UAT, debugging and PR review on every pull request.",
    tags: ["Claude Code", "Agent SDK", "Playwright MCP"],
    rail: "Now",
  },
];

export type Project = {
  kicker: string;
  title: string;
  /** Plain text; wrap inline code in backticks, e.g. `/uat → plan` */
  body: string;
  impact: string;
  stack: string[];
};

export const PROJECTS: Project[] = [
  {
    kicker: "LLM · Accessibility",
    title: "AimeeSays",
    body: "An AI chatbot for abuse survivors. Two-way voice (speech-to-text and text-to-speech) enables discreet, hands-free conversations.",
    impact: "Chat · document processing · auth, from tRPC API to React UI",
    stack: ["Next.js", "tRPC", "Prisma"],
  },
  {
    kicker: "Migration · Leadership",
    title: "Angular → React",
    body: "Led a legacy migration for multi-region clients and built a pixel-perfect, reusable component library along the way.",
    impact: "−30% dev time · −35% bugs · High Flyer 2023",
    stack: ["React", "Redux", "MUI", "Amplify"],
  },
  {
    kicker: "AI · DevEx",
    title: "AI UAT Pipeline",
    body: "Claude agent skills and Playwright MCP run a full UAT cycle on every pull request: `/uat → plan → run → promote`.",
    impact: "Merges blocked on failure",
    stack: ["Claude SDK", "MCP", "GH Actions"],
  },
];

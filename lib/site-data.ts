import {
  Bot,
  BrainCircuit,
  BriefcaseBusiness,
  Code2,
  FileSearch2,
  Gauge,
  Globe2,
  Layers3,
  PenSquare,
  Rocket,
  ShieldCheck,
  Sparkles,
  Workflow,
} from "lucide-react";

export const navItems = [
  { label: "Problem", href: "#problem" },
  { label: "Solution", href: "#solution" },
  { label: "Packs", href: "#packs" },
  { label: "Bundles", href: "#bundles" },
  { label: "Ops Console", href: "/hackathon" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
];

export const painPoints = [
  {
    title: "Prompt quality is inconsistent",
    description:
      "Teams waste hours rewriting prompts that still produce unstable outputs across different agent models.",
    icon: Gauge,
  },
  {
    title: "No reusable system",
    description:
      "Most operators rely on scattered docs and ad-hoc snippets instead of production-ready prompt frameworks.",
    icon: Workflow,
  },
  {
    title: "Expensive trial-and-error",
    description:
      "Token costs grow quickly when prompts are not optimized for reasoning depth, tool use, and context windows.",
    icon: Globe2,
  },
  {
    title: "Cross-model portability is weak",
    description:
      "Prompts built for one model often break with Hermes, Nemotron, Claude, Cursor, or Grok without adaptation.",
    icon: Bot,
  },
];

export const promptPacks = [
  {
    title: "Business Operator Pack",
    description: "Strategic planning, offer design, GTM positioning, and automated growth loops.",
    icon: BriefcaseBusiness,
  },
  {
    title: "Research Agent Pack",
    description: "Deep web research workflows, synthesis templates, and fact-checking guardrails.",
    icon: FileSearch2,
  },
  {
    title: "Content Operator Pack",
    description: "High-converting content systems for X, LinkedIn, email, video scripts, and blogs.",
    icon: PenSquare,
  },
  {
    title: "Coding Agent Pack",
    description: "Production coding prompts for architecture, bug triage, refactor plans, and code review.",
    icon: Code2,
  },
  {
    title: "Automation Architect Pack",
    description: "Prompt chains for multi-step autonomous execution with safety checks and retries.",
    icon: Layers3,
  },
  {
    title: "Decision Intelligence Pack",
    description: "Reasoning prompts for prioritization, risk analysis, and executive-ready recommendations.",
    icon: BrainCircuit,
  },
  {
    title: "Launch Sprint Pack",
    description: "Zero-to-launch playbooks for landing pages, pricing tests, and funnel iteration.",
    icon: Rocket,
  },
  {
    title: "Safety and Alignment Pack",
    description: "Guardrail prompts to reduce hallucination, enforce policy, and improve response reliability.",
    icon: ShieldCheck,
  },
];

export const bundles = [
  {
    name: "Starter",
    target: "Solo builders",
    description: "Core operating prompts to ship faster without overwhelm.",
    bullets: [
      "4 premium prompt packs",
      "Model adaptation cheatsheet",
      "Prompt QA checklist",
      "1 year of updates",
    ],
  },
  {
    name: "Professional",
    target: "Operators and teams",
    description: "The best value for founders and AI-native teams scaling execution.",
    bullets: [
      "All 8 premium prompt packs",
      "Advanced chaining templates",
      "Team collaboration playbook",
      "Priority update channel",
    ],
    highlighted: true,
  },
  {
    name: "Ultimate",
    target: "Power users",
    description: "Complete prompt operating system with bonus launch assets.",
    bullets: [
      "Everything in Professional",
      "30 done-for-you workflows",
      "Private bonus vault",
      "Lifetime updates",
    ],
  },
];

export const testimonials = [
  {
    name: "Lina Tran",
    role: "AI Product Lead, Aurora Labs",
    quote:
      "AutoPrompt Kit transformed our autonomous agent stack in one weekend. Output quality went up immediately.",
    avatar: "LT",
  },
  {
    name: "Kaito Mori",
    role: "Indie Founder",
    quote:
      "I cut prompt iteration time by roughly 70%. The coding and research packs alone paid for themselves on day one.",
    avatar: "KM",
  },
  {
    name: "Anya Kovac",
    role: "Growth Operator",
    quote:
      "The content operator pack feels like hiring a strategic editor and conversion copywriter in one toolset.",
    avatar: "AK",
  },
  {
    name: "Duy Nguyen",
    role: "Automation Consultant",
    quote:
      "Cross-model compatibility is excellent. It works reliably across Claude, Cursor, and Nemotron workflows.",
    avatar: "DN",
  },
  {
    name: "Marco Silva",
    role: "CTO, Synaptic Forge",
    quote:
      "The safety prompts added structure and confidence for client-facing AI automations. Highly recommended.",
    avatar: "MS",
  },
];

type PricingPlan = {
  id: "starter" | "professional" | "ultimate";
  title: string;
  price: string;
  oneTime: string;
  description: string;
  cta: string;
  features: string[];
  highlighted?: boolean;
  badge?: string;
};

export const pricingPlans: PricingPlan[] = [
  {
    id: "starter",
    title: "Starter",
    price: "$49",
    oneTime: "one-time",
    description: "Get the essentials and deploy better prompts in hours.",
    cta: "Buy Starter",
    features: [
      "4 prompt packs",
      "Quick-start playbook",
      "Model tuning guide",
      "12-month updates",
    ],
  },
  {
    id: "professional",
    title: "Professional",
    price: "$99",
    oneTime: "one-time",
    description: "The best balance for serious builders and operators.",
    cta: "Buy Professional",
    features: [
      "All 8 prompt packs",
      "Prompt chaining templates",
      "Agent system architecture map",
      "Priority support",
    ],
    highlighted: true,
    badge: "Most Popular",
  },
  {
    id: "ultimate",
    title: "Ultimate",
    price: "$199",
    oneTime: "one-time",
    description: "Complete system plus premium bonuses and lifetime upgrades.",
    cta: "Buy Ultimate",
    features: [
      "Everything in Professional",
      "30 launch-ready workflows",
      "Bonus private vault",
      "Lifetime updates",
    ],
  },
] ;

export type PlanId = (typeof pricingPlans)[number]["id"];

export const faqItems = [
  {
    question: "Will this work with Hermes, Nemotron, Claude, Cursor, and Grok?",
    answer:
      "Yes. Every pack includes compatibility notes and adaptation instructions so you can move between major autonomous agent models quickly.",
  },
  {
    question: "Is this beginner-friendly?",
    answer:
      "Yes. Starter-level onboarding templates are included. You can use the prompts immediately, then gradually adopt advanced chaining workflows.",
  },
  {
    question: "Do I receive updates?",
    answer:
      "Starter and Professional include one year of updates. Ultimate includes lifetime updates.",
  },
  {
    question: "How do I access files after payment?",
    answer:
      "After successful checkout, you are redirected to a success page with instructions and your download access flow.",
  },
  {
    question: "Can I use this with my team?",
    answer:
      "Professional and Ultimate are ideal for teams. For larger internal distribution, use Ultimate and contact support for an extended license.",
  },
];

export const trustedBy = [
  "Agentic Labs",
  "ForgeOps",
  "NeuralScale",
  "PromptFoundry",
  "StackPilot",
  "HyperPrompt",
];

export const brandName = "AutoPrompt Kit";
export const heroTitle = "Unlock the Full Power of Autonomous AI Agents";
export const heroSubtitle =
  "A premium collection of battle-tested Prompt Packs engineered for Hermes, Nemotron, Claude, Cursor, Grok, and the next generation of autonomous systems.";

export const sectionBadge = {
  icon: Sparkles,
  text: "Premium Prompt Operating System",
};

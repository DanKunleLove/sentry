/**
 * Typed content schema for Sentry.
 * These are the source-of-truth shapes used across content files in /src/content.
 */

export interface ImageAsset {
  src: string;
  alt: string;
  width: number;
  height: number;
  blurDataURL?: string;
}

export type WorkCategory =
  | "ai"
  | "automation"
  | "full-stack"
  | "mobile"
  | "platform"
  | "infra"
  | "voice"
  | "creative-ai"
  | "agent";

export type WorkStatus = "live" | "in-development" | "shipped" | "concept";

export interface Work {
  slug: string;
  title: string;
  tagline: string;
  year: number;
  client?: string;
  role: string;
  status: WorkStatus;
  categories: WorkCategory[];
  stack: string[];
  cover: ImageAsset;
  gallery?: ImageAsset[];
  links?: { label: string; href: string }[];
  metrics?: { label: string; value: string }[];
  summary: string;
  /**
   * Engineering-reasoning block — the "why this architecture" paragraph.
   * NOT a physics identity statement; references first-principles thinking
   * only when genuinely relevant to the project.
   */
  reasoning: string;
  problem: string;
  approach: string[];
  outcome: string[];
  tags: string[];
  featured: boolean;
  order: number;
}

export type ExperienceKind = "engineering" | "training" | "advisory" | "founding";

export interface Experience {
  company: string;
  companyUrl?: string;
  role: string;
  location: string;
  start: string;
  end: string | "Present";
  highlights: string[];
  stack?: string[];
  kind: ExperienceKind;
}

export interface Education {
  institution: string;
  degree: string;
  location: string;
  start: string;
  end: string;
  gpa?: string;
  highlights: string[];
}

export interface Service {
  id: string;
  title: string;
  lede: string;
  deliverables: string[];
  stack: string[];
  iconName: string;
  outcomes?: string[];
}

export type EngagementType = {
  id: "freelance" | "contract" | "remote-ft" | "advisory" | "training";
  label: string;
  blurb: string;
  iconName: string;
};

export interface CreativeReelItem {
  kind: "image" | "video" | "audio" | "film";
  title: string;
  tool: string;
  asset: { src: string; alt?: string; poster?: string };
}

export interface SkillGroup {
  name: string;
  skills: string[];
}

export interface NavLink {
  label: string;
  href: string;
  external?: boolean;
}

export interface Testimonial {
  quote: string;
  author: string;
  role: string;
  company: string;
  avatar?: ImageAsset;
}

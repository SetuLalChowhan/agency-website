export type Pagination = {
  page: number;
  limit: number;
  total: number;
  pages: number;
};

export type ListResponse<T> = {
  data: T[];
  meta?: { pagination: Pagination; tag?: string };
};

export type AdminUser = {
  _id: string;
  name: string;
  email: string;
  role: "SUPER_ADMIN" | "ADMIN" | "EDITOR" | "AUTHOR";
  active: boolean;
  lastLoginAt?: string;
  createdAt: string;
};

export type MediaItem = {
  _id: string;
  publicId: string;
  url: string;
  secureUrl?: string;
  format: string;
  resourceType: string;
  width?: number;
  height?: number;
  bytes?: number;
  folder: string;
  altText: string;
  caption: string;
  createdAt: string;
};

export type Lead = {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  budget?: string;
  service?: string;
  message?: string;
  status: string;
  notes?: string;
  createdAt: string;
};

export type NavItem = {
  _id?: string;
  label: string;
  href: string;
  type: "internal" | "external";
  target: "_self" | "_blank";
  enabled: boolean;
  order: number;
  children?: Array<{ label: string; href: string; type?: string; target?: string }>;
};

export type HomeSection = {
  _id?: string;
  type: string;
  key: string;
  label: string;
  enabled: boolean;
  order: number;
  heading?: string;
  subheading?: string;
  body?: string;
  eyebrow?: string;
  index?: string;
  image?: string;
  cta?: { label?: string; href?: string };
  secondaryCta?: { label?: string; href?: string };
  stats?: Array<{ value?: string; suffix?: string; label?: string }>;
  items?: Array<Record<string, string>>;
  clients?: Array<{ name?: string; mark?: string }>;
  marquee?: string[];
  meta?: Record<string, unknown>;
};

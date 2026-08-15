import mongoose, { Schema } from "mongoose";

export const CONTENT_STATUS = ["DRAFT", "PUBLISHED", "ARCHIVED"] as const;
export type ContentStatus = (typeof CONTENT_STATUS)[number];

const socialSchema = new Schema({ label: String, url: String, handle: String }, { _id: false });

const seoSubSchema = new Schema(
  {
    title: String,
    description: String,
    ogTitle: String,
    ogDescription: String,
    ogImage: String,
    canonical: String,
    noindex: { type: Boolean, default: false },
    nofollow: { type: Boolean, default: false },
  },
  { _id: false }
);

const outcomeSchema = new Schema({ value: String, label: String }, { _id: false });
const narrativeSchema = new Schema({ heading: String, body: String }, { _id: false });

/* ------------------------------------------------------------------ */
/*  Service                                                            */
/* ------------------------------------------------------------------ */
const serviceSchema = new Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    tagline: { type: String, default: "" },
    description: { type: String, default: "" },
    items: { type: [String], default: [] },
    tools: { type: [String], default: [] },
    icon: { type: String, default: "" },
    featuredImage: { type: String, default: "" },
    gallery: { type: [String], default: [] },
    status: { type: String, enum: CONTENT_STATUS, default: "DRAFT", index: true },
    publishedAt: { type: Date, index: true },
    order: { type: Number, default: 0, index: true },
    seo: { type: seoSubSchema, default: {} },
  },
  { timestamps: true }
);

/* ------------------------------------------------------------------ */
/*  Project                                                            */
/* ------------------------------------------------------------------ */
const projectSchema = new Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    client: { type: String, default: "" },
    category: { type: String, default: "" },
    industry: { type: String, default: "" },
    year: { type: String, default: "" },
    description: { type: String, default: "" },
    disciplines: { type: [String], default: [] },
    services: { type: [String], default: [] },
    technologies: { type: [String], default: [] },
    art: { type: String, default: "" },
    gallery: { type: [String], default: [] },
    outcomes: { type: [outcomeSchema], default: [] },
    narrative: { type: [narrativeSchema], default: [] },
    challenges: { type: String, default: "" },
    solution: { type: String, default: "" },
    results: { type: String, default: "" },
    projectUrl: { type: String, default: "" },
    testimonial: { type: Schema.Types.Mixed, default: {} },
    featured: { type: Boolean, default: false, index: true },
    status: { type: String, enum: CONTENT_STATUS, default: "DRAFT", index: true },
    publishedAt: { type: Date, index: true },
    order: { type: Number, default: 0, index: true },
    seo: { type: seoSubSchema, default: {} },
  },
  { timestamps: true }
);

/* ------------------------------------------------------------------ */
/*  Case study                                                         */
/* ------------------------------------------------------------------ */
const metricSchema = new Schema({ value: String, label: String }, { _id: false });

const caseStudySchema = new Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    client: { type: String, default: "" },
    industry: { type: String, default: "" },
    year: { type: String, default: "" },
    overview: { type: String, default: "" },
    challenge: { type: String, default: "" },
    solution: { type: String, default: "" },
    strategy: { type: String, default: "" },
    implementation: { type: String, default: "" },
    results: { type: String, default: "" },
    metrics: { type: [metricSchema], default: [] },
    technologies: { type: [String], default: [] },
    gallery: { type: [String], default: [] },
    featuredImage: { type: String, default: "" },
    testimonial: { type: Schema.Types.Mixed, default: {} },
    cta: { type: Schema.Types.Mixed, default: {} },
    featured: { type: Boolean, default: false, index: true },
    status: { type: String, enum: CONTENT_STATUS, default: "DRAFT", index: true },
    publishedAt: { type: Date, index: true },
    order: { type: Number, default: 0, index: true },
    seo: { type: seoSubSchema, default: {} },
  },
  { timestamps: true }
);

/* ------------------------------------------------------------------ */
/*  Testimonial                                                        */
/* ------------------------------------------------------------------ */
const testimonialSchema = new Schema(
  {
    quote: { type: String, required: true },
    name: { type: String, required: true },
    role: { type: String, default: "" },
    company: { type: String, default: "" },
    avatar: { type: String, default: "" },
    rating: { type: Number, min: 0, max: 5, default: 0 },
    project: { type: String, default: "" },
    featured: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
    status: { type: String, enum: CONTENT_STATUS, default: "PUBLISHED", index: true },
  },
  { timestamps: true }
);

/* ------------------------------------------------------------------ */
/*  Team member                                                        */
/* ------------------------------------------------------------------ */
const teamMemberSchema = new Schema(
  {
    name: { type: String, required: true },
    position: { type: String, default: "" },
    bio: { type: String, default: "" },
    image: { type: String, default: "" },
    socials: { type: [socialSchema], default: [] },
    skills: { type: [String], default: [] },
    order: { type: Number, default: 0 },
    visible: { type: Boolean, default: true },
  },
  { timestamps: true }
);

/* ------------------------------------------------------------------ */
/*  FAQ                                                                */
/* ------------------------------------------------------------------ */
const faqSchema = new Schema(
  {
    question: { type: String, required: true },
    answer: { type: String, default: "" },
    category: { type: String, default: "" },
    order: { type: Number, default: 0 },
    enabled: { type: Boolean, default: true },
  },
  { timestamps: true }
);

/* ------------------------------------------------------------------ */
/*  Models                                                             */
/* ------------------------------------------------------------------ */
export const Service = mongoose.model("Service", serviceSchema);
export const Project = mongoose.model("Project", projectSchema);
export const CaseStudy = mongoose.model("CaseStudy", caseStudySchema);
export const Testimonial = mongoose.model("Testimonial", testimonialSchema);
export const TeamMember = mongoose.model("TeamMember", teamMemberSchema);
export const FAQ = mongoose.model("FAQ", faqSchema);

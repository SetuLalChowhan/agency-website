import mongoose, { Schema } from "mongoose";

export const LEAD_STATUS = ["NEW", "CONTACTED", "IN_PROGRESS", "CONVERTED", "CLOSED", "SPAM"] as const;
export type LeadStatus = (typeof LEAD_STATUS)[number];

const contactSubmissionSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true, index: true },
    phone: { type: String, default: "" },
    company: { type: String, default: "" },
    budget: { type: String, default: "" },
    service: { type: String, default: "" },
    message: { type: String, required: true },
    source: { type: String, default: "contact" },
    status: { type: String, enum: LEAD_STATUS, default: "NEW", index: true },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

contactSubmissionSchema.index({ createdAt: -1 });

const quoteRequestSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true, index: true },
    phone: { type: String, default: "" },
    company: { type: String, default: "" },
    service: { type: String, default: "" },
    budget: { type: String, default: "" },
    message: { type: String, default: "" },
    status: { type: String, enum: LEAD_STATUS, default: "NEW", index: true },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

quoteRequestSchema.index({ createdAt: -1 });

const newsletterSubscriberSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    status: { type: String, enum: ["SUBSCRIBED", "UNSUBSCRIBED"], default: "SUBSCRIBED", index: true },
    source: { type: String, default: "footer" },
  },
  { timestamps: true }
);

export const ContactSubmission = mongoose.model("ContactSubmission", contactSubmissionSchema);
export const QuoteRequest = mongoose.model("QuoteRequest", quoteRequestSchema);
export const NewsletterSubscriber = mongoose.model("NewsletterSubscriber", newsletterSubscriberSchema);

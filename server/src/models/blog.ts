import mongoose, { Schema } from "mongoose";
import { CONTENT_STATUS } from "./content";

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

const contentBlockSchema = new Schema(
  {
    heading: String,
    paragraphs: { type: [String], default: [] },
  },
  { _id: false }
);

const blogPostSchema = new Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    excerpt: { type: String, default: "" },
    content: { type: [contentBlockSchema], default: [] },
    richText: { type: String, default: "" },
    art: { type: String, default: "" },
    author: { type: String, default: "" },
    category: { type: Schema.Types.ObjectId, ref: "BlogCategory", index: true },
    tags: { type: [{ type: Schema.Types.ObjectId, ref: "BlogTag" }], default: [] },
    readingTime: { type: String, default: "" },
    pullQuote: { type: String, default: "" },
    featured: { type: Boolean, default: false, index: true },
    status: { type: String, enum: CONTENT_STATUS, default: "DRAFT", index: true },
    publishedAt: { type: Date, index: true },
    updatedAt: { type: Date },
    seo: { type: seoSubSchema, default: {} },
  },
  { timestamps: true }
);

blogPostSchema.pre("save", function (next) {
  if (this.isModified() && !this.updatedAt) this.updatedAt = new Date();
  next();
});

const blogCategorySchema = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
  },
  { timestamps: true }
);

const blogTagSchema = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
  },
  { timestamps: true }
);

export const BlogPost = mongoose.model("BlogPost", blogPostSchema);
export const BlogCategory = mongoose.model("BlogCategory", blogCategorySchema);
export const BlogTag = mongoose.model("BlogTag", blogTagSchema);

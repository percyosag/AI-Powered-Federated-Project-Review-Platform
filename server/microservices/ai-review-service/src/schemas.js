import { z } from "zod";

export const reviewInputSchema = z.object({
  draftId: z.string().min(1),
  draftContent: z.string().min(20),
});

export const retrievedDocSchema = z.object({
  sourceId: z.string(),
  source: z.string(),
  title: z.string().optional(),
  content: z.string(),
});

export const reviewIssueSchema = z.object({
  type: z.enum([
    "security",
    "graphql",
    "architecture",
    "validation",
    "performance",
    "maintainability",
    "authorization",
    "error_handling",
  ]),
  severity: z.enum(["low", "medium", "high"]),
  description: z.string().min(10),
  suggestions: z.array(z.string().min(3)).min(1),
  confidence: z.number().min(0).max(100),
  citations: z.array(z.string().min(1)).min(1),
});

export const initialReviewSchema = z.object({
  summary: z.string().min(20),
  issues: z.array(reviewIssueSchema).default([]),
  overallConfidence: z.number().min(0).max(100),
});

export const finalReviewSchema = z.object({
  summary: z.string().min(20),
  issues: z.array(reviewIssueSchema).default([]),
  overallConfidence: z.number().min(0).max(100),
  reflectionNotes: z.array(z.string().min(1)).default([]),
  retrievalUsed: z.boolean().default(true),
  initialConfidence: z.number().min(0).max(100).optional(),
  finalConfidence: z.number().min(0).max(100).optional(),
});

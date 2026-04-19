import dotenv from "dotenv";
dotenv.config({ path: "../../.env" });

import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { StateGraph, StateSchema } from "@langchain/langgraph";
import { z } from "zod";
import { initialReviewSchema, finalReviewSchema } from "./schemas.js";
import { retrieveRelevantDocs } from "./vectorStore.js";

const MAX_CONFIDENCE = 95;

function capConfidence(value, fallback = 40) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return fallback;
  }

  return Math.max(0, Math.min(value, MAX_CONFIDENCE));
}

const reviewModel = new ChatGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_API_KEY,
  model: "gemini-2.5-flash",
  temperature: 0,
}).withStructuredOutput(initialReviewSchema);

const reflectionModel = new ChatGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_API_KEY,
  model: "gemini-2.5-flash",
  temperature: 0,
}).withStructuredOutput(finalReviewSchema);

const ReviewState = new StateSchema({
  draftId: z.string(),
  draftContent: z.string(),

  retrievedDocs: z
    .array(
      z.object({
        sourceId: z.string(),
        source: z.string(),
        title: z.string().optional(),
        content: z.string(),
      }),
    )
    .default([]),

  initialReview: initialReviewSchema.nullable().default(null),
  finalReview: finalReviewSchema.nullable().default(null),
});

function formatEvidence(docs) {
  if (!docs?.length) return "No evidence retrieved.";

  return docs
    .map(
      (doc) =>
        `[${doc.sourceId}] title=${doc.title ?? "Untitled"} source=${doc.source}\n${doc.content}`,
    )
    .join("\n\n---\n\n");
}

const retrieveNode = async (state) => {
  const retrievedDocs = await retrieveRelevantDocs(state.draftContent, 4);
  return { retrievedDocs };
};

const reviewNode = async (state) => {
  const evidence = formatEvidence(state.retrievedDocs);

  try {
    const result = await reviewModel.invoke([
      [
        "system",
        `You are an AI code and architecture review assistant for a software engineering team.

Review the submitted implementation draft using ONLY the retrieved internal guidance.

Rules:
1. Base the review only on the retrieved evidence.
2. Do not invent facts, rules, or violations that are not supported.
3. Return a concise summary.
4. Each issue must include:
   - type
   - severity
   - description
   - suggestions
   - confidence
   - citations
5. Every citation must exactly match a sourceId from the evidence.
6. If evidence is limited, reduce confidence and keep the review conservative.`,
      ],
      [
        "human",
        `Draft ID:
${state.draftId}

Draft Content:
${state.draftContent}

Retrieved Evidence:
${evidence}

Return the structured review now.`,
      ],
    ]);

    const validSourceIds = new Set(
      state.retrievedDocs.map((doc) => doc.sourceId).filter(Boolean),
    );

    const cleanedIssues = Array.isArray(result?.issues)
      ? result.issues.map((issue) => ({
          ...issue,
          confidence: capConfidence(issue?.confidence, 40),
          citations: Array.isArray(issue.citations)
            ? issue.citations.filter((id) => validSourceIds.has(id))
            : [],
        }))
      : [];

    return {
      initialReview: {
        summary: result?.summary || "A review summary could not be generated.",
        issues: cleanedIssues,
        overallConfidence: capConfidence(result?.overallConfidence, 40),
      },
    };
  } catch (error) {
    console.warn(
      "Review step failed, using conservative fallback:",
      error.message,
    );

    return {
      initialReview: {
        summary:
          "The draft was reviewed conservatively because valid structured AI output was not produced on the first pass.",
        issues: [
          {
            type: "maintainability",
            severity: "medium",
            description:
              "The AI review step failed to return valid structured output, so this fallback result is intentionally conservative.",
            suggestions: [
              "Re-run the review after checking model output formatting.",
              "Inspect the retrieved guidance and verify the implementation manually.",
            ],
            confidence: 40,
            citations: state.retrievedDocs
              .slice(0, 1)
              .map((doc) => doc.sourceId),
          },
        ],
        overallConfidence: 40,
      },
    };
  }
};

const reflectNode = async (state) => {
  const evidence = formatEvidence(state.retrievedDocs);

  if (!state.initialReview) {
    return {
      finalReview: {
        summary: "A final AI review could not be produced.",
        issues: [],
        overallConfidence: 30,
        reflectionNotes: ["No initial review was available for reflection."],
        retrievalUsed: true,
        initialConfidence: 0,
        finalConfidence: 30,
      },
    };
  }

  try {
    const result = await reflectionModel.invoke([
      [
        "system",
        `You are a reflection and validation pass for an AI review workflow.

Your job is to inspect the initial review for:
- unsupported claims
- weak citations
- possible hallucinations
- overstated confidence

Rules:
1. Keep only issues supported by the retrieved evidence.
2. Lower confidence when support is weak or partial.
3. Preserve valid citations and remove unsupported ones.
4. Add reflectionNotes explaining what was checked or corrected.
5. retrievalUsed must be true.
6. initialConfidence should reflect the first-pass overallConfidence.
7. finalConfidence should reflect the final reviewed confidence.`,
      ],
      [
        "human",
        `Draft Content:
${state.draftContent}

Retrieved Evidence:
${evidence}

Initial Review JSON:
${JSON.stringify(state.initialReview, null, 2)}

Return the improved final review now.`,
      ],
    ]);

    const validSourceIds = new Set(
      state.retrievedDocs.map((doc) => doc.sourceId).filter(Boolean),
    );

    const cleanedIssues = Array.isArray(result?.issues)
      ? result.issues.map((issue) => ({
          ...issue,
          confidence: capConfidence(issue?.confidence, 40),
          citations: Array.isArray(issue.citations)
            ? issue.citations.filter((id) => validSourceIds.has(id))
            : [],
        }))
      : [];

    const finalConfidence = capConfidence(
      typeof result?.finalConfidence === "number"
        ? result.finalConfidence
        : typeof result?.overallConfidence === "number"
          ? result.overallConfidence
          : state.initialReview.overallConfidence,
      state.initialReview.overallConfidence,
    );

    return {
      finalReview: {
        summary: result?.summary || state.initialReview.summary,
        issues: cleanedIssues,
        overallConfidence: capConfidence(
          result?.overallConfidence,
          finalConfidence,
        ),
        reflectionNotes: Array.isArray(result?.reflectionNotes)
          ? result.reflectionNotes
          : ["The reflection pass completed with limited notes."],
        retrievalUsed: true,
        initialConfidence: capConfidence(
          state.initialReview.overallConfidence,
          40,
        ),
        finalConfidence,
      },
    };
  } catch (error) {
    console.warn(
      "Reflection step failed, keeping initial review:",
      error.message,
    );

    const preservedConfidence = capConfidence(
      state.initialReview.overallConfidence,
      40,
    );

    return {
      finalReview: {
        summary: state.initialReview.summary,
        issues: Array.isArray(state.initialReview.issues)
          ? state.initialReview.issues.map((issue) => ({
              ...issue,
              confidence: capConfidence(issue?.confidence, 40),
            }))
          : [],
        overallConfidence: preservedConfidence,
        reflectionNotes: [
          "The reflection step failed, so the initial structured review was preserved.",
        ],
        retrievalUsed: true,
        initialConfidence: preservedConfidence,
        finalConfidence: preservedConfidence,
      },
    };
  }
};

export const reviewGraph = new StateGraph(ReviewState)
  .addNode("retrieve", retrieveNode)
  .addNode("review", reviewNode)
  .addNode("reflect", reflectNode)
  .addEdge("__start__", "retrieve")
  .addEdge("retrieve", "review")
  .addEdge("review", "reflect")
  .addEdge("reflect", "__end__")
  .compile();

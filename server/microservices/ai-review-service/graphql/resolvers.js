// import { reviewGraph } from "../src/reviewGraph.js";
// import Review from "../models/Review.js";

// import fetch from "node-fetch";

// async function runAndSaveReview(draftId) {
//   const result = await reviewGraph.invoke({
//     draftId,
//     draftContent: sampleDraftText(draftId),
//   });
//   async function getDraftContent(draftId, context) {
//     const query = `
//     query GetDraft($id: ID!) {
//       draft(id: $id) {
//         id
//         content
//       }
//     }
//   `;

//     const response = await fetch("http://localhost:4000/graphql", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         cookie: context.req.headers.cookie || "", // 🔥 keeps user session
//       },
//       body: JSON.stringify({
//         query,
//         variables: { id: draftId },
//       }),
//     });

//     const json = await response.json();

//     return json?.data?.draft?.content || "No draft content found.";
//   }

//   const review = result.finalReview;

//   const savedReview = await Review.create({
//     draftId,
//     summary: review.summary,
//     issues: review.issues,
//     overallConfidence: review.overallConfidence,
//     reflectionNotes: review.reflectionNotes,
//     retrievalUsed: review.retrievalUsed,
//     initialConfidence: review.initialConfidence,
//     finalConfidence: review.finalConfidence,
//   });

//   return savedReview;
// }

// const resolvers = {
//   Query: {
//     draftReview: async (_parent, { draftId }) => {
//       const existingReview = await Review.findOne({ draftId }).sort({
//         createdAt: -1,
//       });

//       if (!existingReview) return null;

//       return {
//         id: existingReview._id.toString(),
//         draftId: existingReview.draftId,
//         summary: existingReview.summary,
//         issues: existingReview.issues,
//         overallConfidence: existingReview.overallConfidence,
//         reflectionNotes: existingReview.reflectionNotes,
//         retrievalUsed: existingReview.retrievalUsed,
//         initialConfidence: existingReview.initialConfidence,
//         finalConfidence: existingReview.finalConfidence,
//         createdAt: existingReview.createdAt.toISOString(),
//         updatedAt: existingReview.updatedAt.toISOString(),
//       };
//     },
//   },

//   Mutation: {
//     reviewDraft: async (_parent, { draftId }, context) => {
//       const savedReview = await runAndSaveReview(draftId);

//       return {
//         id: savedReview._id.toString(),
//         draftId: savedReview.draftId,
//         summary: savedReview.summary,
//         issues: savedReview.issues,
//         overallConfidence: savedReview.overallConfidence,
//         reflectionNotes: savedReview.reflectionNotes,
//         retrievalUsed: savedReview.retrievalUsed,
//         initialConfidence: savedReview.initialConfidence,
//         finalConfidence: savedReview.finalConfidence,
//         createdAt: savedReview.createdAt.toISOString(),
//         updatedAt: savedReview.updatedAt.toISOString(),
//       };
//     },
//   },
// };

// export default resolvers;

import fetch from "node-fetch";
import { reviewGraph } from "../src/reviewGraph.js";
import Review from "../models/Review.js";

const PROJECTS_URL = `http://localhost:${process.env.PROJECTS_PORT || 4002}/graphql`;

async function getDraftContent(draftId, context) {
  const query = `
    query GetDraft($id: ID!) {
      draft(id: $id) {
        id
        content
      }
    }
  `;

  const response = await fetch(PROJECTS_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      cookie: context?.req?.headers?.cookie || "",
    },
    body: JSON.stringify({
      query,
      variables: { id: draftId },
    }),
  });

  const json = await response.json();

  if (json.errors?.length) {
    throw new Error(json.errors[0].message || "Failed to fetch draft.");
  }

  const draft = json?.data?.draft;

  if (!draft) {
    throw new Error(`Draft not found for id: ${draftId}`);
  }

  if (!draft.content || !draft.content.trim()) {
    throw new Error(`Draft content is empty for id: ${draftId}`);
  }

  return draft.content;
}

async function runAndSaveReview(draftId, context) {
  const draftContent = await getDraftContent(draftId, context);

  const result = await reviewGraph.invoke({
    draftId,
    draftContent,
  });

  const review = result.finalReview;

  const savedReview = await Review.create({
    draftId,
    summary: review.summary,
    issues: review.issues,
    overallConfidence: review.overallConfidence,
    reflectionNotes: review.reflectionNotes,
    retrievalUsed: review.retrievalUsed,
    initialConfidence: review.initialConfidence,
    finalConfidence: review.finalConfidence,
  });

  return savedReview;
}

function mapReview(reviewDoc) {
  return {
    id: reviewDoc._id.toString(),
    draftId: reviewDoc.draftId,
    summary: reviewDoc.summary,
    issues: reviewDoc.issues,
    overallConfidence: reviewDoc.overallConfidence,
    reflectionNotes: reviewDoc.reflectionNotes,
    retrievalUsed: reviewDoc.retrievalUsed,
    initialConfidence: reviewDoc.initialConfidence,
    finalConfidence: reviewDoc.finalConfidence,
    createdAt: reviewDoc.createdAt.toISOString(),
    updatedAt: reviewDoc.updatedAt.toISOString(),
  };
}

const resolvers = {
  Query: {
    draftReview: async (_parent, { draftId }) => {
      const existingReview = await Review.findOne({ draftId }).sort({
        createdAt: -1,
      });

      if (!existingReview) return null;

      return mapReview(existingReview);
    },
  },

  Mutation: {
    reviewDraft: async (_parent, { draftId }, context) => {
      const savedReview = await runAndSaveReview(draftId, context);
      return mapReview(savedReview);
    },
  },
};

export default resolvers;

// const typeDefs = `#graphql
//   type ReviewIssue {
//     type: String!
//     severity: String!
//     description: String!
//     suggestions: [String!]!
//     confidence: Float!
//     citations: [String!]!
//   }

//   type DraftReview {
//     id: ID!
//     draftId: ID!
//     summary: String!
//     issues: [ReviewIssue!]!
//     overallConfidence: Float!
//     reflectionNotes: [String!]!
//     retrievalUsed: Boolean!
//     initialConfidence: Float
//     finalConfidence: Float
//     createdAt: String!
//     updatedAt: String!
//   }

//   extend type Query {
//     draftReview(draftId: ID!): DraftReview
//   }

//   extend type Mutation {
//     reviewDraft(draftId: ID!, draftContent: String!): DraftReview!
//   }
// `;

// export default typeDefs;

const typeDefs = `#graphql
  type ReviewIssue {
    type: String!
    severity: String!
    description: String!
    suggestions: [String!]!
    confidence: Float!
    citations: [String!]!
  }

  type DraftReview {
    id: ID!
    draftId: ID!
    summary: String!
    issues: [ReviewIssue!]!
    overallConfidence: Float!
    reflectionNotes: [String!]!
    retrievalUsed: Boolean!
    initialConfidence: Float
    finalConfidence: Float
    createdAt: String!
    updatedAt: String!
  }

  extend type Query {
    draftReview(draftId: ID!): DraftReview
  }

  extend type Mutation {
    reviewDraft(draftId: ID!): DraftReview!
  }
`;

export default typeDefs;

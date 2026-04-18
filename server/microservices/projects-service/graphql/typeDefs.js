const typeDefs = `#graphql
  type Project {
    id: ID!
    title: String!
    description: String!
    owner: String!
    createdAt: String
    updatedAt: String
  }

  type FeatureRequest {
    id: ID!
    projectId: ID!
    title: String!
    description: String!
    status: String!
    createdAt: String
    updatedAt: String
  }

  type Draft {
    id: ID!
    featureId: ID!
    author: String!
    content: String!
    version: Int!
    createdAt: String
    updatedAt: String
  }

  extend type Query {
    projectsByUser: [Project]
    project(id: ID!): Project
    featureRequests(projectId: ID!): [FeatureRequest]
    draftsByFeature(featureId: ID!): [Draft]
    draft(id: ID!): Draft
  }

  extend type Mutation {
    createProject(
      title: String!
      description: String!
    ): Project

    addFeatureRequest(
      projectId: ID!
      title: String!
      description: String!
      status: String
    ): FeatureRequest

    submitDraft(
      featureId: ID!
      content: String!
      version: Int
    ): Draft
  }
`;

export default typeDefs;

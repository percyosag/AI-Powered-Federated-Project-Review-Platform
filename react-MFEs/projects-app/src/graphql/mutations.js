import { gql } from "@apollo/client";

export const CREATE_PROJECT_MUTATION = gql`
  mutation CreateProject($title: String!, $description: String!) {
    createProject(title: $title, description: $description) {
      id
      title
      description
      owner
      createdAt
      updatedAt
    }
  }
`;

export const DELETE_PROJECT_MUTATION = gql`
  mutation DeleteProject($id: ID!) {
    deleteProject(id: $id)
  }
`;
export const ADD_FEATURE_REQUEST_MUTATION = gql`
  mutation AddFeatureRequest(
    $projectId: ID!
    $title: String!
    $description: String!
    $status: String
  ) {
    addFeatureRequest(
      projectId: $projectId
      title: $title
      description: $description
      status: $status
    ) {
      id
      projectId
      title
      description
      status
      createdAt
      updatedAt
    }
  }
`;
export const SUBMIT_DRAFT_MUTATION = gql`
  mutation SubmitDraft($featureId: ID!, $content: String!, $version: Int) {
    submitDraft(featureId: $featureId, content: $content, version: $version) {
      id
      featureId
      author
      content
      version
      createdAt
      updatedAt
    }
  }
`;

import { useState } from "react";
import { useQuery } from "@apollo/client/react";
import { Container, Card, Row, Col, Spinner, Alert } from "react-bootstrap";
import {
  PROJECTS_BY_USER_QUERY,
  FEATURE_REQUESTS_QUERY,
  DRAFTS_BY_FEATURE_QUERY,
} from "../graphql/queries";
import ProjectList from "./ProjectList.jsx";
import CreateProjectForm from "./CreateProjectForm.jsx";
import AddFeatureRequestForm from "./AddFeatureRequestForm.jsx";
import FeatureRequestList from "./FeatureRequestList.jsx";
import DraftHistory from "./DraftHistory.jsx";
import SubmitDraftForm from "./SubmitDraftForm.jsx";

const ProjectsDashboard = ({ currentUser }) => {
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [selectedFeatureId, setSelectedFeatureId] = useState(null);

  const {
    data: projectsData,
    loading: projectsLoading,
    error: projectsError,
    refetch: refetchProjects,
  } = useQuery(PROJECTS_BY_USER_QUERY, {
    fetchPolicy: "network-only",
  });

  const {
    data: featureData,
    loading: featuresLoading,
    error: featuresError,
    refetch: refetchFeatures,
  } = useQuery(FEATURE_REQUESTS_QUERY, {
    variables: { projectId: selectedProjectId },
    skip: !selectedProjectId,
    fetchPolicy: "network-only",
  });

  const {
    data: draftData,
    loading: draftsLoading,
    error: draftsError,
    refetch: refetchDrafts,
  } = useQuery(DRAFTS_BY_FEATURE_QUERY, {
    variables: { featureId: selectedFeatureId },
    skip: !selectedFeatureId,
    fetchPolicy: "network-only",
  });

  const projects = projectsData?.projectsByUser || [];
  const features = featureData?.featureRequests || [];
  const drafts = draftData?.draftsByFeature || [];

  const selectedProject =
    projects.find((project) => project.id === selectedProjectId) || null;

  const selectedFeature =
    features.find((feature) => feature.id === selectedFeatureId) || null;

  const handleSelectProject = (projectId) => {
    setSelectedProjectId(projectId);
    setSelectedFeatureId(null);
  };

  const handleProjectCreated = async (newProject) => {
    await refetchProjects();
    setSelectedProjectId(newProject.id);
    setSelectedFeatureId(null);
  };

  const handleFeatureCreated = async (newFeature) => {
    await refetchFeatures();
    setSelectedFeatureId(newFeature.id);
  };

  const handleDraftCreated = async () => {
    await refetchDrafts();
  };

  const formatDate = (value) => {
    if (!value) return "Not available";

    const parsedDate = new Date(value);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Not available";
    }

    return parsedDate.toLocaleString();
  };

  return (
    <Container fluid className="projects-app-shell px-0">
      <Card className="projects-dashboard-card">
        <Card.Body>
          <div className="projects-page-header">
            <span>Projects Module</span>
            <h1>Project Management</h1>
            <p>
              Create projects, organize feature requests, and submit
              implementation drafts for AI-powered review.
            </p>
          </div>

          {projectsLoading && (
            <div className="d-flex align-items-center gap-2">
              <Spinner animation="border" size="sm" />
              <span>Loading projects...</span>
            </div>
          )}

          {projectsError && (
            <Alert variant="danger">
              <div className="fw-bold mb-2">Could not load projects</div>
              <div className="small mb-3">{projectsError.message}</div>
              <button
                className="btn btn-dark btn-sm"
                onClick={() => refetchProjects()}
              >
                Try again
              </button>
            </Alert>
          )}

          {!projectsLoading && !projectsError && (
            <Row className="g-4 projects-dashboard-grid">
              <Col lg={4}>
                <CreateProjectForm onCreated={handleProjectCreated} />

                <ProjectList
                  projects={projects}
                  selectedProjectId={selectedProjectId}
                  onSelectProject={handleSelectProject}
                />
              </Col>

              <Col lg={4}>
                <Card className="border">
                  <Card.Body>
                    <h4 className="mb-3">Selected Project</h4>

                    {!selectedProject && (
                      <p className="text-muted mb-0">
                        Select a project from the left to view its details.
                      </p>
                    )}

                    {selectedProject && (
                      <>
                        <h5>{selectedProject.title}</h5>
                        <p className="mb-2">{selectedProject.description}</p>
                        <div className="small text-muted">
                          <div>
                            <strong>Owner:</strong>{" "}
                            {currentUser?.username || "Current User"}
                          </div>
                          <div>
                            <strong>Created:</strong>{" "}
                            {formatDate(selectedProject.createdAt)}
                          </div>
                          <div>
                            <strong>Updated:</strong>{" "}
                            {formatDate(selectedProject.updatedAt)}
                          </div>
                        </div>
                      </>
                    )}
                  </Card.Body>
                </Card>

                <AddFeatureRequestForm
                  projectId={selectedProjectId}
                  onCreated={handleFeatureCreated}
                />
              </Col>

              <Col lg={4}>
                {selectedProjectId && featuresLoading && (
                  <div className="d-flex align-items-center gap-2 mb-3">
                    <Spinner animation="border" size="sm" />
                    <span>Loading feature requests...</span>
                  </div>
                )}

                {featuresError && (
                  <Alert variant="danger">
                    <div className="fw-bold mb-2">
                      Could not load feature requests
                    </div>
                    <div className="small mb-3">{featuresError.message}</div>
                    <button
                      className="btn btn-dark btn-sm"
                      onClick={() => refetchFeatures()}
                    >
                      Try again
                    </button>
                  </Alert>
                )}

                {!featuresError && (
                  <FeatureRequestList
                    features={features}
                    selectedFeatureId={selectedFeatureId}
                    onSelectFeature={setSelectedFeatureId}
                  />
                )}

                <Card className="mt-3 border">
                  <Card.Body>
                    <h5 className="mb-3">Selected Feature</h5>

                    {!selectedFeature && (
                      <p className="text-muted mb-0">
                        Select a feature request to view its details.
                      </p>
                    )}

                    {selectedFeature && (
                      <>
                        <h6>{selectedFeature.title}</h6>
                        <p className="mb-2">{selectedFeature.description}</p>
                        <div className="small text-muted">
                          <div>
                            <strong>Status:</strong>{" "}
                            {selectedFeature.status || "open"}
                          </div>
                          <div>
                            <strong>Created:</strong>{" "}
                            {formatDate(selectedFeature.createdAt)}
                          </div>
                          <div>
                            <strong>Updated:</strong>{" "}
                            {formatDate(selectedFeature.updatedAt)}
                          </div>
                        </div>
                      </>
                    )}
                  </Card.Body>
                </Card>

                <SubmitDraftForm
                  featureId={selectedFeatureId}
                  onCreated={handleDraftCreated}
                />

                {selectedFeatureId && draftsLoading && (
                  <div className="d-flex align-items-center gap-2 mt-3">
                    <Spinner animation="border" size="sm" />
                    <span>Loading drafts...</span>
                  </div>
                )}

                {draftsError && (
                  <Alert variant="danger" className="mt-3">
                    <div className="fw-bold mb-2">Could not load drafts</div>
                    <div className="small mb-3">{draftsError.message}</div>
                    <button
                      className="btn btn-dark btn-sm"
                      onClick={() => refetchDrafts()}
                    >
                      Try again
                    </button>
                  </Alert>
                )}

                {!draftsError && <DraftHistory drafts={drafts} />}
              </Col>
            </Row>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default ProjectsDashboard;

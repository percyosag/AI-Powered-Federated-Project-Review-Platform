import { useState } from "react";
import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  Container,
  Form,
  Row,
  Spinner,
} from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

function severityVariant(severity) {
  switch ((severity || "").toLowerCase()) {
    case "high":
      return "danger";
    case "medium":
      return "warning";
    case "low":
      return "success";
    default:
      return "secondary";
  }
}

function App() {
  const [draftId, setDraftId] = useState("");
  const [reviewResult, setReviewResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingSaved, setLoadingSaved] = useState(false);
  const [loadingDrafts, setLoadingDrafts] = useState(false);
  const [error, setError] = useState("");
  const [drafts, setDrafts] = useState([]);
  const [selectedDraft, setSelectedDraft] = useState(null);

  const fetchGraphQL = async (query, variables = {}) => {
    const response = await fetch("http://localhost:4000/graphql", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query, variables }),
    });

    const json = await response.json();

    if (json.errors?.length) {
      throw new Error(json.errors[0].message || "GraphQL request failed.");
    }

    return json.data;
  };

  const handleLoadDrafts = async () => {
    setError("");
    setDrafts([]);
    setSelectedDraft(null);
    setReviewResult(null);

    try {
      setLoadingDrafts(true);

      const projectsData = await fetchGraphQL(`
        query {
          projectsByUser {
            id
            title
          }
        }
      `);

      const projects = projectsData.projectsByUser || [];

      if (!projects.length) {
        throw new Error("No projects found for this user.");
      }

      const allDrafts = [];

      for (const project of projects) {
        const featuresData = await fetchGraphQL(
          `
            query FeatureRequests($projectId: ID!) {
              featureRequests(projectId: $projectId) {
                id
                title
                description
              }
            }
          `,
          { projectId: project.id },
        );

        const features = featuresData.featureRequests || [];

        for (const feature of features) {
          const draftsData = await fetchGraphQL(
            `
              query DraftsByFeature($featureId: ID!) {
                draftsByFeature(featureId: $featureId) {
                  id
                  featureId
                  author
                  content
                  version
                  createdAt
                  updatedAt
                }
              }
            `,
            { featureId: feature.id },
          );

          const featureDrafts = draftsData.draftsByFeature || [];

          featureDrafts.forEach((draft) => {
            allDrafts.push({
              ...draft,
              projectTitle: project.title,
              featureTitle: feature.title,
              featureDescription: feature.description,
            });
          });
        }
      }

      if (!allDrafts.length) {
        throw new Error("No drafts found in your projects.");
      }

      setDrafts(allDrafts);
    } catch (err) {
      setError(err.message || "Failed to load drafts.");
    } finally {
      setLoadingDrafts(false);
    }
  };

  const handleSelectDraft = (draft) => {
    setSelectedDraft(draft);
    setDraftId(draft.id);
    setError("");
    setReviewResult(null);
  };

  const handleReview = async (e) => {
    e.preventDefault();
    setError("");
    setReviewResult(null);

    if (!draftId.trim()) {
      setError("Please select a draft or enter a draft ID.");
      return;
    }

    try {
      setLoading(true);

      const data = await fetchGraphQL(
        `
          mutation ReviewDraft($draftId: ID!) {
            reviewDraft(draftId: $draftId) {
              id
              draftId
              summary
              overallConfidence
              retrievalUsed
              initialConfidence
              finalConfidence
              reflectionNotes
              issues {
                type
                severity
                description
                suggestions
                confidence
                citations
              }
              createdAt
              updatedAt
            }
          }
        `,
        { draftId },
      );

      setReviewResult(data.reviewDraft);
    } catch (err) {
      setError(
        err.message || "Something went wrong while reviewing the draft.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLoadSavedReview = async () => {
    setError("");
    setReviewResult(null);

    if (!draftId.trim()) {
      setError("Enter or select a draft ID first.");
      return;
    }

    try {
      setLoadingSaved(true);

      const data = await fetchGraphQL(
        `
          query DraftReview($draftId: ID!) {
            draftReview(draftId: $draftId) {
              id
              draftId
              summary
              overallConfidence
              retrievalUsed
              initialConfidence
              finalConfidence
              reflectionNotes
              issues {
                type
                severity
                description
                suggestions
                confidence
                citations
              }
              createdAt
              updatedAt
            }
          }
        `,
        { draftId },
      );

      if (!data.draftReview) {
        throw new Error("No saved review found for this draft ID.");
      }

      setReviewResult(data.draftReview);
    } catch (err) {
      setError(
        err.message || "Something went wrong while loading saved review.",
      );
    } finally {
      setLoadingSaved(false);
    }
  };

  return (
    <Container fluid className="ai-review-app px-0">
      <Card className="shadow-sm mb-4">
        <Card.Body>
          <h1 className="mb-3">AI Review App</h1>
          <p className="text-muted mb-4">
            Load your submitted drafts, select one, and run a grounded AI review
            with structured issues, citations, confidence, and reflection notes.
          </p>

          <div className="d-flex gap-2 flex-wrap mb-4">
            <Button
              variant="outline-primary"
              type="button"
              onClick={handleLoadDrafts}
              disabled={loadingDrafts}
            >
              {loadingDrafts ? (
                <>
                  <Spinner size="sm" className="me-2" />
                  Loading Drafts...
                </>
              ) : (
                "Load My Drafts"
              )}
            </Button>
          </div>

          <Form onSubmit={handleReview}>
            <Form.Group className="mb-3">
              <Form.Label>Draft ID</Form.Label>
              <Form.Control
                type="text"
                placeholder="Select a draft below or paste a draft ID"
                value={draftId}
                onChange={(e) => setDraftId(e.target.value)}
              />
            </Form.Group>

            <div className="d-flex gap-2 flex-wrap">
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Spinner size="sm" className="me-2" />
                    Reviewing...
                  </>
                ) : (
                  "Run AI Review"
                )}
              </Button>

              <Button
                variant="outline-secondary"
                type="button"
                onClick={handleLoadSavedReview}
                disabled={loadingSaved}
              >
                {loadingSaved ? (
                  <>
                    <Spinner size="sm" className="me-2" />
                    Loading...
                  </>
                ) : (
                  "Load Saved Review"
                )}
              </Button>
            </div>
          </Form>

          {error && (
            <Alert variant="danger" className="mt-4 mb-0">
              {error}
            </Alert>
          )}
        </Card.Body>
      </Card>

      {selectedDraft && (
        <Card className="shadow-sm mb-4">
          <Card.Body>
            <h4 className="mb-3">Selected Draft</h4>
            <Row className="mb-3">
              <Col md={4}>
                <div className="small text-muted">Project</div>
                <div>{selectedDraft.projectTitle}</div>
              </Col>
              <Col md={4}>
                <div className="small text-muted">Feature</div>
                <div>{selectedDraft.featureTitle}</div>
              </Col>
              <Col md={4}>
                <div className="small text-muted">Version</div>
                <div>{selectedDraft.version}</div>
              </Col>
            </Row>

            <div className="small text-muted mb-1">Draft Preview</div>
            <Card className="bg-light border-0">
              <Card.Body style={{ whiteSpace: "pre-wrap" }}>
                {selectedDraft.content}
              </Card.Body>
            </Card>
          </Card.Body>
        </Card>
      )}

      {drafts.length > 0 && (
        <Card className="shadow-sm mb-4">
          <Card.Body>
            <h4 className="mb-3">My Drafts</h4>

            {drafts.map((draft) => (
              <Card key={draft.id} className="mb-3 border-0 bg-light">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-2">
                    <div>
                      <div className="fw-bold">{draft.featureTitle}</div>
                      <div className="text-muted small">
                        Project: {draft.projectTitle}
                      </div>
                      <div className="text-muted small">
                        Draft ID: {draft.id}
                      </div>
                    </div>

                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => handleSelectDraft(draft)}
                    >
                      Select Draft
                    </Button>
                  </div>

                  <div className="small text-muted mb-1">Preview</div>
                  <div style={{ whiteSpace: "pre-wrap" }}>
                    {draft.content.length > 220
                      ? `${draft.content.slice(0, 220)}...`
                      : draft.content}
                  </div>
                </Card.Body>
              </Card>
            ))}
          </Card.Body>
        </Card>
      )}

      {reviewResult && (
        <>
          <Card className="shadow-sm mb-4">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-3">
                <div>
                  <h3 className="mb-1">Review Summary</h3>
                  <div className="text-muted">
                    Draft ID: <strong>{reviewResult.draftId}</strong>
                  </div>
                </div>

                <Badge bg="primary" pill>
                  Confidence: {reviewResult.overallConfidence}%
                </Badge>
              </div>

              <p className="mb-3">{reviewResult.summary}</p>

              <Row>
                <Col md={4} className="mb-2">
                  <div className="small text-muted">Retrieval Used</div>
                  <div>{reviewResult.retrievalUsed ? "Yes" : "No"}</div>
                </Col>
                <Col md={4} className="mb-2">
                  <div className="small text-muted">Initial Confidence</div>
                  <div>{reviewResult.initialConfidence ?? "N/A"}%</div>
                </Col>
                <Col md={4} className="mb-2">
                  <div className="small text-muted">Final Confidence</div>
                  <div>{reviewResult.finalConfidence ?? "N/A"}%</div>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          <Card className="shadow-sm mb-4">
            <Card.Body>
              <h4 className="mb-3">Issues</h4>

              {!reviewResult.issues?.length ? (
                <Alert variant="info" className="mb-0">
                  No issues were identified for this draft.
                </Alert>
              ) : (
                reviewResult.issues.map((issue, index) => (
                  <Card key={index} className="mb-3 border-0 bg-light">
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-2">
                        <div className="fw-bold text-capitalize">
                          {issue.type.replaceAll("_", " ")}
                        </div>

                        <div className="d-flex gap-2">
                          <Badge bg={severityVariant(issue.severity)}>
                            {issue.severity}
                          </Badge>
                          <Badge bg="dark">{issue.confidence}%</Badge>
                        </div>
                      </div>

                      <p className="mb-3">{issue.description}</p>

                      <div className="mb-2">
                        <div className="fw-semibold">Suggestions</div>
                        <ul className="mb-0">
                          {issue.suggestions.map((suggestion, sIndex) => (
                            <li key={sIndex}>{suggestion}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="mt-3">
                        <div className="fw-semibold mb-1">Citations</div>
                        <div className="d-flex gap-2 flex-wrap">
                          {issue.citations.map((citation, cIndex) => (
                            <Badge key={cIndex} bg="secondary">
                              {citation}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                ))
              )}
            </Card.Body>
          </Card>

          <Card className="shadow-sm mb-4">
            <Card.Body>
              <h4 className="mb-3">Reflection Notes</h4>

              {!reviewResult.reflectionNotes?.length ? (
                <Alert variant="secondary" className="mb-0">
                  No reflection notes available.
                </Alert>
              ) : (
                <ul className="mb-0">
                  {reviewResult.reflectionNotes.map((note, index) => (
                    <li key={index}>{note}</li>
                  ))}
                </ul>
              )}
            </Card.Body>
          </Card>
        </>
      )}
    </Container>
  );
}

export default App;

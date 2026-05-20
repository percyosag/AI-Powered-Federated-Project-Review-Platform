// import { useEffect, useState, lazy, Suspense } from "react";
// import { gql } from "@apollo/client";
// import { useApolloClient, useMutation } from "@apollo/client/react";
// import { Container, Card, Spinner, Alert } from "react-bootstrap";
// import ShellNavbar from "./components/ShellNavbar.jsx";

// const AuthApp = lazy(() => import("authApp/App"));
// const ProjectsApp = lazy(() => import("projectsApp/App"));
// const AiReviewApp = lazy(() => import("aiReviewApp/App"));

// const CURRENT_USER_QUERY = gql`
//   query CurrentUser {
//     currentUser {
//       id
//       username
//       email
//       role
//     }
//   }
// `;

// const LOGOUT_MUTATION = gql`
//   mutation Logout {
//     logout
//   }
// `;

// function App() {
//   const client = useApolloClient();

//   const [checkingAuth, setCheckingAuth] = useState(true);
//   const [currentUser, setCurrentUser] = useState(null);
//   const [authError, setAuthError] = useState("");
//   const [activeView, setActiveView] = useState("projects");

//   const [logout, { loading: logoutLoading }] = useMutation(LOGOUT_MUTATION, {
//     onCompleted: async () => {
//       await checkAuth();
//       window.dispatchEvent(new Event("auth-changed"));
//     },
//     onError: async () => {
//       await checkAuth();
//     },
//   });

//   const checkAuth = async () => {
//     setCheckingAuth(true);
//     setAuthError("");

//     try {
//       const { data } = await client.query({
//         query: CURRENT_USER_QUERY,
//         fetchPolicy: "network-only",
//       });

//       setCurrentUser(data?.currentUser || null);
//     } catch (error) {
//       setCurrentUser(null);
//       setAuthError(error.message || "Failed to check authentication.");
//     } finally {
//       setCheckingAuth(false);
//     }
//   };

//   useEffect(() => {
//     checkAuth();

//     const handler = () => {
//       checkAuth();
//     };

//     window.addEventListener("auth-changed", handler);

//     return () => {
//       window.removeEventListener("auth-changed", handler);
//     };
//   }, []);

//   const handleLogout = async () => {
//     await logout();
//   };

//   if (checkingAuth) {
//     return (
//       <Container className="py-5">
//         <Card className="shadow-sm">
//           <Card.Body className="d-flex align-items-center gap-2">
//             <Spinner animation="border" size="sm" />
//             <span>Checking authentication...</span>
//           </Card.Body>
//         </Card>
//       </Container>
//     );
//   }

//   if (!currentUser) {
//     return (
//       <Container className="py-5">
//         <Card className="shadow-sm">
//           <Card.Body>
//             <h1 className="mb-3">DevPilot 2026 Shell App</h1>
//             <p className="text-muted mb-4">
//               Welcome to DevPilot 2026. Please log in to continue.
//             </p>

//             {authError && <Alert variant="warning">{authError}</Alert>}

//             <Suspense
//               fallback={
//                 <div className="d-flex align-items-center gap-2">
//                   <Spinner animation="border" size="sm" />
//                   <span>Loading auth app...</span>
//                 </div>
//               }
//             >
//               <AuthApp />
//             </Suspense>
//           </Card.Body>
//         </Card>
//       </Container>
//     );
//   }

//   return (
//     <>
//       <ShellNavbar
//         user={currentUser}
//         onLogout={handleLogout}
//         logoutLoading={logoutLoading}
//         activeView={activeView}
//         onChangeView={setActiveView}
//       />

//       <Container className="pb-5">
//         <Suspense
//           fallback={
//             <Card className="shadow-sm">
//               <Card.Body className="d-flex align-items-center gap-2">
//                 <Spinner animation="border" size="sm" />
//                 <span>Loading remote app...</span>
//               </Card.Body>
//             </Card>
//           }
//         >
//           {activeView === "projects" && (
//             <ProjectsApp currentUser={currentUser} />
//           )}
//           {activeView === "ai-review" && <AiReviewApp />}
//         </Suspense>
//       </Container>
//     </>
//   );
// }

// export default App;

import { useEffect, useState, lazy, Suspense } from "react";
import { gql } from "@apollo/client";
import { useApolloClient, useMutation } from "@apollo/client/react";
import { Container, Card, Spinner, Alert, Badge } from "react-bootstrap";
import ShellNavbar from "./components/ShellNavbar.jsx";
import "./App.css";

const AuthApp = lazy(() => import("authApp/App"));
const ProjectsApp = lazy(() => import("projectsApp/App"));
const AiReviewApp = lazy(() => import("aiReviewApp/App"));

const CURRENT_USER_QUERY = gql`
  query CurrentUser {
    currentUser {
      id
      username
      email
      role
    }
  }
`;

const LOGOUT_MUTATION = gql`
  mutation Logout {
    logout
  }
`;

const viewContent = {
  projects: {
    eyebrow: "Project Workspace",
    title: "Project Review Workspace",
    description:
      "Create projects, manage feature requests, submit implementation drafts, and prepare them for AI-assisted review.",
  },
  "ai-review": {
    eyebrow: "AI Review",
    title: "AI-Powered Draft Review",
    description:
      "Review submitted drafts using retrieval-augmented generation, structured feedback, reflection notes, confidence scores, and citations.",
  },
};

function App() {
  const client = useApolloClient();

  const [checkingAuth, setCheckingAuth] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [authError, setAuthError] = useState("");
  const [activeView, setActiveView] = useState("projects");

  const [logout, { loading: logoutLoading }] = useMutation(LOGOUT_MUTATION, {
    onCompleted: async () => {
      await checkAuth();
      window.dispatchEvent(new Event("auth-changed"));
    },
    onError: async () => {
      await checkAuth();
    },
  });

  const checkAuth = async () => {
    setCheckingAuth(true);
    setAuthError("");

    try {
      const { data } = await client.query({
        query: CURRENT_USER_QUERY,
        fetchPolicy: "network-only",
      });

      setCurrentUser(data?.currentUser || null);
    } catch (error) {
      setCurrentUser(null);
      setAuthError(error.message || "Failed to check authentication.");
    } finally {
      setCheckingAuth(false);
    }
  };

  useEffect(() => {
    checkAuth();

    const handler = () => {
      checkAuth();
    };

    window.addEventListener("auth-changed", handler);

    return () => {
      window.removeEventListener("auth-changed", handler);
    };
  }, []);

  const handleLogout = async () => {
    await logout();
  };

  if (checkingAuth) {
    return (
      <main className="shell-page shell-page-center">
        <Card className="shell-status-card">
          <Card.Body className="d-flex align-items-center gap-3">
            <Spinner animation="border" size="sm" />
            <div>
              <h1 className="shell-status-title">Loading workspace</h1>
              <p className="shell-status-text mb-0">
                Checking your authentication session...
              </p>
            </div>
          </Card.Body>
        </Card>
      </main>
    );
  }

  if (!currentUser) {
    return (
      <main className="shell-auth-page">
        <Container className="shell-auth-container">
          <section className="shell-auth-hero">
            <Badge className="shell-badge">Federated AI Platform</Badge>
            <h1>AI-Powered Federated Project Review Platform</h1>
            <p>
              Manage software projects, submit implementation drafts, and
              receive structured AI review feedback through a micro frontend and
              federated GraphQL architecture.
            </p>

            <div className="shell-feature-grid">
              <div>
                <span>01</span>
                <strong>Micro Frontends</strong>
                <p>Shell, Auth, Projects, and AI Review remotes.</p>
              </div>
              <div>
                <span>02</span>
                <strong>GraphQL Federation</strong>
                <p>Apollo Gateway connects independent subgraphs.</p>
              </div>
              <div>
                <span>03</span>
                <strong>Agentic RAG</strong>
                <p>Structured review with reflection and citations.</p>
              </div>
            </div>
          </section>

          <Card className="shell-auth-card">
            <Card.Body>
              <div className="shell-card-header">
                <Badge className="shell-badge shell-badge-muted">
                  Secure Session Login
                </Badge>
                <h2>Welcome back</h2>
                <p>
                  Register or log in to access your project review workspace.
                </p>
              </div>

              {authError && (
                <Alert variant="warning" className="shell-alert">
                  {authError}
                </Alert>
              )}

              <Suspense
                fallback={
                  <div className="shell-loading-inline">
                    <Spinner animation="border" size="sm" />
                    <span>Loading authentication app...</span>
                  </div>
                }
              >
                <AuthApp />
              </Suspense>
            </Card.Body>
          </Card>
        </Container>
      </main>
    );
  }

  const currentView = viewContent[activeView] || viewContent.projects;

  return (
    <div className="shell-app">
      <ShellNavbar
        user={currentUser}
        onLogout={handleLogout}
        logoutLoading={logoutLoading}
        activeView={activeView}
        onChangeView={setActiveView}
      />

      <main className="shell-main">
        <Container fluid="lg">
          <section className="shell-dashboard-header">
            <div>
              <Badge className="shell-badge">{currentView.eyebrow}</Badge>
              <h1>{currentView.title}</h1>
              <p>{currentView.description}</p>
            </div>

            <div className="shell-user-card">
              <span>Signed in as</span>
              <strong>{currentUser.username}</strong>
              <small>{currentUser.email}</small>
            </div>
          </section>

          <section className="shell-platform-summary">
            <Card>
              <Card.Body>
                <span>Frontend</span>
                <strong>Micro Frontends</strong>
                <small>Shell + remote apps</small>
              </Card.Body>
            </Card>

            <Card>
              <Card.Body>
                <span>API Layer</span>
                <strong>Apollo Gateway</strong>
                <small>Single GraphQL endpoint</small>
              </Card.Body>
            </Card>

            <Card>
              <Card.Body>
                <span>AI Workflow</span>
                <strong>Agentic RAG</strong>
                <small>Retrieval + reflection</small>
              </Card.Body>
            </Card>
          </section>

          <section className="shell-remote-surface">
            <Suspense
              fallback={
                <Card className="shell-status-card">
                  <Card.Body className="d-flex align-items-center gap-3">
                    <Spinner animation="border" size="sm" />
                    <div>
                      <h2 className="shell-status-title">Loading module</h2>
                      <p className="shell-status-text mb-0">
                        Loading the selected remote application...
                      </p>
                    </div>
                  </Card.Body>
                </Card>
              }
            >
              {activeView === "projects" && (
                <ProjectsApp currentUser={currentUser} />
              )}
              {activeView === "ai-review" && <AiReviewApp />}
            </Suspense>
          </section>
          <footer className="shell-footer">
            <div>
              <strong>AI-Powered Federated Project Review Platform</strong>
              <span>
                React Micro Frontends • Apollo Federation • Agentic RAG
              </span>
            </div>

            <small>
              Academic group project refined for portfolio presentation.
            </small>
          </footer>
        </Container>
      </main>
    </div>
  );
}

export default App;

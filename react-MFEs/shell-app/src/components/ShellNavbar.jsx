import { Navbar, Container, Nav, Button } from "react-bootstrap";

function ShellNavbar({
  user,
  onLogout,
  logoutLoading,
  activeView,
  onChangeView,
}) {
  return (
    <Navbar bg="dark" variant="dark" expand="lg" className="mb-4 border-bottom">
      <Container>
        <Navbar.Brand>Federated Review Platform</Navbar.Brand>

        <Nav className="me-auto">
          <Nav.Link
            active={activeView === "projects"}
            onClick={() => onChangeView("projects")}
          >
            Projects
          </Nav.Link>
          <Nav.Link
            active={activeView === "ai-review"}
            onClick={() => onChangeView("ai-review")}
          >
            AI Review
          </Nav.Link>
        </Nav>

        <Nav className="ms-auto d-flex align-items-center gap-3">
          <span className="text-light small">
            Signed in as <strong>{user.username}</strong> ({user.role})
          </span>

          <Button
            variant="outline-light"
            size="sm"
            onClick={onLogout}
            disabled={logoutLoading}
          >
            {logoutLoading ? "Logging out..." : "Logout"}
          </Button>
        </Nav>
      </Container>
    </Navbar>
  );
}

export default ShellNavbar;

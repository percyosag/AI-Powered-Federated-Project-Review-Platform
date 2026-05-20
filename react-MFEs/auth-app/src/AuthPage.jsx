// import { useState } from "react";
// import { useMutation } from "@apollo/client/react";
// import {
//   Container,
//   Card,
//   Nav,
//   Form,
//   Button,
//   Alert,
//   Spinner,
// } from "react-bootstrap";
// import { LOGIN_MUTATION, REGISTER_MUTATION } from "./graphql/mutations";

// function AuthPage() {
//   const [activeTab, setActiveTab] = useState("login");

//   const [loginForm, setLoginForm] = useState({
//     email: "",
//     password: "",
//   });

//   const [registerForm, setRegisterForm] = useState({
//     username: "",
//     email: "",
//     password: "",
//   });

//   const [message, setMessage] = useState("");
//   const [errorMessage, setErrorMessage] = useState("");

//   const [login, { loading: loginLoading }] = useMutation(LOGIN_MUTATION, {
//     onCompleted: (data) => {
//       setErrorMessage("");
//       setMessage(`Logged in successfully as ${data.login.username}`);
//       window.dispatchEvent(new Event("auth-changed"));
//     },
//     onError: (error) => {
//       setMessage("");
//       setErrorMessage(error.message || "Login failed");
//     },
//   });

//   const [register, { loading: registerLoading }] = useMutation(
//     REGISTER_MUTATION,
//     {
//       onCompleted: (data) => {
//         setErrorMessage("");
//         setMessage(
//           `Account created for ${data.register.username}. You can now log in.`,
//         );
//         setActiveTab("login");
//         setLoginForm({
//           email: registerForm.email,
//           password: "",
//         });
//         setRegisterForm({
//           username: "",
//           email: "",
//           password: "",
//         });
//       },
//       onError: (error) => {
//         setMessage("");
//         setErrorMessage(error.message || "Registration failed");
//       },
//     },
//   );

//   const handleLoginChange = (e) => {
//     const { name, value } = e.target;
//     setLoginForm((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//   };

//   const handleRegisterChange = (e) => {
//     const { name, value } = e.target;
//     setRegisterForm((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//   };

//   const handleLoginSubmit = async (e) => {
//     e.preventDefault();
//     setMessage("");
//     setErrorMessage("");

//     if (!loginForm.email.trim() || !loginForm.password.trim()) {
//       setErrorMessage("Email and password are required.");
//       return;
//     }

//     await login({
//       variables: {
//         email: loginForm.email.trim(),
//         password: loginForm.password,
//       },
//     });
//   };

//   const handleRegisterSubmit = async (e) => {
//     e.preventDefault();
//     setMessage("");
//     setErrorMessage("");

//     if (
//       !registerForm.username.trim() ||
//       !registerForm.email.trim() ||
//       !registerForm.password.trim()
//     ) {
//       setErrorMessage("Username, email, and password are required.");
//       return;
//     }

//     await register({
//       variables: {
//         username: registerForm.username.trim(),
//         email: registerForm.email.trim(),
//         password: registerForm.password,
//       },
//     });
//   };

//   return (
//     <Container className="py-5">
//       <Card className="shadow-sm">
//         <Card.Body>
//           <h1 className="mb-3">DevPilot 2026 Auth</h1>
//           <p className="text-muted mb-4">
//             Access your developer workspace by logging in or registering.
//           </p>

//           <Nav
//             variant="tabs"
//             activeKey={activeTab}
//             onSelect={(selectedKey) => {
//               setActiveTab(selectedKey || "login");
//               setMessage("");
//               setErrorMessage("");
//             }}
//             className="mb-4"
//           >
//             <Nav.Item>
//               <Nav.Link eventKey="login">Login</Nav.Link>
//             </Nav.Item>
//             <Nav.Item>
//               <Nav.Link eventKey="register">Register</Nav.Link>
//             </Nav.Item>
//           </Nav>

//           {message && <Alert variant="success">{message}</Alert>}
//           {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}

//           {activeTab === "login" && (
//             <Form onSubmit={handleLoginSubmit}>
//               <Form.Group className="mb-3">
//                 <Form.Label>Email</Form.Label>
//                 <Form.Control
//                   type="email"
//                   name="email"
//                   value={loginForm.email}
//                   onChange={handleLoginChange}
//                   placeholder="Enter your email"
//                 />
//               </Form.Group>

//               <Form.Group className="mb-4">
//                 <Form.Label>Password</Form.Label>
//                 <Form.Control
//                   type="password"
//                   name="password"
//                   value={loginForm.password}
//                   onChange={handleLoginChange}
//                   placeholder="Enter your password"
//                 />
//               </Form.Group>

//               <Button type="submit" disabled={loginLoading}>
//                 {loginLoading ? (
//                   <>
//                     <Spinner size="sm" animation="border" className="me-2" />
//                     Logging in...
//                   </>
//                 ) : (
//                   "Login"
//                 )}
//               </Button>
//             </Form>
//           )}

//           {activeTab === "register" && (
//             <Form onSubmit={handleRegisterSubmit}>
//               <Form.Group className="mb-3">
//                 <Form.Label>Username</Form.Label>
//                 <Form.Control
//                   type="text"
//                   name="username"
//                   value={registerForm.username}
//                   onChange={handleRegisterChange}
//                   placeholder="Choose a username"
//                 />
//               </Form.Group>

//               <Form.Group className="mb-3">
//                 <Form.Label>Email</Form.Label>
//                 <Form.Control
//                   type="email"
//                   name="email"
//                   value={registerForm.email}
//                   onChange={handleRegisterChange}
//                   placeholder="Enter your email"
//                 />
//               </Form.Group>

//               <Form.Group className="mb-4">
//                 <Form.Label>Password</Form.Label>
//                 <Form.Control
//                   type="password"
//                   name="password"
//                   value={registerForm.password}
//                   onChange={handleRegisterChange}
//                   placeholder="Create a password"
//                 />
//               </Form.Group>

//               <Button type="submit" disabled={registerLoading}>
//                 {registerLoading ? (
//                   <>
//                     <Spinner size="sm" animation="border" className="me-2" />
//                     Creating account...
//                   </>
//                 ) : (
//                   "Register"
//                 )}
//               </Button>
//             </Form>
//           )}
//         </Card.Body>
//       </Card>
//     </Container>
//   );
// }

// export default AuthPage;

import { useState } from "react";
import { useMutation } from "@apollo/client/react";
import { Nav, Form, Button, Alert, Spinner, Badge } from "react-bootstrap";
import { LOGIN_MUTATION, REGISTER_MUTATION } from "./graphql/mutations";

function AuthPage() {
  const [activeTab, setActiveTab] = useState("login");

  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  });

  const [registerForm, setRegisterForm] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [login, { loading: loginLoading }] = useMutation(LOGIN_MUTATION, {
    onCompleted: (data) => {
      setErrorMessage("");
      setMessage(`Logged in successfully as ${data.login.username}`);
      window.dispatchEvent(new Event("auth-changed"));
    },
    onError: (error) => {
      setMessage("");
      setErrorMessage(error.message || "Login failed");
    },
  });

  const [register, { loading: registerLoading }] = useMutation(
    REGISTER_MUTATION,
    {
      onCompleted: (data) => {
        setErrorMessage("");
        setMessage(
          `Account created for ${data.register.username}. You can now log in.`,
        );
        setActiveTab("login");
        setLoginForm({
          email: registerForm.email,
          password: "",
        });
        setRegisterForm({
          username: "",
          email: "",
          password: "",
        });
      },
      onError: (error) => {
        setMessage("");
        setErrorMessage(error.message || "Registration failed");
      },
    },
  );

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRegisterChange = (e) => {
    const { name, value } = e.target;
    setRegisterForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setErrorMessage("");

    if (!loginForm.email.trim() || !loginForm.password.trim()) {
      setErrorMessage("Email and password are required.");
      return;
    }

    await login({
      variables: {
        email: loginForm.email.trim(),
        password: loginForm.password,
      },
    });
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setErrorMessage("");

    if (
      !registerForm.username.trim() ||
      !registerForm.email.trim() ||
      !registerForm.password.trim()
    ) {
      setErrorMessage("Username, email, and password are required.");
      return;
    }

    await register({
      variables: {
        username: registerForm.username.trim(),
        email: registerForm.email.trim(),
        password: registerForm.password,
      },
    });
  };

  return (
    <section className="auth-module">
      <div className="auth-module-header">
        <Badge className="auth-badge">HTTP-only session auth</Badge>
        <h2>Access workspace</h2>
        <p>Log in or create an account to continue to the review platform.</p>
      </div>

      <Nav
        variant="tabs"
        activeKey={activeTab}
        onSelect={(selectedKey) => {
          setActiveTab(selectedKey || "login");
          setMessage("");
          setErrorMessage("");
        }}
        className="auth-tabs"
      >
        <Nav.Item>
          <Nav.Link eventKey="login">Login</Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link eventKey="register">Register</Nav.Link>
        </Nav.Item>
      </Nav>

      {message && (
        <Alert variant="success" className="auth-alert">
          {message}
        </Alert>
      )}

      {errorMessage && (
        <Alert variant="danger" className="auth-alert">
          {errorMessage}
        </Alert>
      )}

      {activeTab === "login" && (
        <Form onSubmit={handleLoginSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              name="email"
              value={loginForm.email}
              onChange={handleLoginChange}
              placeholder="Enter your email"
            />
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              name="password"
              value={loginForm.password}
              onChange={handleLoginChange}
              placeholder="Enter your password"
            />
          </Form.Group>

          <Button
            type="submit"
            className="auth-submit-btn"
            disabled={loginLoading}
          >
            {loginLoading ? (
              <>
                <Spinner size="sm" animation="border" className="me-2" />
                Logging in...
              </>
            ) : (
              "Login"
            )}
          </Button>
        </Form>
      )}

      {activeTab === "register" && (
        <Form onSubmit={handleRegisterSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Username</Form.Label>
            <Form.Control
              type="text"
              name="username"
              value={registerForm.username}
              onChange={handleRegisterChange}
              placeholder="Choose a username"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              name="email"
              value={registerForm.email}
              onChange={handleRegisterChange}
              placeholder="Enter your email"
            />
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              name="password"
              value={registerForm.password}
              onChange={handleRegisterChange}
              placeholder="Create a password"
            />
          </Form.Group>

          <Button
            type="submit"
            className="auth-submit-btn"
            disabled={registerLoading}
          >
            {registerLoading ? (
              <>
                <Spinner size="sm" animation="border" className="me-2" />
                Creating account...
              </>
            ) : (
              "Create Account"
            )}
          </Button>
        </Form>
      )}
    </section>
  );
}

export default AuthPage;

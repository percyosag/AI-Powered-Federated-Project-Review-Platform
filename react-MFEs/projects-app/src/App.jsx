import ProjectsDashboard from "./components/ProjectsDashboard.jsx";
import "./App.css";

function App({ currentUser }) {
  return <ProjectsDashboard currentUser={currentUser} />;
}

export default App;

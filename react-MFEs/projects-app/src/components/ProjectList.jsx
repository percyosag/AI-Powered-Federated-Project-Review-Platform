// import { Card, ListGroup, Badge } from "react-bootstrap";

// function ProjectList({ projects, selectedProjectId, onSelectProject }) {
//   return (
//     <Card className="h-100 border">
//       <Card.Body>
//         <div className="d-flex justify-content-between align-items-center mb-3">
//           <h4 className="mb-0">My Projects</h4>
//           <Badge bg="secondary">{projects.length}</Badge>
//         </div>

//         {projects.length === 0 ? (
//           <p className="text-muted mb-0">
//             No projects yet. Create your first project to get started.
//           </p>
//         ) : (
//           <ListGroup>
//             {projects.map((project) => (
//               <ListGroup.Item
//                 key={project.id}
//                 action
//                 active={selectedProjectId === project.id}
//                 onClick={() => onSelectProject(project.id)}
//                 className="py-3"
//               >
//                 <div className="fw-bold">{project.title}</div>
//                 <div className="small text-muted">
//                   {project.description.length > 90
//                     ? `${project.description.slice(0, 90)}...`
//                     : project.description}
//                 </div>
//               </ListGroup.Item>
//             ))}
//           </ListGroup>
//         )}
//       </Card.Body>
//     </Card>
//   );
// }

// export default ProjectList;

import { Card, ListGroup, Badge } from "react-bootstrap";

function ProjectList({ projects, selectedProjectId, onSelectProject }) {
  return (
    <Card className="project-card project-list-card">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <span className="section-label">Workspace</span>
            <h4 className="mb-0">My Projects</h4>
          </div>

          <Badge className="count-badge">{projects.length}</Badge>
        </div>

        {projects.length === 0 ? (
          <p className="muted-text mb-0">
            No projects yet. Create your first project to get started.
          </p>
        ) : (
          <ListGroup className="project-list-scroll">
            {projects.map((project) => (
              <ListGroup.Item
                key={project.id}
                action
                active={selectedProjectId === project.id}
                onClick={() => onSelectProject(project.id)}
                className="project-list-item"
              >
                <div className="fw-bold">{project.title}</div>
                <div className="small">
                  {project.description.length > 90
                    ? `${project.description.slice(0, 90)}...`
                    : project.description}
                </div>
              </ListGroup.Item>
            ))}
          </ListGroup>
        )}
      </Card.Body>
    </Card>
  );
}

export default ProjectList;

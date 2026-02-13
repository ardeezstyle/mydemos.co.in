import { useParams, Link } from "react-router-dom";
import { getProjectById } from "../data/projects";

export default function ProjectDetails() {
  const { id } = useParams();
  const project = id ? getProjectById(id) : undefined;

  if (!project) {
    return (
      <div className="container">
        <h2>Project Not Found</h2>
        <Link to="/">Go Back</Link>
      </div>
    );
  }

  return (
    <div className="container">
      <Link to="/">← Back to Projects</Link>

      <h1>{project.name}</h1>
      <p><strong>Framework:</strong> {project.framework}</p>
      <p>{project.description}</p>

      <div className="details-actions">
        <a
          href={project.domain}
          target="_blank"
          rel="noopener noreferrer"
        >
          Launch Full Demo
        </a>

        {project.github && (
          <a href={project.github} target="_blank">
            View GitHub
          </a>
        )}
      </div>

      {/* Future Hosting Area */}
      <div className="demo-placeholder">
        <h3>Embedded Demo (Coming Soon)</h3>
        <div className="demo-box">
          Demo application will be hosted here later.
        </div>
      </div>
    </div>
  );
}

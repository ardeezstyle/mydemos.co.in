import { Link } from "react-router-dom";
import type { Project } from "../data/projects";

type Props = {
  project: Project;
};

export default function ProjectCard({ project }: Props) {
  return (
    <div className="card">
      <div className="card-header">
        <h3>{project.name}</h3>
        <span className="badge">{project.framework}</span>
      </div>

      <p>{project.description}</p>

      <div className="actions">
        <Link to={`/project/${project.id}`}>View Details</Link>
      </div>
    </div>
  );
}

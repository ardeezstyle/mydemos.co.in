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
        <a href={project.domain} target="_blank" rel="noopener noreferrer">
          View Demo
        </a>
        {project.github && (
          <a href={project.github} target="_blank">
            GitHub
          </a>
        )}
      </div>
    </div>
  );
}

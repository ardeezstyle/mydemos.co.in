import { useState } from "react";
import { projects, type Framework } from "../data/projects";
import ProjectCard from "../components/ProjectCard";
import FilterBar from "../components/FilterBar";
import Header from "../components/Header";

export default function Home() {
  const [filter, setFilter] = useState<Framework | "All">("All");

  const filteredProjects =
    filter === "All"
      ? projects
      : projects.filter((p) => p.framework === filter);

  return (
    <div className="container">
      <Header />
      <FilterBar selected={filter} onChange={setFilter} />

      <div className="grid">
        {filteredProjects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </div>
  );
}

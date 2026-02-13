export type Framework = "React" | "Angular" | "Vanilla";

export type Project = {
  id: string;
  name: string;
  framework: Framework;
  description: string;
  domain: string;
  github?: string;
};

export const projects: Project[] = [
  {
    id: "kanban",
    name: "Kanban Board",
    framework: "React",
    description: "Drag and drop task management system.",
    domain: "https://kanban.mydemos.co.in"
  },
  {
    id: "data-grid",
    name: "Advanced Data Grid",
    framework: "Angular",
    description: "Virtual scroll, sorting, filtering and performance optimizations.",
    domain: "https://grid.mydemos.co.in"
  }
];

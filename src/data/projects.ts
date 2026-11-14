export type Framework = "React" | "Angular" | "Vanilla" | "Google Sites";

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
  },
  {
    id: "namma-metro",
    name: "Namma Metro Interactive Network Map",
    framework: "Google Sites",
    description: "An interactive, beautifully designed Namma Metro map web application featuring all operational and upcoming lines, station markers, interchange hubs, filter toggles, search, and detailed popups.",
    domain: "https://sites.google.com/view/namma-metro-interactive-map"
  }
];


export const getProjectById = (id: string) =>
    projects.find((p) => p.id === id);
  

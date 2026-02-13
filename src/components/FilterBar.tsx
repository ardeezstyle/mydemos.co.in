import type { Framework } from "../data/projects";

type Props = {
  selected: Framework | "All";
  onChange: (value: Framework | "All") => void;
};

const frameworks: (Framework | "All")[] = ["All", "React", "Angular", "Vanilla"];

export default function FilterBar({ selected, onChange }: Props) {
  return (
    <div className="filter-bar">
      {frameworks.map((fw) => (
        <button
          key={fw}
          className={selected === fw ? "active" : ""}
          onClick={() => onChange(fw)}
        >
          {fw}
        </button>
      ))}
    </div>
  );
}

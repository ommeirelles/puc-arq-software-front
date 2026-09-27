import { useState } from "react";

interface CategoryFilterProps {
  categories: string[];
  selected: Set<string>;
  onToggle: (category: string) => void;
  onToggleAll: (selectAll: boolean) => void;
  onClose?: () => void;
}

export function CategoryFilter({
  categories,
  selected,
  onToggle,
  onToggleAll,
  onClose,
}: CategoryFilterProps) {
  const [collapsed, setCollapsed] = useState(false);

  const allSelected =
    categories.length > 0 && categories.every((c) => selected.has(c));

  if (collapsed && !onClose)
    return (
      <aside className="flex flex-col items-center py-4 px-1 bg-base-100 shadow-sm shrink-0 h-full">
        <button
          className="btn btn-ghost btn-square btn-sm"
          onClick={() => setCollapsed(false)}
          title="Show category filters"
        >
          <span className="material-symbols-outlined">chevron_right</span>
        </button>
      </aside>
    );

  return (
    <aside className="w-64 h-full shrink-0 bg-base-100 shadow-sm p-4 overflow-auto">
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-semibold text-lg flex items-center gap-2">
          <span className="material-symbols-outlined">filter_list</span>
          Categories
        </h2>
        {onClose ? (
          <button
            className="btn btn-ghost btn-square btn-sm"
            onClick={onClose}
            title="Close filters"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        ) : (
          <button
            className="btn btn-ghost btn-square btn-sm"
            onClick={() => setCollapsed(true)}
            title="Hide category filters"
          >
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
        )}
      </div>
      <button
        className="btn btn-soft btn-sm btn-secondary w-full mb-2"
        onClick={() => onToggleAll(!allSelected)}
      >
        {allSelected ? "Unselect all" : "Select all"}
      </button>
      <ul className="flex flex-col gap-1">
        {categories.map((category) => (
          <li key={category}>
            <label className="label cursor-pointer justify-start gap-3">
              <input
                type="checkbox"
                className="checkbox checkbox-sm checkbox-secondary"
                checked={selected.has(category)}
                onChange={() => onToggle(category)}
              />
              <span className="label-text capitalize">{category}</span>
            </label>
          </li>
        ))}
      </ul>
    </aside>
  );
}

import { useState } from "react";
import { Filter } from "lucide-react";

interface FilterOption {
  label: string;
  value: string;
  className?: string;
}

interface ProductFiltersProps {
  setFilter: (value: string) => void;
  options: FilterOption[];
}

export default function ProductFilters({ setFilter, options }: ProductFiltersProps) {
  const [open, setOpen] = useState(false);

  const handleSelect = (value: string) => {
    setFilter(value);
    setOpen(false);
  };

  return (
    <div className="relative inline-block text-right">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center bg-white gap-2 p-2 border rounded-lg hover:bg-gray-100 transition-shadow shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
      >
        <Filter size={18} />
        <span className="hidden md:block text-sm text-gray-600 font-medium">Filtrar</span>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-44 bg-white border rounded-lg shadow-lg py-1 z-50">
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleSelect(opt.value)}
              className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors ${opt.className || ""}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

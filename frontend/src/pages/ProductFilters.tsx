import { useState } from "react";
import { Filter } from "lucide-react";

interface ProductFiltersProps {
  setFilter: (value: "all" | "available" | "out") => void;
}

function ProductFilters({ setFilter }: ProductFiltersProps) {
  const [open, setOpen] = useState(false);

  const handleSelect = (value: "all" | "available" | "out") => {
    setFilter(value);
    setOpen(false);
  };

  return (
    <div className="inline-block text-right relative">
      <button
        onClick={() => setOpen(!open)}
        className="p-2 border rounded-lg hover:bg-gray-100 transition flex items-center gap-2"
      >
        <Filter size={18} />
        <span className="hidden md:block text-sm text-gray-600">Filtrar</span>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-40 bg-white border rounded-lg shadow-lg py-1 z-50">
          <button
            onClick={() => handleSelect("all")}
            className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
          >
            Todos
          </button>

          <button
            onClick={() => handleSelect("available")}
            className="block w-full text-left px-4 py-2 text-sm hover:bg-green-50 text-green-700"
          >
            Disponibles
          </button>

          <button
            onClick={() => handleSelect("out")}
            className="block w-full text-left px-4 py-2 text-sm hover:bg-red-50 text-red-700"
          >
            Agotados
          </button>
        </div>
      )}
    </div>
  );
}

export default ProductFilters;

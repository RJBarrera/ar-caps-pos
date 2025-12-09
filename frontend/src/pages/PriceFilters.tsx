import React from "react";

type Props = {
  show: boolean;
  toggle: () => void;
  priceOrder: "none" | "asc" | "desc";
  setPriceOrder: (v: "none" | "asc" | "desc") => void;
  minPrice: number | "";
  setMinPrice: (v: number | "") => void;
  maxPrice: number | "";
  setMaxPrice: (v: number | "") => void;
};

export default function PriceFilters({
  show,
  toggle,
  priceOrder,
  setPriceOrder,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
}: Props) {

  
  return (
    <div className="relative inline-block">
      {/* Botón abre/cierra */}
      <button
        onClick={toggle}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium 
                   bg-white border rounded-xl shadow-sm hover:bg-gray-50 
                   transition-all w-full sm:w-auto"
      >
        <span className="text-blue-800">⇅</span>
        <span className="hidden md:block text-sm text-gray-600 font-medium">Ordenar</span>
        {/* <span className="text-gray-400">{show ? "▲" : "▼"}</span> */}
      </button>

      {/* Panel */}
      {show && (
        <div className="absolute right-0 mt-2 w-80 bg-white border rounded-lg shadow-lg py-5 z-50 px-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <span className="text-blue-600 text-center">💲</span> Filtros de precio
          </h3>

          <div className="grid grid-cols-1 gap-4">

            {/* Orden */}
            <div className="flex flex-col">
              <label className="text-xs text-gray-500 mb-1">Orden</label>
              <select
                value={priceOrder}
                onChange={(e) =>
                  setPriceOrder(e.target.value as "none" | "asc" | "desc")
                }
                className="p-2 border rounded-xl bg-gray-50 shadow-sm text-sm 
                           focus:ring-2 focus:ring-blue-300"
              >
                <option value="none">Sin orden</option>
                <option value="asc">Menor a mayor</option>
                <option value="desc">Mayor a menor</option>
              </select>
            </div>

            {/* Mínimo */}
            <div className="flex flex-col">
              <label className="text-xs text-gray-500 mb-1">Mínimo</label>
              <input
                type="number"
                placeholder="$0"
                className="p-2 border rounded-xl bg-gray-50 shadow-sm text-sm 
                           focus:ring-2 focus:ring-blue-300"
                value={minPrice}
                onChange={(e) =>
                  setMinPrice(e.target.value ? Number(e.target.value) : "")
                }
              />
            </div>

            {/* Máximo */}
            <div className="flex flex-col">
              <label className="text-xs text-gray-500 mb-1">Máximo</label>
              <input
                type="number"
                placeholder="$999"
                className="p-2 border rounded-xl bg-gray-50 shadow-sm text-sm 
                           focus:ring-2 focus:ring-blue-300"
                value={maxPrice}
                onChange={(e) =>
                  setMaxPrice(e.target.value ? Number(e.target.value) : "")
                }
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

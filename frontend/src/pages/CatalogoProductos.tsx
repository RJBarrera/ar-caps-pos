import React, { useEffect, useState } from "react";
import ProductFilters from "./ProductFilters";
import { getProducts } from "../services/api";

type Product = {
  id: number;
  nombre: string;
  modelo?: string;
  precio: number;
  cantidad: number;
  imagen?: string;
  tipo?: "basica" | "premium"; // ← asegúrate de tener esto en tu BD
};

const BACKEND_URL = (import.meta as any).env?.VITE_API_IMG || "";

export default function CatalogoProductos() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    const data = await getProducts();
    setProducts(data);
  }

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.nombre.toLowerCase().includes(search.toLowerCase()) ||
      p.modelo?.toLowerCase().includes(search.toLowerCase());

    // Filtro de categoría
    const matchesCategory =
      filter === "basicas"
        ? p.modelo?.toLowerCase().includes("basica")
        : filter === "premium"
        ? p.modelo?.toLowerCase().includes("premium")
        : true; // all

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="px-4 py-6 min-h-screen bg-gray-50">
      {/* Encabezado */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Catálogo</h1>
        <p className="text-gray-500 mt-1 text-sm">
          Explora tus gorras favoritas.
        </p>
      </div>

      <div className="flex flex-row justify-center items-center gap-3 mb-8">
        {/* Input de búsqueda */}
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Buscar producto..."
            className="w-full p-3 pl-10 border rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-blue-300 outline-none transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {/* Icono lupa dentro del input */}
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">
            🔍
          </span>
        </div>

        {/* Botón/ícono de filtros */}
        <div>
          <ProductFilters
            setFilter={setFilter}
            options={[
              { label: "Todos", value: "all" },
              {
                label: "Premium",
                value: "premium",
                className: "text-red-700 hover:bg-red-50",
              },
              {
                label: "Básicas",
                value: "basicas",
                className: "text-blue-700 hover:bg-blue-100",
              },
            ]}
          />
        </div>
      </div>

      {/* Grid de productos */}

      {filteredProducts.length === 0 ? (
        <p className="text-center text-gray-500 mt-10">
          No se encontraron productos.
        </p>
      ) : (
        <div
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6"
        >
          {filteredProducts.map((p) => (
            <div
              key={p.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-lg transition-shadow flex flex-col items-center p-4 min-h-[260px]"
            >
              {/* Imagen */}
              <div className="w-full aspect-square bg-gray-100 rounded-xl overflow-hidden mb-3">
                {p.imagen ? (
                  <img
                    src={`${BACKEND_URL}${p.imagen}`}
                    alt={p.nombre}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-110 image-rendering-auto"
                  />
                ) : (
                  <span className="text-gray-400 text-sm flex items-center justify-center h-full">
                    Sin imagen
                  </span>
                )}
              </div>

              {/* Nombre */}
              <h2 className="font-semibold text-gray-800 text-sm truncate">
                {p.nombre}
              </h2>

              {/* Modelo */}
              {p.modelo && (
                <p className="text-xs text-gray-500 truncate">{p.modelo}</p>
              )}

              {/* Precio */}
              <p className="mt-2 text-blue-700 font-bold text-sm">
                ${p.precio.toLocaleString()}
              </p>

              {/* Stock */}
              <p
                className={`text-xs mt-1 font-medium ${p.cantidad > 0 ? "text-green-600" : "text-red-500"}`}
              >
                {p.cantidad > 0 ? `Stock: ${p.cantidad}` : "Agotado"}
              </p>

              {/* Botón WhatsApp */}
              <a
                href={`https://wa.me/526678063331?text=${encodeURIComponent(
                  `Hola, quiero información sobre esta Gorra: ${p.nombre} (${
                    p.modelo || "Sin modelo"
                  }), aún la tienes disponible? Gracias.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-2 text-green-600 font-medium text-xs bg-green-50 px-3 py-2 rounded-lg hover:bg-green-100 hover:scale-105 transition-all"
              >
                <span>📩 Info WhatsApp</span>
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

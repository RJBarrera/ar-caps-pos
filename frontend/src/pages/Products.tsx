import React, { useEffect, useState } from "react";
import ImagePreview from "./ImagePreview";
import ProductFilters from "./ProductFilters";
import PriceFilters from "./PriceFilters";
import { getProducts, createProduct, updateProduct } from "../services/api";

type Product = {
  id: number;
  nombre: string;
  modelo?: string;
  precio: number;
  cantidad: number;
  imagen?: string;
};

const BACKEND_URL = (import.meta as any).env?.VITE_API_IMG || "";

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [nombre, setNombre] = useState("");
  const [modelo, setModelo] = useState("");
  const [precio, setPrecio] = useState<number>(0);
  const [cantidad, setCantidad] = useState<number>(0);
  const [imagenFile, setImagenFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false); // Estado del modal
  const [filter, setFilter] = useState("all");
  const [priceOrder, setPriceOrder] = useState<"none" | "asc" | "desc">("none");
  const [minPrice, setMinPrice] = useState<number | "">("");
  const [maxPrice, setMaxPrice] = useState<number | "">("");
  const [showPriceFilters, setShowPriceFilters] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    const data = await getProducts();
    setProducts(data);
  }

  const totalInventario = products.reduce((sum, p) => sum + p.cantidad, 0);
  const totalProductos = products.length;

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const img = document.createElement("img");
    img.src = URL.createObjectURL(file);

    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d")!;

      let width = img.width;
      let height = img.height;
      canvas.width = width;
      canvas.height = height;

      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) return;

          const webpFile = new File(
            [blob],
            file.name.replace(/\.\w+$/, ".webp"),
            { type: "image/webp" }
          );

          setImagenFile(webpFile);
          setPreview(URL.createObjectURL(blob));
        },
        "image/webp",
        0.8
      );
    };
  }

  function resetForm() {
    setNombre("");
    setModelo("");
    setPrecio(0);
    setCantidad(0);
    setImagenFile(null);
    setPreview(null);
    setEditingProduct(null);
  }

  function openModal(p?: Product) {
    if (p) {
      setEditingProduct(p);
      setNombre(p.nombre);
      setModelo(p.modelo || "");
      setPrecio(p.precio);
      setCantidad(p.cantidad);
      setPreview(p.imagen ? `${BACKEND_URL}${p.imagen}` : null);
    } else {
      resetForm();
    }
    setShowModal(true);
  }

  function closeModal() {
    resetForm();
    setShowModal(false);
  }

  async function handleAddOrUpdate() {
    if (!nombre || !precio || !cantidad)
      return alert("Completa todos los campos");

    const formData = new FormData();
    formData.append("nombre", nombre);
    formData.append("modelo", modelo);
    formData.append("precio", precio.toString());
    formData.append("cantidad", cantidad.toString());
    if (imagenFile) formData.append("imagen", imagenFile);

    setLoading(true);
    try {
      if (editingProduct) await updateProduct(editingProduct.id, formData);
      else await createProduct(formData);
      closeModal();
      loadProducts();
    } finally {
      setLoading(false);
    }
  }

  const filteredProducts = products
    .filter((p) => {
      // Normaliza valores
      const nombre = p.nombre?.toLowerCase() ?? "";
      const modelo = p.modelo?.toLowerCase() ?? "";
      const searchText = (search ?? "").toLowerCase();

      // Búsqueda
      const matchesSearch =
        nombre.includes(searchText) || modelo.includes(searchText);

      // Detecta premium y estado por terminarse (<=2 unidades)
      const isPremium = modelo.includes("premium");
      // const isEnding = p.cantidad <= 2 && isPremium;
      const isEnding = p.cantidad > 0 && p.cantidad <= 2 && isPremium;

      // Filtros combinados
      const matchesFilter =
        filter === "available"
          ? p.cantidad > 0
          : filter === "out"
          ? p.cantidad === 0
          : filter === "basicas"
          ? modelo.includes("basica")
          : filter === "premium"
          ? isPremium
          : filter === "ending" // NUEVO: Premium por terminarse
          ? isEnding
          : true; // all

      // Rango de precios (aseguramos números)
      const price = Number(p.precio);
      const min = minPrice === "" ? -Infinity : Number(minPrice);
      const max = maxPrice === "" ? Infinity : Number(maxPrice);

      const matchesMin = price >= min;
      const matchesMax = price <= max;

      return matchesSearch && matchesFilter && matchesMin && matchesMax;
    })
    .sort((a, b) => {
      if (priceOrder === "asc") return a.precio - b.precio;
      if (priceOrder === "desc") return b.precio - a.precio;
      return 0;
    });

  const categoryOptions = ["Basicas", "Premium"];

  return (
    <div className="p-4 min-h-screen">
      {/* Header con botón para abrir modal */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg shadow p-4 mb-6">
        <div>
          <h2 className="text-xl font-semibold">Panel de Productos</h2>
          <p className="text-sm opacity-80">
            Agrega, edita o busca tus productos fácilmente
          </p>
        </div>
        <button
          className="bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold shadow hover:bg-gray-100 mt-2 md:mt-0"
          onClick={() => openModal()}
        >
          + Nuevo Producto
        </button>
      </div>

      {/* Resumen minimalista */}
      <div className="mb-3 text-[14px] text-gray-500 select-none">
        <span className="text-gray-700 font-semibold">{totalProductos}</span>{" "}
        productos
        <span className="mx-1 text-gray-300">|</span>
        <span className="text-gray-700 font-semibold">
          {totalInventario}
        </span>{" "}
        unidades
      </div>

      {/* Buscador + Filtro en la misma línea */}
      <div className="mb-6 flex items-center justify-between gap-3">
        {/* Input de búsqueda */}
        <div className="relative w-full">
          <input
            type="text"
            placeholder="Buscar producto..."
            className="border rounded-lg p-2 pl-9 w-full focus:ring-2 focus:ring-blue-200 outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {/* Icono lupa dentro del input */}
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
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
                label: "Disponibles",
                value: "available",
                className: "text-green-700 hover:bg-green-50",
              },
              {
                label: "Por terminarse",
                value: "ending",
                className: "text-yellow-500 hover:bg-green-50",
              },
              {
                label: "Agotados",
                value: "out",
                className: "text-red-700 hover:bg-red-50",
              },
              {
                label: "Básicas",
                value: "basicas",
                className: "text-blue-700 hover:bg-blue-100",
              },
              {
                label: "Premium",
                value: "premium",
                className: "text-yellow-700 hover:bg-blue-100",
              },
            ]}
          />
        </div>
        <div>
          <PriceFilters
            show={showPriceFilters}
            toggle={() => setShowPriceFilters(!showPriceFilters)}
            priceOrder={priceOrder}
            setPriceOrder={setPriceOrder}
            minPrice={minPrice}
            setMinPrice={setMinPrice}
            maxPrice={maxPrice}
            setMaxPrice={setMaxPrice}
          />
        </div>
      </div>

      {/* Grid de productos */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
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

            <h2 className="font-semibold text-gray-800 text-center text-sm truncate w-full">
              {p.nombre}
            </h2>

            {p.modelo && (
              <p className="text-gray-500 text-xs mb-1 text-center truncate w-full">
                {p.modelo}
              </p>
            )}

            <p className="text-sm font-medium text-gray-800">
              <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-md text-xs">
                ${p.precio.toLocaleString()}
              </span>
            </p>
            
            <p className="text-xs mt-1 mb-2">
              <span
                className={`px-2 py-0.5 rounded-md ${
                  p.cantidad === 0
                    ? "bg-red-100 text-red-600" // Sin stock
                    : p.modelo?.toLowerCase().includes("premium") &&
                      p.cantidad <= 2
                    ? "bg-yellow-100 text-yellow-700" // Por terminarse (solo Premium)
                    : "bg-blue-100 text-blue-700" // Stock normal
                }`}
              >
                {p.cantidad === 0
                  ? "Agotadas"
                  : p.modelo?.toLowerCase().includes("premium") &&
                    p.cantidad <= 2
                  ? `Por terminarse: ${p.cantidad}`
                  : `Disponibles: ${p.cantidad}`}
              </span>
            </p>

            <button
              className="bg-yellow-500 text-white px-4 py-2 rounded-xl shadow hover:bg-yellow-600 transition font-medium mt-auto"
              onClick={() => openModal(p)}
            >
              Editar
            </button>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 relative transform transition-transform duration-300 scale-95 animate-fadeIn">
            {/* Cerrar modal con X */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors text-xl font-bold"
            >
              ×
            </button>

            <h2 className="text-2xl font-bold mb-6 text-gray-800">
              {editingProduct ? "Editar Producto" : "Nuevo Producto"}
            </h2>

            <div className="flex flex-col gap-4">
              <input
                className="border border-gray-300 rounded-xl p-3 w-full focus:border-blue-400 focus:ring-2 focus:ring-blue-200 outline-none transition placeholder-gray-400"
                placeholder="Nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
              />
              <div>
                {/* <label className="text-sm font-medium mb-1 block">
                  Categoría
                </label> */}
                <select
                  value={modelo}
                  onChange={(e) => setModelo(e.target.value)}
                  className="border border-gray-300 rounded-xl p-3 w-full focus:border-blue-400 focus:ring-2 focus:ring-blue-200 outline-none transition"
                >
                  <option value="">Selecciona una categoría</option>
                  {categoryOptions.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Precio</label>
                <input
                  // type="number"
                  className="border border-gray-300 rounded-xl p-3 w-full focus:border-blue-400 focus:ring-2 focus:ring-blue-200 outline-none transition placeholder-gray-400"
                  placeholder="Precio"
                  value={precio}
                  onChange={(e) => setPrecio(Number(e.target.value))}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">
                  Cantidad
                </label>
                <input
                  // type="number"
                  className="border border-gray-300 rounded-xl p-3 w-full focus:border-blue-400 focus:ring-2 focus:ring-blue-200 outline-none transition placeholder-gray-400"
                  placeholder="Cantidad"
                  value={cantidad}
                  onChange={(e) => setCantidad(Number(e.target.value))}
                />
              </div>

              {/* Imagen */}
              <div>
                <label
                  htmlFor="imagen-modal"
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-5 py-2 rounded-xl shadow-md cursor-pointer hover:brightness-110 transition-all inline-block mb-2"
                >
                  Seleccionar imagen
                </label>
                <input
                  id="imagen-modal"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
                {preview && <ImagePreview preview={preview} />}
              </div>

              {/* Botones */}
              <div className="flex justify-end gap-3 mt-4">
                <button
                  className="bg-gray-200 text-gray-700 px-5 py-2 rounded-xl hover:bg-gray-300 transition"
                  onClick={closeModal}
                >
                  Cancelar
                </button>
                <button
                  disabled={loading}
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-5 py-2 rounded-xl shadow-md hover:brightness-110 disabled:opacity-50 transition"
                  onClick={handleAddOrUpdate}
                >
                  {loading
                    ? "Guardando..."
                    : editingProduct
                    ? "Actualizar"
                    : "Agregar"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}



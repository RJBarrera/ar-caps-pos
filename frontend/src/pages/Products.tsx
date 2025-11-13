import React, { useEffect, useState } from "react";
import ImagePreview from "./ImagePreview";
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

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    const data = await getProducts();
    setProducts(data);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      setImagenFile(e.target.files[0]);
      setPreview(URL.createObjectURL(e.target.files[0]));
    }
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

  const filteredProducts = products.filter(
    (p) =>
      p.nombre.toLowerCase().includes(search.toLowerCase()) ||
      p.modelo?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
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

      {/* Buscador y filtros */}
      <div className="relative mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <input
          type="text"
          placeholder="Buscar producto..."
          className="border rounded-lg p-2 pl-9 w-full md:w-1/3 focus:ring-2 focus:ring-blue-200 outline-none"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div className="flex gap-2 mb-4 flex-wrap">
        <button className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm">
          Todos
        </button>
        <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm">
          Disponibles
        </button>
        <button className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm">
          Agotados
        </button>
      </div>

      {/* Grid de productos */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {filteredProducts.map((p) => (
          <div
            key={p.id}
            className="bg-white rounded-xl shadow-sm border border-gray-100 hover:border-gray-300 flex flex-col items-center p-4 min-h-[250px]"
          >
            <div className="w-28 h-28 flex items-center justify-center bg-gray-100 rounded-xl overflow-hidden mb-3">
              {p.imagen ? (
                <img
                  src={`${BACKEND_URL}${p.imagen}`}
                  alt={p.nombre}
                  className="w-full h-full object-contain"
                />
              ) : (
                <span className="text-gray-400 text-sm">Sin imagen</span>
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
                  p.cantidad > 0
                    ? "bg-blue-100 text-blue-700"
                    : "bg-red-100 text-red-600"
                }`}
              >
                Stock: {p.cantidad}
              </span>
            </p>

            <button
              className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-3 py-1 rounded-lg text-xs font-medium"
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
              <input
                className="border border-gray-300 rounded-xl p-3 w-full focus:border-blue-400 focus:ring-2 focus:ring-blue-200 outline-none transition placeholder-gray-400"
                placeholder="Categoría / Modelo"
                value={modelo}
                onChange={(e) => setModelo(e.target.value)}
              />
              <input
                type="number"
                className="border border-gray-300 rounded-xl p-3 w-full focus:border-blue-400 focus:ring-2 focus:ring-blue-200 outline-none transition placeholder-gray-400"
                placeholder="Precio"
                // value={precio}
                onChange={(e) => setPrecio(Number(e.target.value))}
              />
              <input
                type="number"
                className="border border-gray-300 rounded-xl p-3 w-full focus:border-blue-400 focus:ring-2 focus:ring-blue-200 outline-none transition placeholder-gray-400"
                placeholder="Cantidad"
                // value={cantidad}
                onChange={(e) => setCantidad(Number(e.target.value))}
              />

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

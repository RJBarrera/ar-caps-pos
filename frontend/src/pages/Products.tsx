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

const BACKEND_URL = (import.meta as any).env?.VITE_API_IMG || ""; // usa variable o fallback local

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [nombre, setNombre] = useState("");
  const [modelo, setModelo] = useState("");
  const [precio, setPrecio] = useState<number>(0);
  const [cantidad, setCantidad] = useState<number>(0);
  const [imagenFile, setImagenFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [search, setSearch] = useState(""); // <-- Nuevo estado para buscador

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

  async function handleAddOrUpdate() {
    if (!nombre || !precio || !cantidad)
      return alert("Completa todos los campos");

    const formData = new FormData();
    formData.append("nombre", nombre);
    formData.append("modelo", modelo);
    formData.append("precio", precio.toString());
    formData.append("cantidad", cantidad.toString());
    if (imagenFile) formData.append("imagen", imagenFile);

    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, formData);
      } else {
        await createProduct(formData);
      }
      resetForm();
      loadProducts();
    } catch (err) {
      console.error(err);
      alert("Error al guardar el producto");
    }
  }

  function handleEdit(p: Product) {
    setEditingProduct(p);
    setNombre(p.nombre);
    setModelo(p.modelo || "");
    setPrecio(p.precio);
    setCantidad(p.cantidad);
    setPreview(p.imagen ? `${BACKEND_URL}${p.imagen}` : null);
    setImagenFile(null);
  }

  // Filtramos productos por nombre o modelo
  const filteredProducts = products.filter(
    (p) =>
      p.nombre.toLowerCase().includes(search.toLowerCase()) ||
      p.modelo?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">🛒 Productos</h1>

      {/* Formulario */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6 flex flex-col md:flex-row md:flex-wrap gap-4 items-end">
        {/* Nombre */}
        <div className="flex flex-col w-full md:flex-1">
          {/* <label className="text-gray-700 mb-1">Nombre:</label> */}
          <input
            className="border rounded-md p-2 w-full"
            placeholder="Nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />
        </div>

        {/* Modelo */}
        <div className="flex flex-col w-full md:flex-1">
          {/* <label className="text-gray-700 mb-1">Modelo:</label> */}
          <input
            className="border rounded-md p-2 w-full"
            placeholder="Modelo"
            value={modelo}
            onChange={(e) => setModelo(e.target.value)}
          />
        </div>

        {/* Imagen */}
        <div className="flex flex-col w-full md:w-auto">
          <label
            htmlFor="imagen"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow-md cursor-pointer hover:bg-blue-700 transition-colors inline-block mb-2 md:mb-0"
          >
            Seleccionar imagen
          </label>
          <input
            id="imagen"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
          {preview && <ImagePreview preview={preview} />}
        </div>

        {/* Precio */}
        <div className="flex flex-col w-full md:w-24">
          <label className="text-gray-700 mb-1">Precio:</label>
          <input
            className="border rounded-md p-2 w-full"
            type="number"
            placeholder="Precio"
            value={precio}
            onChange={(e) => setPrecio(Number(e.target.value))}
          />
        </div>

        {/* Cantidad */}
        <div className="flex flex-col w-full md:w-24">
          <label className="text-gray-700 mb-1">Cantidad:</label>
          <input
            className="border rounded-md p-2 w-full"
            type="number"
            placeholder="Cantidad"
            value={cantidad}
            onChange={(e) => setCantidad(Number(e.target.value))}
          />
        </div>

        {/* Botones */}
        <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto mt-2 md:mt-0">
          <button
            className={`${
              editingProduct
                ? "bg-green-600 hover:bg-green-700"
                : "bg-blue-600 hover:bg-blue-700"
            } text-white px-5 py-2 rounded-lg shadow-md transition-colors`}
            onClick={handleAddOrUpdate}
          >
            {editingProduct ? "Actualizar" : "Agregar"}
          </button>
          {editingProduct && (
            <button
              className="bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500 transition"
              onClick={resetForm}
            >
              Cancelar
            </button>
          )}
        </div>
      </div>

      {/* Buscador */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar producto..."
          className="border rounded-md p-2 w-full md:w-1/3"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Lista de productos filtrados */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredProducts.map((p) => (
          <div
            key={p.id}
            className="bg-white rounded-xl shadow-lg p-4 flex flex-col items-center hover:shadow-xl transition-shadow"
          >
            {p.imagen && (
              <img
                src={`${BACKEND_URL}${p.imagen}`}
                alt={p.nombre}
                className="w-32 h-32 object-contain mb-4"
              />
            )}
            <h2 className="font-bold text-lg text-gray-800 mb-1">{p.nombre}</h2>
            {p.modelo && <p className="text-gray-500 mb-2">{p.modelo}</p>}
            <p className="text-gray-700 mb-1">Precio: ${p.precio}</p>
            <p className="text-gray-700 mb-3">Stock: {p.cantidad}</p>
            <button
              className="bg-yellow-500 text-white px-4 py-1 rounded hover:bg-yellow-600 transition"
              onClick={() => handleEdit(p)}
            >
              Editar
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

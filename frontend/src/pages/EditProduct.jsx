import React, { useEffect, useState } from "react";
import axios from "axios";

const EditProduct = ({ productId, onClose, onUpdated }) => {
  const [product, setProduct] = useState({
    nombre: "",
    modelo: "",
    precio: "",
    cantidad: "",
    imagen: "",
  });
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);

  // Cargar datos del producto al montar el componente
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`/api/products/${productId}`);
        setProduct(res.data);
        setPreview(`http://localhost:4000${res.data.imagen}`);
      } catch (err) {
        console.error("Error al cargar producto", err);
      }
    };
    if (productId) fetchProduct();
  }, [productId]);

  // Manejar cambios de texto
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct((prev) => ({ ...prev, [name]: value }));
  };

  // Manejar cambio de imagen
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setFile(file);
    setPreview(URL.createObjectURL(file));
  };

  // Enviar actualización
  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("nombre", product.nombre);
    formData.append("modelo", product.modelo);
    formData.append("precio", product.precio);
    formData.append("cantidad", product.cantidad);
    if (file) formData.append("imagen", file);

    try {
      await axios.put(`/api/products/${productId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("✅ Producto actualizado correctamente");
      if (onUpdated) onUpdated();
      onClose();
    } catch (err) {
      console.error("Error al actualizar producto", err);
      alert("❌ Error al actualizar producto");
    }
  };

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-black/50 z-50">
      <div className="bg-white p-6 rounded-xl shadow-xl w-[400px]">
        <h2 className="text-xl font-bold mb-4 text-center">Editar Producto</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="text"
            name="nombre"
            placeholder="Nombre"
            value={product.nombre}
            onChange={handleChange}
            className="border p-2 rounded"
          />
          <input
            type="text"
            name="modelo"
            placeholder="Modelo"
            value={product.modelo}
            onChange={handleChange}
            className="border p-2 rounded"
          />
          <input
            type="number"
            name="precio"
            placeholder="Precio"
            value={product.precio}
            onChange={handleChange}
            className="border p-2 rounded"
          />
          <input
            type="number"
            name="cantidad"
            placeholder="Cantidad"
            value={product.cantidad}
            onChange={handleChange}
            className="border p-2 rounded"
          />

          <div>
            <label className="block mb-1">Imagen:</label>
            {preview && <img src={preview} alt="preview" className="w-24 h-24 object-cover mb-2 rounded" />}
            <input type="file" accept="image/*" onChange={handleImageChange} />
          </div>

          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 rounded mt-3"
          >
            Guardar Cambios
          </button>

          <button
            type="button"
            onClick={onClose}
            className="text-gray-600 mt-2 hover:underline"
          >
            Cancelar
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditProduct;

import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { getProducts, registerSale } from "../services/api";

type Product = {
  id: number;
  nombre: string;
  modelo?: string;
  precio: number;
  cantidad: number;
  imagen?: string;
};

type CartItem = {
  productId: number;
  cantidad: number;
  precio: number;
};

const BACKEND_URL = (import.meta as any).env?.VITE_API_IMG || ""; // usa variable o fallback local

export default function Sales() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState("");

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [payment, setPayment] = useState<number>(0);

  const total = cart.reduce(
    (acc, item) => acc + item.cantidad * item.precio,
    0
  );
  const change = payment - total;

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    const data = await getProducts();
    setProducts(data);
  }

  function addToCart(product: Product) {
    const exists = cart.find((c) => c.productId === product.id);
    if (exists) {
      setCart(
        cart.map((c) =>
          c.productId === product.id ? { ...c, cantidad: c.cantidad + 1 } : c
        )
      );
    } else {
      setCart([
        ...cart,
        { productId: product.id, cantidad: 1, precio: product.precio },
      ]);
    }
  }

  async function handleSale() {
    if (cart.length === 0) return alert("El carrito está vacío");

    const payload = {
      productos: cart.map((item) => ({
        id: item.productId,
        cantidad: item.cantidad,
        precio: item.precio,
      })),
    };

    try {
      await registerSale(payload);
      Swal.fire({
        title: "¡Venta registrada correctamente!",
        icon: "success",
        width: 300, // Más compacto
        padding: "1rem",
        background: "#f9fafb", // Fondo moderno, gris muy claro
        color: "#111827", // Texto en gris oscuro
        iconColor: "#10b981", // Verde moderno para icono de éxito
        showConfirmButton: false, // Sin botón de confirmar para que sea más limpio
        timer: 2000, // Se cierra automáticamente después de 2 segundos
        timerProgressBar: true,
        draggable: true,
        customClass: {
          title: "text-lg font-semibold",
          popup: "rounded-xl shadow-lg border border-gray-200",
        },
      });
      setCart([]);
      setPayment(0);
      setShowModal(false);
      loadProducts();
    } catch (error) {
      console.error(error);
      alert("Error al registrar la venta");
    }
  }

  const filteredProducts = products.filter((p) =>
    p.nombre.toLowerCase().includes(search.toLowerCase()) ||
    p.modelo?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">💰 Ventas</h1>

      {/* Carrito */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">🛒 Carrito</h2>
        {cart.length === 0 ? (
          <p className="text-gray-500">No hay productos en el carrito</p>
        ) : (
          <>
            <ul className="mb-4">
              {cart.map((item) => {
                const prod = products.find((p) => p.id === item.productId);
                return (
                  <li
                    key={item.productId}
                    className="flex justify-between border-b py-2"
                  >
                    <span>
                      {prod?.nombre} x {item.cantidad}
                    </span>
                    <span>${item.precio * item.cantidad}</span>
                  </li>
                );
              })}
            </ul>
            <p className="font-bold text-lg mb-4">Total: ${total}</p>
            <div className="flex gap-4">
              <button
                className="bg-blue-600 text-white px-5 py-2 rounded-lg shadow-md hover:bg-blue-700 transition-colors"
                onClick={() => setShowModal(true)}
              >
                Registrar Venta
              </button>
              <button
                className="bg-red-500 text-white px-5 py-2 rounded-lg shadow-md hover:bg-red-600 transition-colors"
                onClick={() => setCart([])}
              >
                Vaciar Carrito
              </button>
            </div>
          </>
        )}
      </div>

      {/* Buscador */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Buscar producto..."
          className="border rounded-md p-2 w-full md:w-1/3"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Productos */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-6">
        {filteredProducts.map((p) => (
          <div
            key={p.id}
            className="bg-white rounded-xl shadow-lg p-4 flex flex-col items-center hover:shadow-xl transition-shadow"
          >
            {p.imagen && (
              <img
                src={`${BACKEND_URL}${p.imagen}`}
                alt={p.nombre}
                className="w-24 h-24 object-contain mb-4"
              />
            )}
            <h2 className="font-bold text-lg text-gray-800 mb-2">{p.nombre}</h2>
            <p className="text-gray-600 mb-1">Modelo: {p.modelo}</p>
            <p className="text-gray-600 mb-1">Precio: ${p.precio}</p>
            <p className="text-gray-600 mb-2">Stock: {p.cantidad}</p>
            <button
              className="bg-green-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-green-600 transition-colors"
              onClick={() => addToCart(p)}
            >
              Agregar
            </button>
          </div>
        ))}
      </div>

      {/* Modal de pago */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg p-6 w-80 shadow-lg">
            <h2 className="text-xl font-bold mb-4">💵 Pago</h2>
            <p className="mb-2">Total: ${total}</p>
            <label className="block mb-2">
              Monto recibido:
              <input
                type="number"
                className="border rounded-md p-2 w-full mt-1"
                value={payment}
                onChange={(e) => setPayment(Number(e.target.value))}
              />
            </label>
            <p className="mb-4 font-semibold">
              Cambio: ${change >= 0 ? change : 0}
            </p>
            <div className="flex justify-end gap-2">
              <button
                className="bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500 transition"
                onClick={() => {
                  setShowModal(false);
                  setPayment(0);
                }}
              >
                Cancelar
              </button>
              <button
                className={`${
                  change < 0
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                } text-white px-4 py-2 rounded-lg transition`}
                disabled={change < 0}
                onClick={handleSale}
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

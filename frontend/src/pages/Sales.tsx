import React, { useEffect, useState } from "react";
import ProductFilters from "./ProductFilters";
import PriceFilters from "./PriceFilters";
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
  const [filter, setFilter] = useState("all");
  const [priceOrder, setPriceOrder] = useState<"none" | "asc" | "desc">("none");
  const [minPrice, setMinPrice] = useState<number | "">("");
  const [maxPrice, setMaxPrice] = useState<number | "">("");
  const [showPriceFilters, setShowPriceFilters] = useState(false);

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

  const totalInventario = products.reduce((sum, p) => sum + p.cantidad, 0);
  const totalProductos = products.length;

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

  const filteredProducts = products
    .filter((p) => {
      // Normaliza valores seguros
      const nombre = p.nombre?.toLowerCase() ?? "";
      const modelo = p.modelo?.toLowerCase() ?? "";
      const searchText = (search ?? "").toLowerCase();

      // Búsqueda
      const matchesSearch =
        nombre.includes(searchText) || modelo.includes(searchText);

      // Detecta premium y estado por terminarse (>0 y <=2 unidades)
      const isPremium = modelo.includes("premium");
      const isEnding = p.cantidad > 0 && p.cantidad <= 2 && isPremium;

      // Categoría basica/premium (manteniendo tu lógica)
      const matchesCategory =
        filter === "basicas"
          ? modelo.includes("basica")
          : filter === "premium"
          ? isPremium
          : true;

      // Filtro de disponibilidad (incluye 'available', 'out' y 'ending')
      const matchesFilter =
        filter === "available"
          ? p.cantidad > 0
          : filter === "out"
          ? p.cantidad === 0
          : filter === "ending"
          ? isEnding
          : true; // cuando es 'all' u otro valor, no restringe por disponibilidad

      // Rango de precios (convertimos a número para comparaciones correctas)
      const price = Number(p.precio);
      const min = minPrice === "" ? -Infinity : Number(minPrice);
      const max = maxPrice === "" ? Infinity : Number(maxPrice);

      const matchesMin = price >= min;
      const matchesMax = price <= max;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesFilter &&
        matchesMin &&
        matchesMax
      );
    })
    .sort((a, b) => {
      if (priceOrder === "asc") return a.precio - b.precio;
      if (priceOrder === "desc") return b.precio - a.precio;
      return 0;
    });

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">💰 Ventas</h1>

      {/* Carrito */}
      <div className="bg-white rounded-2xl shadow-lg shadow-gray-200 p-6 mb-10 border border-gray-100">
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
                    className="flex justify-between py-3 border-b border-gray-200 text-sm text-gray-700"
                    key={item.productId}
                  >
                    <span>
                      {prod?.nombre} x {item.cantidad}
                    </span>
                    <span>${item.precio * item.cantidad}</span>
                  </li>
                );
              })}
            </ul>
            <p className="font-bold text-xl mb-4 text-gray-800">
              Total: ${total}
            </p>
            <div className="flex gap-4">
              <button
                className="bg-blue-600 text-white px-5 py-2.5 rounded-xl shadow hover:bg-blue-700 transition font-medium transition-colors"
                onClick={() => setShowModal(true)}
              >
                Registrar Venta
              </button>
              <button
                className="bg-red-500 text-white px-5 py-2.5 rounded-xl shadow hover:bg-red-600 transition font-medium"
                onClick={() => setCart([])}
              >
                Vaciar Carrito
              </button>
            </div>
          </>
        )}
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
                label: "Básicas",
                value: "basicas",
                className: "text-blue-700 hover:bg-blue-100",
              },
              {
                label: "Premium",
                value: "premium",
                className: "text-red-700 hover:bg-blue-100",
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
              className="bg-green-600 text-white px-4 py-2 rounded-xl shadow hover:bg-green-700 transition font-medium mt-auto"
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
          <div className="bg-white rounded-2xl p-6 w-80 shadow-2xl border border-gray-200 animate-fadeIn">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800 flex items-center gap-2">
              💵 Pago
            </h2>
            <p className="font-bold text-xl mb-4 text-gray-800">
              Total: ${total}
            </p>
            <label className="block mb-2">
              Monto recibido:
              <input
                // type="number"
                className="border border-gray-300 rounded-lg p-2.5 w-full mt-1 focus:ring-2 focus:ring-blue-300 outline-none"
                // value={payment}
                onChange={(e) => setPayment(Number(e.target.value))}
              />
            </label>
            <p className="mb-4 font-semibold">
              Cambio: ${change >= 0 ? change : 0}
            </p>
            <div className="flex justify-end gap-2">
              <button
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded-xl hover:bg-gray-400 transition font-medium"
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
                    ? "bg-gray-300 cursor-not-allowed text-gray-500"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                } px-4 py-2 rounded-xl transition font-medium`}
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

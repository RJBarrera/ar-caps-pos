import React, { useEffect, useState } from "react";
import ProductFilters from "./ProductFilters";
import PriceFilters from "./PriceFilters";
import FloatingCartButton from "./FloatingCartButton";
import CartModal from "./CartModal";
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
    if (product.cantidad === 0) {
      Swal.fire({
        icon: "warning",
        title: "Sin stock",
        text: "Este producto ya no tiene unidades disponibles",
        timer: 1500,
        showConfirmButton: false,
      });
      return;
    }

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

  const totalItems = cart.reduce((s, i) => s + i.cantidad, 0);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">💰 Ventas</h1>

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
              disabled={p.cantidad === 0}
              onClick={() => addToCart(p)}
              className={`px-4 py-2 rounded-xl shadow font-medium mt-auto transition
                ${
                  p.cantidad === 0
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-green-600 text-white hover:bg-green-700"
                }`}
            >
              {p.cantidad === 0 ? "No disponible" : "Agregar"}
            </button>
          </div>
        ))}
      </div>

      {/* Botón flotante */}
      <FloatingCartButton
        totalItems={totalItems}
        onClick={() => setShowModal(true)}
      />

      {/* Modal */}
      {showModal && (
        <CartModal
          cart={cart}
          products={products}
          total={total}
          payment={payment}
          setPayment={setPayment}
          change={change}
          onClose={() => setShowModal(false)}
          onConfirm={handleSale}
          onClear={() => setCart([])}
        />
      )}
    </div>
  );
}

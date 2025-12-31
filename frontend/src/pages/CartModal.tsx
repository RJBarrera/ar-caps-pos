import React from "react";

type Product = {
  id: number;
  nombre: string;
};

type CartItem = {
  productId: number;
  cantidad: number;
  precio: number;
};

type Props = {
  cart: CartItem[];
  products: Product[];
  total: number;
  payment: number;
  setPayment: (n: number) => void;
  change: number;
  onClose: () => void;
  onConfirm: () => void;
  onClear: () => void;
};

export default function CartModal({
  cart,
  products,
  total,
  payment,
  setPayment,
  change,
  onClose,
  onConfirm,
  onClear,
}: Props) {
  return (
    /* Overlay */
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
      onClick={onClose} // 👈 cerrar al dar click fuera
    >
      {/* Modal */}
      <div
        className="bg-white rounded-2xl p-6 w-80 shadow-2xl border border-gray-200 animate-fadeIn relative"
        onClick={(e) => e.stopPropagation()} // 👈 evita cierre al click interno
      >
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 transition"
          aria-label="Cerrar carrito"
        >
          ✕
        </button>

        <h2 className="text-2xl font-semibold mb-4 text-gray-800 flex items-center gap-2">
          🛒 Carrito
        </h2>

        {cart.length === 0 ? (
          <div className="text-center">
            <p className="text-gray-500 mb-4">No hay productos en el carrito</p>
            <button
              onClick={onClose}
              className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition"
            >
              Cerrar
            </button>
          </div>
        ) : (
          <>
            <ul className="mb-4 max-h-40 overflow-y-auto">
              {cart.map((item) => {
                const prod = products.find(
                  (p) => p.id === item.productId
                );
                return (
                  <li
                    key={item.productId}
                    className="flex justify-between py-2 border-b text-sm"
                  >
                    <span>
                      {prod?.nombre} x {item.cantidad}
                    </span>
                    <span>${item.precio * item.cantidad}</span>
                  </li>
                );
              })}
            </ul>

            <p className="font-bold text-lg mb-2">Total: ${total}</p>

            <label className="block mb-2 text-sm">
              Monto recibido
              <input
                type="number"
                className="border rounded-lg p-2 w-full mt-1 focus:ring-2 focus:ring-blue-300 outline-none"
                value={payment}
                onChange={(e) => setPayment(Number(e.target.value))}
              />
            </label>

            <p className="mb-3 font-semibold">
              Cambio: ${change >= 0 ? change : 0}
            </p>

            <div className="flex justify-between gap-2">
              <button
                onClick={onClear}
                className="bg-red-500 text-white px-3 py-2 rounded-xl hover:bg-red-600 transition"
              >
                Vaciar
              </button>

              <div className="flex gap-2">
                <button
                  onClick={onClose}
                  className="bg-gray-300 px-3 py-2 rounded-xl hover:bg-gray-400 transition"
                >
                  Cancelar
                </button>
                <button
                  disabled={change < 0}
                  onClick={onConfirm}
                  className={`px-3 py-2 rounded-xl transition ${
                    change < 0
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  Aceptar
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

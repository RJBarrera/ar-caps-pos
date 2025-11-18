import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";

interface NavbarProps {
  onLogout: () => void;
}

export default function Navbar({ onLogout }: NavbarProps) {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const links = [
    { name: "Productos", path: "/products" },
    { name: "Ventas", path: "/sales" },
    { name: "Reportes", path: "/reports" },
  ];

  return (
    <nav className="backdrop-blur-md bg-gray-900/90 shadow-lg sticky top-0 z-50 border-b border-gray-700">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <img
              src="/img/logo-arcaps.png"
              alt="AR Caps Logo"
              className="h-16 w-auto object-contain transition-transform duration-300 hover:scale-105 mb-2"
            />
          </div>

          {/* Links escritorio */}
          <div className="hidden md:flex items-center space-x-6">
            {links.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`relative text-gray-200 font-medium px-2 py-1 transition-colors duration-200 hover:text-blue-400 ${
                  location.pathname === link.path
                    ? "text-blue-400 after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-blue-400 after:rounded"
                    : ""
                }`}
              >
                {link.name}
              </Link>
            ))}

            {/* Botón cerrar sesión */}
            <button
              onClick={onLogout}
              className="ml-4 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold transition"
            >
              Cerrar sesión
            </button>
          </div>

          {/* Botón menú móvil */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-200 hover:text-blue-400 focus:outline-none transition-colors"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                {isOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Menú móvil */}
      {isOpen && (
        <div className="md:hidden bg-gray-800/90 backdrop-blur-md shadow-lg border-t border-gray-700">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {links.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`block px-3 py-2 rounded-md text-base font-medium text-gray-200 hover:text-blue-400 hover:bg-gray-700 transition-colors duration-200 ${
                  location.pathname === link.path
                    ? "text-blue-400 bg-gray-700"
                    : ""
                }`}
              >
                {link.name}
              </Link>
            ))}

            {/* Botón cerrar sesión móvil */}
            <button
              onClick={() => {
                onLogout();
                setIsOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-white bg-red-500 hover:bg-red-600 transition"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}

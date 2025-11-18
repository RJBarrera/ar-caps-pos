import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Reports from "./pages/Reports";
import Products from "./pages/Products";
import Sales from "./pages/Sales";
import Navbar from "./pages/Navbar";
import Login from "./pages/Login";

function App() {
  // Estado de login
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Al cargar la app, leer sesión desde localStorage
  useEffect(() => {
    const stored = localStorage.getItem("isLoggedIn");
    if (stored === "true") setIsLoggedIn(true);
  }, []);

  // Función para iniciar sesión
  const handleLogin = () => {
    setIsLoggedIn(true);
    localStorage.setItem("isLoggedIn", "true");
  };

  // Función para cerrar sesión
  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem("isLoggedIn");
  };

  return (
    <Router>
      {/* Navbar solo si está logueado */}
      {isLoggedIn && <Navbar onLogout={handleLogout} />}

      <div className="mx-auto bg-blue-50 min-h-screen">
        <Routes>
          {/* Ruta principal */}
          <Route
            path="/"
            element={
              isLoggedIn ? <Navigate to="/sales" /> : <Login onLogin={handleLogin} />
            }
          />

          {/* Rutas protegidas */}
          <Route
            path="/sales"
            element={isLoggedIn ? <Sales /> : <Navigate to="/" />}
          />
          <Route
            path="/products"
            element={isLoggedIn ? <Products /> : <Navigate to="/" />}
          />
          <Route
            path="/reports"
            element={isLoggedIn ? <Reports /> : <Navigate to="/" />}
          />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

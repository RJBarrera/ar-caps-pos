import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Reports from "./pages/Reports";
import Products from "./pages/Products";
import Sales from "./pages/Sales";
import Navbar from "./pages/Navbar"; // Nuevo componente profesional

function App() {
  return (
    <Router>
      {/* Navbar elegante */}
      <Navbar />

      {/* Contenido principal con padding */}
      <div className="max-w-7xl mx-auto p-1 bg-blue-50 min-h-screen">
        <Routes>
          <Route path="/reports" element={<Reports />} />
          <Route path="/products" element={<Products />} />
          <Route path="/sales" element={<Sales />} />
          {/* Futuras rutas */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;

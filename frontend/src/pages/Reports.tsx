import React, { useState, useEffect } from "react";
import { getSalesReport } from "../services/api";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";

type SaleReport = { fecha: string; total: number };

export default function Reports() {
  const [period, setPeriod] = useState<"day" | "week" | "month">("day");
  const [data, setData] = useState<SaleReport[]>([]);

  useEffect(() => {
    loadReport();
  }, [period]);

  async function loadReport() {
    const report = await getSalesReport(period);
    setData(report.ventas || []); // Ajuste si tu API devuelve { ventas: [...] }
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">📊 Reportes de Ventas</h1>

      {/* Selector de periodo */}
      <div className="flex gap-4 mb-6">
        {["day", "week", "month"].map(p => (
          <button
            key={p}
            className={`px-5 py-2 rounded-lg font-medium transition-colors ${
              period === p ? "bg-blue-600 text-white shadow-lg" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
            onClick={() => setPeriod(p as "day" | "week" | "month")}
          >
            {p === "day" ? "Diario" : p === "week" ? "Semanal" : "Mensual"}
          </button>
        ))}
      </div>

      {/* Contenedor del gráfico */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        {data.length ? (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="fecha" tick={{ fill: "#4B5563", fontSize: 12 }} />
              <YAxis tick={{ fill: "#4B5563", fontSize: 12 }} />
              <Tooltip contentStyle={{ backgroundColor: "#f9f9f9", borderRadius: "8px" }} />
              <Bar dataKey="total" fill="#3b82f6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-500 text-center py-20">No hay datos disponibles para este periodo.</p>
        )}
      </div>
    </div>
  );
}

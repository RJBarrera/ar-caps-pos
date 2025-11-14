import React, { useEffect, useState } from "react";
import { getSalesReport } from "../services/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

type Sale = {
  fecha: string;
  total: number;
  productos: { nombre: string; cantidad: number }[];
};

type TopProduct = {
  nombre: string;
  vendidos: number;
};

type ReportData = {
  ventas: Sale[];
  totalGeneral: number;
  cantidadVentas: number;
  ticketPromedio: number;
  topProductos: TopProduct[];
};

export default function Reports() {
  const [period, setPeriod] = useState<"day" | "week" | "month">("day");
  const [report, setReport] = useState<ReportData>({
    ventas: [],
    totalGeneral: 0,
    cantidadVentas: 0,
    ticketPromedio: 0,
    topProductos: [],
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadReport();
  }, [period]);

  const loadReport = async () => {
    setLoading(true);
    try {
      const data = await getSalesReport(period);
      setReport(data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">📊 Reportes de Ventas</h1>

      {/* Selector de periodo */}
      <div className="flex gap-4 mb-6">
        {["day", "week", "month"].map((p) => (
          <button
            key={p}
            className={`px-5 py-2 rounded-lg font-medium transition-colors ${
              period === p
                ? "bg-blue-600 text-white shadow-lg"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
            onClick={() => setPeriod(p as "day" | "week" | "month")}
          >
            {p === "day" ? "Diario" : p === "week" ? "Semanal" : "Mensual"}
          </button>
        ))}
      </div>

      {/* Totales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white shadow rounded-xl p-4 text-center">
          <p className="text-gray-500 text-sm">Ventas registradas</p>
          <p className="text-2xl font-bold">{report.cantidadVentas}</p>
        </div>
        <div className="bg-white shadow rounded-xl p-4 text-center">
          <p className="text-gray-500 text-sm">Total vendido</p>
          <p className="text-2xl font-bold">${report.totalGeneral.toLocaleString()}</p>
        </div>
        <div className="bg-white shadow rounded-xl p-4 text-center">
          <p className="text-gray-500 text-sm">Ticket promedio</p>
          <p className="text-2xl font-bold">${report.ticketPromedio.toFixed(2)}</p>
        </div>
      </div>

      {/* Gráfico */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        {report.ventas.length ? (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={report.ventas}>
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

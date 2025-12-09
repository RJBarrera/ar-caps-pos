import React, { useEffect, useState } from "react";
import { getSalesReport, getTopProducts } from "../services/api";
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
  const [topProductos, setTopProductos] = useState<TopProduct[]>([]);

  useEffect(() => {
    loadReport();
    loadTopProducts();
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

  const loadTopProducts = async () => {
    const data = await getTopProducts(period);
    setTopProductos(data);
  };

  // Exportar CSV
  const downloadCSV = () => {
    const rows = [
      ["Fecha", "Total", "Productos", "Cantidad"],
      ...report.ventas.map((s) => [
        s.fecha,
        s.total,
        topProductos.map((prod) => `${prod.nombre}`).join(", "),
        s.productos.map((p) => `${p.cantidad}`).join(", "),
        
        
      ]),
    ];

    const csvContent =
      "data:text/csv;charset=utf-8," + rows.map((e) => e.join(",")).join("\n");

    const link = document.createElement("a");
    link.href = csvContent;
    link.download = `reporte_${period}.csv`;
    link.click();
  };

  return (
    <div className="p-6 min-h-screen flex flex-col items-center">
      {/* Contenedor central con ancho máximo */}
      <div className="w-full max-w-6xl flex flex-col items-center">
        {/* Título */}
        <h1 className="text-3xl font-extrabold text-gray-800 mb-8 flex items-center gap-2 justify-center">
          📊 Reportes de Ventas
        </h1>

        {/* Selector de periodo */}
        <div className="flex gap-4 mb-8 justify-center">
          {["day", "week", "month"].map((p) => (
            <button
              key={p}
              className={`px-6 py-2 rounded-lg font-semibold transition-colors shadow-md ${
                period === p
                  ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
              }`}
              onClick={() => setPeriod(p as "day" | "week" | "month")}
            >
              {p === "day" ? "Diario" : p === "week" ? "Semanal" : "Mensual"}
            </button>
          ))}
        </div>

        {/* Botones de descarga */}
        <div className="flex gap-4 mb-8 justify-center">
          <button
            onClick={downloadCSV}
            className="px-4 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition"
          >
            Descargar Reporte
          </button>
        </div>

        {/* Totales */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 w-full">
          <div className="bg-white shadow-lg rounded-2xl p-6 flex flex-col items-center hover:scale-105 transform transition">
            <p className="text-gray-400 uppercase text-sm mb-2">
              Ventas registradas
            </p>
            <p className="text-3xl font-bold text-gray-800">
              {report.cantidadVentas}
            </p>
          </div>
          <div className="bg-white shadow-lg rounded-2xl p-6 flex flex-col items-center hover:scale-105 transform transition">
            <p className="text-gray-400 uppercase text-sm mb-2">
              Total vendido
            </p>
            <p className="text-3xl font-bold text-green-600">
              ${report.totalGeneral.toLocaleString()}
            </p>
          </div>
          <div className="bg-white shadow-lg rounded-2xl p-6 flex flex-col items-center hover:scale-105 transform transition">
            <p className="text-gray-400 uppercase text-sm mb-2">
              Ticket promedio
            </p>
            <p className="text-3xl font-bold text-indigo-600">
              ${report.ticketPromedio.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Gráfico */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 hover:shadow-xl transition-shadow w-full">
          {report.ventas.length ? (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={report.ventas}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis
                  dataKey="fecha"
                  tick={{ fill: "#6B7280", fontSize: 12 }}
                />
                <YAxis tick={{ fill: "#6B7280", fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#f9fafb",
                    borderRadius: "12px",
                    border: "1px solid #E5E7EB",
                  }}
                />
                <Bar
                  dataKey="total"
                  fill="url(#totalGradient)"
                  radius={[6, 6, 0, 0]}
                />
                <defs>
                  <linearGradient
                    id="totalGradient"
                    x1="0"
                    y1="0"
                    x2="1"
                    y2="0"
                  >
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity={0.8} />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-center py-20">
              No hay datos disponibles para este periodo.
            </p>
          )}
        </div>

        {/* Productos más vendidos */}
        <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow w-full">
          <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2 justify-center">
            🏆 Productos más vendidos
          </h2>
          {topProductos.length ? (
            <ul className="space-y-4">
              {topProductos.map((prod, i) => (
                <li
                  key={i}
                  className="flex justify-between items-center bg-gray-50 rounded-xl p-4 shadow-sm hover:shadow-md transition"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-semibold text-gray-700">
                      {i + 1}.
                    </span>
                    <span className="text-gray-800 font-medium">
                      {prod.nombre}
                    </span>
                  </div>
                  <span className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-white px-3 py-1 rounded-full font-semibold text-sm shadow-sm">
                    {prod.vendidos} vendidos
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400 text-center">
              No hay productos vendidos en este periodo.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

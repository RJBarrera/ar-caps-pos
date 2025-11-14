import { Request, Response } from "express";
import prisma from "../prisma/client";

// Helper para calcular top productos
const getTopProducts = (ventas: any[]) => {
  const countMap: Record<string, number> = {};

  ventas.forEach((venta) => {
    venta.productos.forEach((p: any) => {
      if (!countMap[p.nombre]) countMap[p.nombre] = 0;
      countMap[p.nombre] += p.cantidad;
    });
  });

  // Convertir a array y ordenar
  const top = Object.entries(countMap)
    .map(([nombre, vendidos]) => ({ nombre, vendidos }))
    .sort((a, b) => b.vendidos - a.vendidos)
    .slice(0, 5); // top 5

  return top;
};

// Función genérica para ventas por periodo
const salesByPeriod = async (req: Request, res: Response, from: Date) => {
  try {
    const ventas = await prisma.sale.findMany({
      where: { fecha: { gte: from } },
      include: { productos: true },
      orderBy: { fecha: "asc" },
    });

    const totalGeneral = ventas.reduce((acc, v) => acc + v.total, 0);
    const cantidadVentas = ventas.length;
    const ticketPromedio = cantidadVentas ? totalGeneral / cantidadVentas : 0;
    const topProductos = getTopProducts(ventas);

    res.json({
      ventas,
      totalGeneral,
      cantidadVentas,
      ticketPromedio,
      topProductos,
    });
  } catch (err) {
    res.status(500).json({ error: "Error al obtener ventas" });
  }
};

// Ventas por día
export const salesByDay = (req: Request, res: Response) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return salesByPeriod(req, res, today);
};

// Ventas por semana
export const salesByWeek = (req: Request, res: Response) => {
  const today = new Date();
  const firstDayOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
  firstDayOfWeek.setHours(0, 0, 0, 0);
  return salesByPeriod(req, res, firstDayOfWeek);
};

// Ventas por mes
export const salesByMonth = (req: Request, res: Response) => {
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  return salesByPeriod(req, res, firstDayOfMonth);
};

export const topProducts = async (req: Request, res: Response) => {
  try {
    const period = req.query.period as "day" | "week" | "month" || "day";

    let startDate = new Date();
    if (period === "day") startDate.setHours(0, 0, 0, 0);
    if (period === "week") startDate.setDate(startDate.getDate() - startDate.getDay());
    if (period === "month") startDate = new Date(startDate.getFullYear(), startDate.getMonth(), 1);

    const products = await prisma.saleProduct.groupBy({
      by: ["productId"],
      where: {
        sale: { fecha: { gte: startDate } },
      },
      _sum: { cantidad: true },
      orderBy: { _sum: { cantidad: "desc" } },
      take: 10,
    });

    // Obtener nombres de productos
    const result = await Promise.all(
      products.map(async (p) => {
        const prod = await prisma.product.findUnique({ where: { id: p.productId } });
        return { nombre: prod?.nombre || "Sin nombre", vendidos: p._sum.cantidad || 0 };
      })
    );

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener productos más vendidos" });
  }
};

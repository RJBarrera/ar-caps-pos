import { Request, Response } from "express";
import prisma from "../prisma/client";

// Ventas por día
export const salesByDay = async (req: Request, res: Response) => {
  try {
    const ventas = await prisma.sale.findMany({
      where: {
        fecha: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)), // hoy desde las 00:00
        },
      },
      include: { productos: true },
    });

    const total = ventas.reduce((acc, v) => acc + v.total, 0);

    res.json({ total, ventas });
  } catch (err) {
    res.status(500).json({ error: "Error al obtener ventas del día" });
  }
};

// Ventas por semana
export const salesByWeek = async (req: Request, res: Response) => {
  try {
    const today = new Date();
    const firstDayOfWeek = new Date(today.setDate(today.getDate() - today.getDay())); // domingo
    firstDayOfWeek.setHours(0, 0, 0, 0);

    const ventas = await prisma.sale.findMany({
      where: { fecha: { gte: firstDayOfWeek } },
      include: { productos: true },
    });

    const total = ventas.reduce((acc, v) => acc + v.total, 0);
    res.json({ total, ventas });
  } catch (err) {
    res.status(500).json({ error: "Error al obtener ventas de la semana" });
  }
};

// Ventas por mes
export const salesByMonth = async (req: Request, res: Response) => {
  try {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const ventas = await prisma.sale.findMany({
      where: { fecha: { gte: firstDayOfMonth } },
      include: { productos: true },
    });

    const total = ventas.reduce((acc, v) => acc + v.total, 0);
    res.json({ total, ventas });
  } catch (err) {
    res.status(500).json({ error: "Error al obtener ventas del mes" });
  }
};

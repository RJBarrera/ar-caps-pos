import { Request, Response } from "express";
import prisma from "../prisma/client";

// Registrar una venta
export const registerSale = async (req: Request, res: Response) => {
  const { productos } = req.body;
  /**
   productos: [
   { id: 1, cantidad: 2, precio: 300 },
   { id: 3, cantidad: 1, precio: 350 }
   ]
  **/

  try {
    // Calcula el total
    interface SaleItem {
      id: number;
      cantidad: number;
      precio: number;
    }

    const total = productos.reduce(
      (acc: number, p: SaleItem) => acc + p.cantidad * p.precio,
      0
    );

    // Crea la venta y sus productos relacionados
    const sale = await prisma.sale.create({
      data: {
        total,
        productos: {
          create: productos.map((p: any) => ({
            productId: p.id,
            cantidad: p.cantidad,
            precio: p.precio,
          })),
        },
      },
      include: { productos: true }, // Para devolver la info completa
    });

    // Actualiza inventario
    for (const p of productos) {
      await prisma.product.update({
        where: { id: p.id },
        data: { cantidad: { decrement: p.cantidad } },
      });
    }

    res.json({ ok: true, sale });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al registrar venta" });
  }
};

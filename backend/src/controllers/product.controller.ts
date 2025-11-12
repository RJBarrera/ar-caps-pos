// import { Request, Response } from "express";
// import prisma from "../prisma/client";

// // Obtener todos los productos
// export const getProducts = async (req: Request, res: Response) => {
//   const products = await prisma.product.findMany();
//   res.json(products);
// };

// // Crear un producto
// export const createProduct = async (req: Request, res: Response) => {
//   const { nombre, modelo, precio, cantidad, imagen } = req.body;
//   try {
//     const product = await prisma.product.create({
//       data: { nombre, modelo, precio, cantidad, imagen },
//     });
//     res.json(product);
//   } catch (err) {
//     res.status(500).json({ error: "Error al crear producto" });
//   }
// };

// // Actualizar producto
// export const updateProduct = async (req: Request, res: Response) => {
//   const { id } = req.params;
//   const { nombre, modelo, precio, cantidad, imagen } = req.body;
//   try {
//     const updated = await prisma.product.update({
//       where: { id: Number(id) },
//       data: { nombre, modelo, precio, cantidad, imagen },
//     });
//     res.json(updated);
//   } catch (err) {
//     res.status(500).json({ error: "Error al actualizar producto" });
//   }
// };

// // Eliminar producto
// export const deleteProduct = async (req: Request, res: Response) => {
//   const { id } = req.params;
//   try {
//     await prisma.product.delete({ where: { id: Number(id) } });
//     res.json({ message: "Producto eliminado" });
//   } catch (err) {
//     res.status(500).json({ error: "Error al eliminar producto" });
//   }
// };

import { Request, Response } from "express";
import prisma from "../prisma/client";
import multer from "multer";
import path from "path";
import fs from "fs";

// Crear carpeta uploads si no existe
const uploadsDir = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

// Configuración de multer
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

export const upload = multer({ storage });

// Tipado para request con file de multer
interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

// Obtener todos los productos
export const getProducts = async (_req: Request, res: Response) => {
  const products = await prisma.product.findMany();
  res.json(products);
};

// Crear producto con imagen
export const createProduct = async (req: MulterRequest, res: Response) => {
  const { nombre, modelo, precio, cantidad } = req.body;
  const file = req.file;

  if (!nombre || !precio || !cantidad) {
    return res.status(400).json({ error: "Faltan datos obligatorios" });
  }

  try {
    const product = await prisma.product.create({
      data: {
        nombre,
        modelo,
        precio: Number(precio),
        cantidad: Number(cantidad),
        imagen: file ? `/uploads/${file.filename}` : null,
      },
    });
    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al crear producto" });
  }
};

// // Actualizar producto con imagen opcional
// export const updateProduct = async (req: MulterRequest, res: Response) => {
//   const { id } = req.params;
//   const { nombre, modelo, precio, cantidad } = req.body;
//   const file = req.file;

//   try {
//     const updated = await prisma.product.update({
//       where: { id: Number(id) },
//       data: {
//         nombre,
//         modelo,
//         precio: precio ? Number(precio) : undefined,
//         cantidad: cantidad ? Number(cantidad) : undefined,
//         imagen: file ? `/uploads/${file.filename}` : undefined,
//       },
//     });
//     res.json(updated);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Error al actualizar producto" });
//   }
// };

// Actualizar producto con imagen opcional
export const updateProduct = async (req: MulterRequest, res: Response) => {
  const { id } = req.params;
  const { nombre, modelo, precio, cantidad } = req.body;
  const file = req.file;

  try {
    // Obtener producto actual para conservar la imagen si no se cambia
    const existingProduct = await prisma.product.findUnique({
      where: { id: Number(id) },
    });

    if (!existingProduct) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    const updated = await prisma.product.update({
      where: { id: Number(id) },
      data: {
        nombre: nombre ?? existingProduct.nombre,
        modelo: modelo ?? existingProduct.modelo,
        precio: precio ? Number(precio) : existingProduct.precio,
        cantidad: cantidad ? Number(cantidad) : existingProduct.cantidad,
        imagen: file ? `/uploads/${file.filename}` : existingProduct.imagen,
      },
    });

    res.json(updated);
  } catch (err) {
    console.error("Error al actualizar producto:", err);
    res.status(500).json({ error: "Error al actualizar producto" });
  }
};


// Eliminar producto
export const deleteProduct = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.product.delete({ where: { id: Number(id) } });
    res.json({ message: "Producto eliminado" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al eliminar producto" });
  }
};

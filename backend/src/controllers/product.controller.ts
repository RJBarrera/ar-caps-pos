import { Request, Response } from "express";
import prisma from "../prisma/client";
import cloudinary from "../utils/cloudinary";
import multer from "multer";
import path from "path";
import fs from "fs";

// Configuración de multer
const uploadsDir = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

export const upload = multer({ storage });

interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

// Obtener todos los productos
export const getProducts = async (_req: Request, res: Response) => {
  const products = await prisma.product.findMany();
  res.json(products);
};

// Crear producto con imagen en Cloudinary
export const createProduct = async (req: MulterRequest, res: Response) => {
  const { nombre, modelo, precio, cantidad } = req.body;
  const file = req.file;

  if (!nombre || !precio || !cantidad) {
    return res.status(400).json({ error: "Faltan datos obligatorios" });
  }

  try {
    let imagenUrl: string | null = null;

    if (file) {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: "products",
      });
      imagenUrl = result.secure_url;
      fs.unlinkSync(file.path); // eliminar archivo temporal
    }

    const product = await prisma.product.create({
      data: {
        nombre,
        modelo,
        precio: Number(precio),
        cantidad: Number(cantidad),
        imagen: imagenUrl,
      },
    });

    res.json(product);
  } catch (err) {
    console.error("Error al crear producto:", err);
    res.status(500).json({ error: "Error al crear producto" });
  }
};

// Actualizar producto con imagen opcional en Cloudinary
export const updateProduct = async (req: MulterRequest, res: Response) => {
  const { id } = req.params;
  const { nombre, modelo, precio, cantidad } = req.body;
  const file = req.file;

  try {
    const existingProduct = await prisma.product.findUnique({
      where: { id: Number(id) },
    });

    if (!existingProduct) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    let imagenUrl = existingProduct.imagen;

    if (file) {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: "products",
      });
      imagenUrl = result.secure_url;
      fs.unlinkSync(file.path);
    }

    const updated = await prisma.product.update({
      where: { id: Number(id) },
      data: {
        nombre: nombre ?? existingProduct.nombre,
        modelo: modelo ?? existingProduct.modelo,
        precio: precio ? Number(precio) : existingProduct.precio,
        cantidad: cantidad ? Number(cantidad) : existingProduct.cantidad,
        imagen: imagenUrl,
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
    console.error("Error al eliminar producto:", err);
    res.status(500).json({ error: "Error al eliminar producto" });
  }
};

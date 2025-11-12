import { Router } from "express";
import { getProducts, createProduct, updateProduct, deleteProduct, upload } from "../controllers/product.controller";

const router = Router();

router.get("/", upload.single("imagen"), getProducts);

// Ruta para crear producto con imagen
router.post("/", upload.single("imagen"), createProduct);

// Ruta para actualizar producto con imagen
router.put("/:id", upload.single("imagen"), updateProduct);

router.delete("/:id", deleteProduct);

export default router;

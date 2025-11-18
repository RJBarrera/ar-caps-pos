import { Router } from "express";
import { salesByDay, salesByWeek, salesByMonth, topProducts } from "../controllers/reports.controller";

const router = Router();

router.get("/day", salesByDay);
router.get("/week", salesByWeek);
router.get("/month", salesByMonth);

// 🔹 Nueva ruta para top productos
router.get("/top-products", topProducts);

export default router;

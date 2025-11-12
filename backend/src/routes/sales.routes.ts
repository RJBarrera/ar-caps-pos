import { Router } from "express";
import { registerSale } from "../controllers/sales.controller";

const router = Router();

router.post("/", registerSale);

export default router;

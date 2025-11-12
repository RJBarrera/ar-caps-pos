import { Router } from "express";
import { salesByDay, salesByWeek, salesByMonth } from "../controllers/reports.controller";

const router = Router();

router.get("/day", salesByDay);
router.get("/week", salesByWeek);
router.get("/month", salesByMonth);

export default router;

import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import path from "path";
import productRoutes from "./routes/product.routes";
import salesRoutes from "./routes/sales.routes";
import reportsRoutes from "./routes/reports.routes";

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "10mb" }));

// Servir archivos estáticos de uploads
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Rutas API
app.use("/api/products", productRoutes);
app.use("/api/sales", salesRoutes);
app.use("/api/reports", reportsRoutes);

// Servir el frontend (build de React)
const frontendPath = path.join(__dirname, "frontend");
app.use(express.static(frontendPath));

// Servir React solo si NO es API
app.get(/^(?!\/api).*$/, (_, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});

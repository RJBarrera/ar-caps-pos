import { v2 as cloudinary } from "cloudinary";

// Configuración de Cloudinary usando variables de entorno
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
  secure: true, // siempre usar HTTPS
});

// Verificar que las variables estén definidas (opcional, útil para debug)
if (!process.env.CLOUD_NAME || !process.env.CLOUD_API_KEY || !process.env.CLOUD_API_SECRET) {
  console.warn(
    "⚠️  Variables de entorno de Cloudinary no definidas. Las imágenes no se subirán correctamente."
  );
}

export default cloudinary;

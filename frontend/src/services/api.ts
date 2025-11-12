const API_URL = (import.meta as any).env?.VITE_API_URL || "/api"; // usa variable o fallback local

export async function getProducts() {
  const res = await fetch(`${API_URL}/products`);
  return res.json();
}

export async function createProduct(productData: FormData) {
  const res = await fetch(`${API_URL}/products`, {
    method: "POST",
    body: productData,
  });
  return res.json();
}

// 🔹 Nuevo: actualizar producto (con imagen opcional)
export async function updateProduct(id: number, productData: FormData) {
  const res = await fetch(`${API_URL}/products/${id}`, {
    method: "PUT",
    body: productData,
  });
  return res.json();
}

export async function registerSale(sale: {
  productos: { id: number; cantidad: number; precio: number }[];
}) {
  const res = await fetch(`${API_URL}/sales`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(sale),
  });
  return res.json();
}

export async function getSalesReport(period: "day" | "week" | "month") {
  const res = await fetch(`${API_URL}/reports/${period}`);
  return res.json();
}

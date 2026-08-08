const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api";
const TILL_API_KEY = import.meta.env.VITE_TILL_API_KEY;

async function request(path, body) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-till-api-key": TILL_API_KEY,
    },
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok && res.status !== 404) {
    throw new Error(data.error || `Request failed (${res.status})`);
  }
  return { ok: res.ok, status: res.status, data };
}

export const api = {
  validateBarcode: (receiptstoreId) => request("/barcode/validate", { receiptstoreId }),
  completeSale: (payload) => request("/transactions", payload),
};

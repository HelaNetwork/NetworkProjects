// Same-origin API. Vite dev: proxy /api to backend. Production: served by FastAPI.
const BASE = "";

function getAuthHeaders() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  };
}

async function apiRequest(path: string, options: RequestInit = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: getAuthHeaders(),
    ...options,
  });
  if (res.status === 401) {
    localStorage.removeItem("token");
    window.location.href = "/employee-login";
    throw new Error("Unauthorized");
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Request failed");
  }
  return res.json();
}

export async function getMyProfile() {
  return apiRequest("/api/me/profile");
}

export async function getMyTransactions() {
  return apiRequest("/api/me/transactions");
}

export async function getBlockchainConfig() {
  return apiRequest("/api/blockchain/config");
}

export async function updateMyWallet(wallet_address: string) {
  return apiRequest("/api/me/wallet", {
    method: "PUT",
    body: JSON.stringify({ wallet_address }),
  });
}

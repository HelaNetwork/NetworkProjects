// Base API URL: dev uses proxy, production should set VITE_API_BASE to backend URL
const BASE_URL = (import.meta as any).env?.VITE_API_BASE || "";

/* =========================
   AUTH HEADER
========================= */
function getAuthHeaders() {
  const token = localStorage.getItem("token");

  return {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  };
}

/* =========================
   GENERIC FETCH WRAPPER
========================= */
async function apiRequest(path: string, options: RequestInit = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: getAuthHeaders(),
    ...options,
  });

  if (!res.ok) {
    let errorMessage = "Request failed";
    try {
      const err = await res.json();
      errorMessage = err.detail || errorMessage;
    } catch { }
    throw new Error(errorMessage);
  }

  return res.json();
}

/* =========================
   LOGIN
========================= */
export async function login(email: string, password: string) {
  const formData = new URLSearchParams();
  formData.append("username", email);
  formData.append("password", password);

  const res = await fetch(`${BASE_URL}/api/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: formData.toString(),
  });

  if (!res.ok) {
    throw new Error("Invalid credentials");
  }

  return res.json(); // { access_token, token_type, ... }
}

/* =========================
   LOGOUT
========================= */
export function logout() {
  localStorage.removeItem("token");
  window.location.href = "/"; // redirect to frontpage
}

/* =========================
   EMPLOYEES
========================= */
export async function getEmployees() {
  return apiRequest("/api/employees/");
}

export async function getEmployee(id: number) {
  return apiRequest(`/api/employees/${id}`);
}

export async function createEmployee(name: string, email: string, role: string = "employee") {
  return apiRequest("/api/employees/", {
    method: "POST",
    body: JSON.stringify({ name, email, role }),
  });
}

export async function getEmployeeTransactions(id: number) {
  return apiRequest(`/api/employees/${id}/transactions`);
}

export async function setEmployeeTax(
  employeeId: number,
  useCustomTax: boolean,
  customTaxRate?: number
) {
  return apiRequest(`/api/employees/${employeeId}/tax`, {
    method: "PUT",
    body: JSON.stringify({
      use_custom_tax: useCustomTax,
      custom_tax_rate: useCustomTax ? customTaxRate : null,
    }),
  });
}

/* =========================
   STREAM CONTROL
========================= */
export async function pauseStream(id: number) {
  return apiRequest(`/api/stream/pause/${id}`, { method: "POST" });
}

export async function startStream(id: number) {
  return apiRequest(`/api/stream/start/${id}`, { method: "POST" });
}

/* =========================
   TRANSACTIONS (Salary)
========================= */
export async function createTransaction(
  employee_id: number,
  amount: number,
  description: string
) {
  return apiRequest(`/api/transactions/`, {
    method: "POST",
    body: JSON.stringify({ employee_id, amount, description }),
  });
}

/* =========================
   BONUSES
========================= */
export async function giveBonus(
  employee_id: number,
  amount: number,
  reason: string
) {
  return apiRequest(`/api/bonuses/${employee_id}`, {
    method: "POST",
    body: JSON.stringify({ employee_id, amount, reason }),
  });
}

/* =========================
   TREASURY
========================= */
export async function getTreasury() {
  return apiRequest("/api/treasury");
}

export async function depositTreasury(amount: number) {
  return apiRequest("/api/treasury/deposit", {
    method: "POST",
    body: JSON.stringify({ amount }),
  });
}

export async function withdrawTreasury(amount: number) {
  return apiRequest("/api/treasury/withdraw", {
    method: "POST",
    body: JSON.stringify({ amount }),
  });
}

/* =========================
   DASHBOARD
========================= */
export async function getTotalPayout() {
  return apiRequest("/api/dashboard/total-payout");
}

export async function getTotalTax() {
  return apiRequest("/api/dashboard/total-tax");
}

export async function getActiveStreams() {
  return apiRequest("/api/dashboard/active-streams");
}

export async function getTopEarners() {
  return apiRequest("/api/dashboard/top-earners");
}

export async function getMonthlySummary() {
  return apiRequest("/api/dashboard/monthly-summary");
}

/* =========================
   SETTINGS
========================= */
export async function getCompanyTax() {
  return apiRequest("/api/settings/company-tax");
}

export async function updateCompanyTax(rate: number) {
  return apiRequest("/api/settings/company-tax", {
    method: "POST",
    body: JSON.stringify({ default_tax_rate: rate }),
  });
}

export async function getTaxSlabs() {
  return apiRequest("/api/settings/tax-slabs");
}

export async function createTaxSlab(
  min_income: number,
  max_income: number | null,
  tax_rate: number
) {
  return apiRequest("/api/settings/tax-slabs", {
    method: "POST",
    body: JSON.stringify({ min_income, max_income, tax_rate }),
  });
}

export async function deleteTaxSlab(id: number) {
  return apiRequest(`/api/settings/tax-slabs/${id}`, {
    method: "DELETE",
  });
}

/* =========================
   BLOCKCHAIN (Web3Auth + HeLa)
========================= */
export async function getBlockchainConfig() {
  return apiRequest("/api/blockchain/config");
}

export async function updateEmployeeWallet(
  employeeId: number,
  walletAddress: string
) {
  return apiRequest(`/api/employees/${employeeId}/wallet`, {
    method: "PUT",
    body: JSON.stringify({ wallet_address: walletAddress }),
  });
}

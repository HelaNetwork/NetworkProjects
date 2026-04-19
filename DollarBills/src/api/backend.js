const DEFAULT_BACKEND_URL = 'http://localhost:5000';

const backendBaseUrl = (import.meta.env.VITE_BACKEND_URL || DEFAULT_BACKEND_URL).replace(/\/$/, '');

async function requestJson(path) {
  const response = await fetch(`${backendBaseUrl}${path}`, {
    method: 'GET',
    headers: { 'Accept': 'application/json' },
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(`Backend ${response.status}: ${text || response.statusText}`);
  }

  return response.json();
}

export function getBackendHealth() {
  return requestJson('/health');
}

export function getBackendStats() {
  return requestJson('/api/stats');
}

export function getBackendCompliance() {
  return requestJson('/api/compliance');
}

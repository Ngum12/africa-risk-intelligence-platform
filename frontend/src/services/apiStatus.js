// This file is imported in Dashboard.jsx but might be missing

const API_URL = "https://africa-risk-api.onrender.com";

export async function checkApiStatus() {
  try {
    console.log("Checking API status at:", `${API_URL}/api/status`);
    const response = await fetch(`${API_URL}/api/status`);
    if (!response.ok) throw new Error(`HTTP error ${response.status}`);
    return { ok: true, data: await response.json() };
  } catch (error) {
    console.error('API status check failed:', error);
    return { ok: false, error: error.message };
  }
}
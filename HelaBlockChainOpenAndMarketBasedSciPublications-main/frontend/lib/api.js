import axios from "axios";

const API = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000",
});

// Upload paper
export async function uploadPaper(title, file, onProgress) {
  const form = new FormData();
  form.append("title", title);
  form.append("file", file);
  const res = await API.post("/api/papers", form, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: (e) => {
      if (onProgress) onProgress(Math.round((e.loaded * 100) / e.total));
    },
  });
  return res.data;
}

// Get all papers
export async function getPapers() {
  const res = await API.get("/api/papers");
  return res.data;
}

// Get single paper
export async function getPaper(id) {
  const res = await API.get(`/api/papers/${id}`);
  return res.data;
}

// Update paper (used in PROMPT 3 for txHash, walletAddress, onChain)
export async function updatePaper(id, data) {
  const res = await API.patch(`/api/papers/${id}`, data);
  return res.data;
}

// Delete paper
export async function deletePaper(id) {
  await API.delete(`/api/papers/${id}`);
}

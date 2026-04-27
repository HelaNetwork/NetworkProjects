import { useState, useRef } from "react";
import { useRouter } from "next/router";
import Navbar from "../components/Navbar";
import { uploadPaper } from "../lib/api";

export default function Upload({ walletAddress, onConnect }) {
  const router  = useRouter();
  const fileRef = useRef(null);

  const [title,     setTitle]     = useState("");
  const [file,      setFile]      = useState(null);
  const [dragOver,  setDragOver]  = useState(false);
  const [progress,  setProgress]  = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error,     setError]     = useState(null);

  function handleDrop(e) {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f?.type === "application/pdf") { setFile(f); setError(null); }
    else setError("Only PDF files accepted");
  }

  async function handleSubmit() {
    if (!title.trim()) return setError("Title is required");
    if (!file)         return setError("PDF file is required");
    setError(null);
    setUploading(true);
    try {
      const paper = await uploadPaper(title, file, setProgress);
      router.push(`/paper/${paper.id}`);
    } catch (err) {
      setError(err.response?.data?.error || "Upload failed");
      setUploading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <Navbar walletAddress={walletAddress} onConnect={onConnect} />

      <main style={{ maxWidth: 620, margin: "0 auto", padding: "48px 24px" }}>

        {/* Header */}
        <div className="fade-up" style={{ marginBottom: 36 }}>
          <p className="section-label" style={{ marginBottom: 6 }}>new entry</p>
          <h1 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "2rem", color: "var(--text)", letterSpacing: "-0.02em" }}>
            Upload Paper
          </h1>
          <p style={{ color: "var(--text-dim)", fontSize: "0.85rem", marginTop: 6 }}>
            SHA-256 hash generated automatically on upload
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Title field */}
          <div className="fade-up fade-up-1">
            <label style={{ display: "block", fontFamily: "'Fira Code', monospace", fontSize: "0.7rem", color: "var(--text-faint)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>
              paper title
            </label>
            <input
              className="field-input"
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSubmit()}
              placeholder="e.g. Attention Is All You Need"
              style={{ padding: "12px 16px", borderRadius: 8 }}
            />
          </div>

          {/* Drop zone */}
          <div className="fade-up fade-up-2">
            <label style={{ display: "block", fontFamily: "'Fira Code', monospace", fontSize: "0.7rem", color: "var(--text-faint)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>
              pdf file
            </label>
            <div
              className={`drop-zone${dragOver ? " drag-over" : ""}`}
              style={{
                border: `1px dashed ${dragOver ? "var(--accent)" : "var(--border2)"}`,
                borderRadius: 10,
                padding: "36px 24px",
                textAlign: "center",
                cursor: "pointer",
                background: dragOver ? "var(--accent-dim)" : "var(--surface)",
              }}
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
            >
              <input
                ref={fileRef}
                type="file"
                accept="application/pdf"
                style={{ display: "none" }}
                onChange={e => { setFile(e.target.files[0]); setError(null); }}
              />

              {file ? (
                <div>
                  <div style={{ fontFamily: "'Fira Code', monospace", fontSize: "0.75rem", color: "var(--accent)", marginBottom: 6 }}>
                    ✓ {file.name}
                  </div>
                  <div style={{ fontFamily: "'Fira Code', monospace", fontSize: "0.68rem", color: "var(--text-faint)", marginBottom: 14 }}>
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); setFile(null); }}
                    style={{ fontFamily: "'Fira Code', monospace", fontSize: "0.68rem", color: "var(--muted)", background: "none", border: "none", cursor: "pointer", letterSpacing: "0.04em" }}
                  >
                    [remove]
                  </button>
                </div>
              ) : (
                <div>
                  <div style={{ fontFamily: "'Fira Code', monospace", fontSize: "1.4rem", color: "var(--muted)", marginBottom: 10 }}>
                    ⬆
                  </div>
                  <p style={{ color: "var(--text-dim)", fontSize: "0.85rem", marginBottom: 4 }}>
                    Drop PDF here or <span style={{ color: "var(--accent)" }}>browse</span>
                  </p>
                  <p style={{ fontFamily: "'Fira Code', monospace", fontSize: "0.68rem", color: "var(--text-faint)" }}>
                    max 20 MB · pdf only
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div style={{ border: "1px solid rgba(255,77,106,0.3)", background: "rgba(255,77,106,0.06)", borderRadius: 8, padding: "12px 16px", fontFamily: "'Fira Code', monospace", fontSize: "0.78rem", color: "var(--danger)" }}>
              ✗ {error}
            </div>
          )}

          {/* Progress */}
          {uploading && (
            <div className="fade-up">
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontFamily: "'Fira Code', monospace", fontSize: "0.7rem", color: "var(--text-dim)" }}>uploading…</span>
                <span style={{ fontFamily: "'Fira Code', monospace", fontSize: "0.7rem", color: "var(--accent)" }}>{progress}%</span>
              </div>
              <div className="progress-bar" style={{ borderRadius: 2 }}>
                <div className="progress-fill" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}

          {/* Submit */}
          <div className="fade-up fade-up-3">
            <button
              className="btn-primary"
              onClick={handleSubmit}
              disabled={uploading}
              style={{ width: "100%", padding: "13px", borderRadius: 8 }}
            >
              {uploading ? (
                <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                  <span className="spinner" />
                  uploading…
                </span>
              ) : "Hash & Register Paper →"}
            </button>
          </div>

        </div>
      </main>
    </div>
  );
}

"use client";
import { useState, useEffect } from "react";

export default function ThemeSwitcher() {
  const [mounted, setMounted] = useState(false);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("paystream-theme");
    if (saved === "dark") {
      setDark(true);
      document.documentElement.setAttribute("data-theme", "dark");
    }
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    if (next) {
      document.documentElement.setAttribute("data-theme", "dark");
      localStorage.setItem("paystream-theme", "dark");
    } else {
      document.documentElement.removeAttribute("data-theme");
      localStorage.setItem("paystream-theme", "light");
    }
  };

  if (!mounted) return <div className="w-12 h-6" />;

  return (
    <button
      onClick={toggle}
      className="relative w-12 h-6 rounded-full transition-colors duration-300 focus:outline-none"
      style={{
        background: dark ? "var(--accent)" : "var(--border)",
      }}
      aria-label="Toggle dark mode"
    >
      <span
        className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full transition-transform duration-300 flex items-center justify-center text-xs"
        style={{
          background: dark ? "var(--bg-primary)" : "#fff",
          transform: dark ? "translateX(24px)" : "translateX(0)",
          boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
        }}
      >
        {dark ? "D" : "L"}
      </span>
    </button>
  );
}

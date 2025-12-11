import { useState, useEffect } from "react";

export default function Toast({ message, type = "info", duration = 2500 }) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShow(false), duration);
    return () => clearTimeout(timer);
  }, [duration]);

  if (!show) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 32,
        right: 32,
        zIndex: 999,
        background: type === "error" ? "#ff4545" : "#3eaf7c",
        color: "#fff",
        padding: "16px 24px",
        borderRadius: 8,
        boxShadow: "0 2px 8px rgba(0,0,0,0.12)"
      }}
    >
      {message}
    </div>
  );
}
import { useState, useEffect } from "react";
import "../css/Toast.css";

export default function Toast({ 
  message, 
  type = "info", 
  duration = 3000,
  onClose 
}) {
  const [show, setShow] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (!duration) return;

    const timer = setTimeout(() => {
      startExit();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  const startExit = () => {
    setIsExiting(true);
    setTimeout(() => {
      setShow(false);
      if (onClose) onClose();
    }, 300);
  };

  if (!show) return null;

  const icons = {
    success: "✓",
    error: "✕",
    info: "ℹ",
    warning: "⚠"
  };

  const colors = {
    success: "#10b981",
    error: "#ef4444",
    info: "#3b82f6",
    warning: "#f59e0b"
  };

  return (
    <div 
      className={`toast-container ${isExiting ? 'exiting' : ''}`}
      style={{
        position: "fixed",
        top: 24,
        right: 24,
        zIndex: 9999,
        minWidth: "300px",
        maxWidth: "400px",
        backgroundColor: colors[type] || colors.info,
        color: "#fff",
        padding: "16px 20px",
        borderRadius: "12px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
        display: "flex",
        alignItems: "flex-start",
        gap: "12px",
        transform: isExiting ? "translateX(120%)" : "translateX(0)",
        opacity: isExiting ? 0 : 1,
        transition: "all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)"
      }}
      onClick={startExit}
    >
      <div 
        className="toast-icon"
        style={{
          fontSize: "20px",
          fontWeight: "bold",
          flexShrink: 0,
          marginTop: "2px"
        }}
      >
        {icons[type] || icons.info}
      </div>
      
      <div className="toast-content" style={{ flex: 1 }}>
        <div 
          className="toast-title"
          style={{
            fontWeight: "600",
            marginBottom: "4px",
            fontSize: "15px"
          }}
        >
          {type === 'error' ? 'Error' : 
           type === 'success' ? 'Success' : 
           type === 'warning' ? 'Warning' : 'Info'}
        </div>
        <div 
          className="toast-message"
          style={{
            fontSize: "14px",
            opacity: 0.95,
            lineHeight: "1.4"
          }}
        >
          {message}
        </div>
      </div>
      
      <button 
        className="toast-close"
        onClick={startExit}
        style={{
          background: "transparent",
          border: "none",
          color: "#fff",
          cursor: "pointer",
          fontSize: "20px",
          opacity: 0.7,
          padding: "0",
          marginLeft: "8px",
          flexShrink: 0
        }}
        aria-label="Close notification"
      >
        ×
      </button>
    </div>
  );
}

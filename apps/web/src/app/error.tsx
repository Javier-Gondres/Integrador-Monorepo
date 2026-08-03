"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "16px",
        padding: "24px",
      }}
    >
      <h2 style={{ fontSize: "18px", fontWeight: 600, color: "#1C2434" }}>
        Algo salió mal
      </h2>
      <p style={{ fontSize: "14px", color: "#637381", textAlign: "center" }}>
        {error.message || "Ocurrió un error inesperado."}
      </p>
      <button
        type="button"
        onClick={reset}
        style={{
          height: "40px",
          padding: "0 20px",
          borderRadius: "8px",
          border: "none",
          backgroundColor: "#3C50E0",
          color: "#fff",
          fontSize: "14px",
          fontWeight: 600,
          cursor: "pointer",
        }}
      >
        Reintentar
      </button>
    </div>
  );
}

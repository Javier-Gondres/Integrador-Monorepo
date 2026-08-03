import Link from "next/link";

export default function NotFound() {
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
      <h2 style={{ fontSize: "24px", fontWeight: 700, color: "#1C2434" }}>
        404
      </h2>
      <p style={{ fontSize: "14px", color: "#637381" }}>
        La página que buscas no existe.
      </p>
      <Link
        href="/"
        style={{
          height: "40px",
          padding: "0 20px",
          borderRadius: "8px",
          backgroundColor: "#3C50E0",
          color: "#fff",
          fontSize: "14px",
          fontWeight: 600,
          display: "flex",
          alignItems: "center",
        }}
      >
        Volver al inicio
      </Link>
    </div>
  );
}

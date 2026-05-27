"use client";

import {
  ChevronLeft,
  ChevronRight,
  Pencil,
  Plus,
  RotateCw,
  Trash2,
  X,
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";

interface Supplier {
  id: string;
  supplierId: string;
  name: string;
  email: string;
  rnc: string;
  phoneNumber: string;
  address: string;
  deleted: boolean;
  createdAt: string;
  updatedAt: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

// Paleta de colores TailAdmin v1.3
const C = {
  pageBg: "#F1F5F9",
  cardBg: "#FFFFFF",
  cardBorder: "#E2E8F0",
  cardShadow: "0 1px 3px rgba(0,0,0,.06), 0 1px 2px rgba(0,0,0,.04)",
  tableHead: "#F7F9FC",
  headText: "#637381",
  bodyText: "#1C2434",
  mutedText: "#9BA3AF",
  divider: "#EFF4FB",
  primary: "#3C50E0",
  primaryHover: "#2D3FC7",
  greenBg: "#EDFCF2",
  greenText: "#0D9F5F",
  greenBorder: "#A6F4C5",
  grayBg: "#F3F4F6",
  grayText: "#6B7280",
  grayBorder: "#D1D5DB",
  inputBorder: "#E2E8F0",
  inputFocus: "#3C50E0",
  danger: "#DC2626",
  dangerBg: "#FEF2F2",
};

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [formData, setFormData] = useState({
    supplierId: "",
    name: "",
    email: "",
    rnc: "",
    phoneNumber: "",
    address: "",
  });

  // Fetch Principal
  const loadSuppliers = async (signal?: AbortSignal) => {
    try {
      setLoading(true);

      const res = await fetch(`${API_URL}/suppliers`, {
        signal,
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = (await res.json()) as Supplier[];

      setSuppliers(data);
    } catch (error) {
      if (error instanceof Error && error.name !== "AbortError") {
        console.error("Could not load suppliers:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();

    loadSuppliers(controller.signal);

    return () => controller.abort();
  }, []);

  // Borrado lógico
  const borradoLogico = async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/suppliers/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete supplier");
      }

      loadSuppliers();
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Error al eliminar proveedor:", error.message);
      } else {
        console.error("Error desconocido al eliminar proveedor:", error);
      }
      alert("Could not delete supplier");
    }
  };

  // Guardar (Crear o Editar)
  const guardarProveedor = async (e: React.FormEvent) => {
    e.preventDefault();

    const url = editingSupplier
      ? `${API_URL}/suppliers/${editingSupplier.id}`
      : `${API_URL}/suppliers`;

    const method = editingSupplier ? "PATCH" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setIsModalOpen(false);
        setEditingSupplier(null);
        setFormData({
          supplierId: "",
          name: "",
          email: "",
          rnc: "",
          phoneNumber: "",
          address: "",
        });
        loadSuppliers();
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(`Error al guardar: ${errData.message || res.statusText}`);
      }
    } catch (e) {
      console.error("Error al guardar el proveedor:", e);
      alert("Ocurrió un error de red al intentar guardar.");
    }
  };

  const openCreateModal = () => {
    setEditingSupplier(null);
    setFormData({
      supplierId: "",
      name: "",
      email: "",
      rnc: "",
      phoneNumber: "",
      address: "",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (sup: Supplier) => {
    setEditingSupplier(sup);
    setFormData({
      supplierId: sup.supplierId,
      name: sup.name,
      email: sup.email || "",
      rnc: sup.rnc || "",
      phoneNumber: sup.phoneNumber || "",
      address: sup.address || "",
    });
    setIsModalOpen(true);
  };

  // Paginacion y Filtros
  const filtered = useMemo(
    () =>
      suppliers
        .filter((s) => !s.deleted)
        .filter(
          (s) =>
            s.supplierId.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.rnc.includes(searchTerm) ||
            s.phoneNumber.includes(searchTerm),
        ),
    [suppliers, searchTerm],
  );

  const totalRows = filtered.length;
  const totalPages = useMemo(
    () => Math.ceil(totalRows / rowsPerPage) || 1,
    [totalRows, rowsPerPage],
  );
  const safePage = Math.min(currentPage, totalPages);
  const startIdx = (safePage - 1) * rowsPerPage;
  const endIdx = Math.min(startIdx + rowsPerPage, totalRows);
  const paginatedSuppliers = useMemo(
    () => filtered.slice(startIdx, endIdx),
    [filtered, startIdx, endIdx],
  );

  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: C.pageBg,
        fontFamily: "inherit",
      }}
    >
      {/* Header de la pagina */}
      <div
        style={{
          backgroundColor: C.cardBg,
          borderBottom: `1px solid ${C.cardBorder}`,
          padding: "20px 40px",
        }}
      >
        <p
          style={{ fontSize: "13px", color: C.mutedText, marginBottom: "4px" }}
        >
          Panel / <span style={{ color: C.primary }}>Proveedores</span>
        </p>
        <h1
          style={{
            fontSize: "24px",
            fontWeight: 700,
            color: C.bodyText,
            margin: 0,
          }}
        >
          Proveedores
        </h1>
      </div>

      {/* Body  */}
      <div
        style={{
          padding: "32px 40px",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
        }}
      >
        {/*Toolbar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
          }}
        >
          {/* Buscador*/}
          <input
            type="text"
            placeholder="Buscar proveedor..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            style={{
              width: "280px",
              height: "40px",
              padding: "0 14px",
              border: `1px solid ${C.inputBorder}`,
              borderRadius: "8px",
              fontSize: "14px",
              color: C.bodyText,
              backgroundColor: C.cardBg,
              outline: "none",
            }}
          />

          {/* Botones de accion */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <button
              onClick={() => loadSuppliers()}
              title="Refrescar"
              style={{
                width: "40px",
                height: "40px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: C.cardBg,
                border: `1px solid ${C.cardBorder}`,
                borderRadius: "8px",
                color: C.headText,
                cursor: "pointer",
              }}
            >
              <RotateCw
                style={{ width: "16px", height: "16px" }}
                className={loading ? "animate-spin" : ""}
              />
            </button>
            <button
              onClick={openCreateModal}
              style={{
                height: "40px",
                padding: "0 20px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                backgroundColor: C.primary,
                border: "none",
                borderRadius: "8px",
                color: "#fff",
                fontSize: "14px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              <Plus style={{ width: "16px", height: "16px" }} />
              Nuevo Proveedor
            </button>
          </div>
        </div>

        {/* Tabla */}
        <div
          style={{
            backgroundColor: C.cardBg,
            borderRadius: "10px",
            border: `1px solid ${C.cardBorder}`,
            boxShadow: C.cardShadow,
            overflow: "hidden",
          }}
        >
          {/* header */}
          <div
            style={{
              padding: "16px 24px",
              borderBottom: `1px solid ${C.divider}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <h3
              style={{
                margin: 0,
                fontSize: "16px",
                fontWeight: 600,
                color: C.bodyText,
              }}
            >
              Lista de Proveedores
            </h3>
            <span style={{ fontSize: "13px", color: C.mutedText }}>
              {totalRows} {totalRows === 1 ? "resultado" : "resultados"}
            </span>
          </div>

          {/* Table */}
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ backgroundColor: C.tableHead }}>
                  {[
                    "ID Proveedor",
                    "Nombre",
                    "Email",
                    "RNC",
                    "Teléfono",
                    "Acciones",
                  ].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "13px 20px",
                        textAlign: h === "Nombre" ? "left" : "center",
                        fontSize: "12px",
                        fontWeight: 600,
                        color: C.headText,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        borderBottom: `1px solid ${C.divider}`,
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={6}
                      style={{
                        textAlign: "center",
                        padding: 20,
                      }}
                    >
                      Loading suppliers...
                    </td>
                  </tr>
                ) : paginatedSuppliers.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      style={{
                        textAlign: "center",
                        padding: 20,
                      }}
                    >
                      No suppliers found
                    </td>
                  </tr>
                ) : (
                  paginatedSuppliers.map((supplier, i) => (
                    <tr
                      key={supplier.id}
                      style={{
                        borderBottom:
                          i < paginatedSuppliers.length - 1
                            ? `1px solid ${C.divider}`
                            : "none",
                      }}
                      className="group hover:bg-[#F9FAFB] transition-colors"
                    >
                      <td
                        style={{
                          padding: "14px 20px",
                          fontSize: "14px",
                          fontWeight: 600,
                          color: C.bodyText,
                        }}
                      >
                        {supplier.supplierId}
                      </td>
                      <td
                        style={{
                          padding: "14px 20px",
                          fontSize: "14px",
                          color: C.bodyText,
                          textAlign: "center",
                        }}
                      >
                        {supplier.name}
                      </td>
                      <td
                        style={{
                          padding: "14px 20px",
                          fontSize: "14px",
                          color: C.headText,
                          textAlign: "center",
                        }}
                      >
                        {supplier.email}
                      </td>
                      <td
                        style={{
                          padding: "14px 20px",
                          fontSize: "14px",
                          color: C.headText,
                          textAlign: "center",
                        }}
                      >
                        {supplier.rnc}
                      </td>
                      <td
                        style={{
                          padding: "14px 20px",
                          fontSize: "14px",
                          color: C.headText,
                          textAlign: "center",
                        }}
                      >
                        {supplier.phoneNumber}
                      </td>
                      <td style={{ padding: "14px 20px", textAlign: "center" }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "4px",
                          }}
                        >
                          <button
                            onClick={() => openEditModal(supplier)}
                            title="Editar"
                            style={{
                              width: "34px",
                              height: "34px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              borderRadius: "7px",
                              border: `1px solid ${C.cardBorder}`,
                              backgroundColor: C.cardBg,
                              color: C.headText,
                              cursor: "pointer",
                            }}
                            className="hover:border-blue-400 hover:text-blue-600 transition-colors"
                          >
                            <Pencil style={{ width: "14px", height: "14px" }} />
                          </button>
                          <button
                            onClick={() => borradoLogico(supplier.id)}
                            title="Eliminar"
                            style={{
                              width: "34px",
                              height: "34px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              borderRadius: "7px",
                              border: `1px solid ${C.cardBorder}`,
                              backgroundColor: C.cardBg,
                              color: C.headText,
                              cursor: "pointer",
                            }}
                            className="hover:border-red-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 style={{ width: "14px", height: "14px" }} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Footer de paginacion */}
          <div
            style={{
              padding: "14px 24px",
              borderTop: `1px solid ${C.divider}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "12px",
              flexWrap: "wrap",
            }}
          >
            {/*Apartado de filas por página*/}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "13px",
                color: C.headText,
              }}
            >
              <span>Filas por página:</span>
              <select
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                style={{
                  height: "32px",
                  padding: "0 8px",
                  border: `1px solid ${C.inputBorder}`,
                  borderRadius: "6px",
                  fontSize: "13px",
                  color: C.bodyText,
                  backgroundColor: C.cardBg,
                  cursor: "pointer",
                  outline: "none",
                }}
              >
                {[5, 10, 25, 50].map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* Rangos */}
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <span style={{ fontSize: "13px", color: C.headText }}>
                {totalRows === 0 ? "0–0" : `${startIdx + 1}–${endIdx}`} de{" "}
                {totalRows}
              </span>
              <div style={{ display: "flex", gap: "6px" }}>
                {[
                  {
                    onClick: () => setCurrentPage((p) => Math.max(p - 1, 1)),
                    disabled: safePage === 1 || loading,
                    Icon: ChevronLeft,
                  },
                  {
                    onClick: () =>
                      setCurrentPage((p) => Math.min(p + 1, totalPages)),
                    disabled: safePage === totalPages || loading,
                    Icon: ChevronRight,
                  },
                ].map(({ onClick, disabled, Icon }, i) => (
                  <button
                    key={i}
                    onClick={onClick}
                    disabled={disabled}
                    style={{
                      width: "32px",
                      height: "32px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      border: `1px solid ${C.inputBorder}`,
                      borderRadius: "6px",
                      backgroundColor: C.cardBg,
                      color: disabled ? C.mutedText : C.bodyText,
                      cursor: disabled ? "not-allowed" : "pointer",
                      opacity: disabled ? 0.4 : 1,
                    }}
                  >
                    <Icon style={{ width: "15px", height: "15px" }} />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/*Modal*/}
      {isModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 50,
            padding: "16px",
          }}
        >
          <div
            style={{
              backgroundColor: C.cardBg,
              width: "100%",
              maxWidth: "480px",
              borderRadius: "12px",
              border: `1px solid ${C.cardBorder}`,
              boxShadow: "0 20px 60px rgba(0,0,0,.15)",
              display: "flex",
              flexDirection: "column",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            {/* header */}
            <div
              style={{
                padding: "20px 24px",
                borderBottom: `1px solid ${C.divider}`,
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
              }}
            >
              <div>
                <h3
                  style={{
                    margin: "0 0 4px",
                    fontSize: "17px",
                    fontWeight: 700,
                    color: C.bodyText,
                  }}
                >
                  {editingSupplier ? "Editar Proveedor" : "Nuevo Proveedor"}
                </h3>
                <p style={{ margin: 0, fontSize: "13px", color: C.headText }}>
                  {editingSupplier
                    ? "Modifica los datos del proveedor."
                    : "Completa los campos para añadir un nuevo proveedor."}
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{
                  width: "30px",
                  height: "30px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "6px",
                  border: "none",
                  backgroundColor: "transparent",
                  color: C.headText,
                  cursor: "pointer",
                }}
              >
                <X style={{ width: "16px", height: "16px" }} />
              </button>
            </div>

            {/* Modal body */}
            <form
              onSubmit={guardarProveedor}
              style={{
                padding: "24px",
                display: "flex",
                flexDirection: "column",
                gap: "18px",
              }}
            >
              <div
                style={{ display: "flex", flexDirection: "column", gap: "6px" }}
              >
                <label
                  style={{
                    fontSize: "13px",
                    fontWeight: 600,
                    color: C.bodyText,
                  }}
                >
                  Supplier ID <span style={{ color: C.danger }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="PROV-001"
                  value={formData.supplierId}
                  onChange={(e) =>
                    setFormData({ ...formData, supplierId: e.target.value })
                  }
                  style={{
                    height: "42px",
                    padding: "0 14px",
                    border: `1px solid ${C.inputBorder}`,
                    borderRadius: "8px",
                    fontSize: "14px",
                    color: C.bodyText,
                    backgroundColor: C.cardBg,
                    outline: "none",
                  }}
                />
              </div>

              <div
                style={{ display: "flex", flexDirection: "column", gap: "6px" }}
              >
                <label
                  style={{
                    fontSize: "13px",
                    fontWeight: 600,
                    color: C.bodyText,
                  }}
                >
                  Name <span style={{ color: C.danger }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Empresa XYZ"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  style={{
                    height: "42px",
                    padding: "0 14px",
                    border: `1px solid ${C.inputBorder}`,
                    borderRadius: "8px",
                    fontSize: "14px",
                    color: C.bodyText,
                    backgroundColor: C.cardBg,
                    outline: "none",
                  }}
                />
              </div>

              <div
                style={{ display: "flex", flexDirection: "column", gap: "6px" }}
              >
                <label
                  style={{
                    fontSize: "13px",
                    fontWeight: 600,
                    color: C.bodyText,
                  }}
                >
                  Email <span style={{ color: C.danger }}>*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="info@empresa.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  style={{
                    height: "42px",
                    padding: "0 14px",
                    border: `1px solid ${C.inputBorder}`,
                    borderRadius: "8px",
                    fontSize: "14px",
                    color: C.bodyText,
                    backgroundColor: C.cardBg,
                    outline: "none",
                  }}
                />
              </div>

              <div
                style={{ display: "flex", flexDirection: "column", gap: "6px" }}
              >
                <label
                  style={{
                    fontSize: "13px",
                    fontWeight: 600,
                    color: C.bodyText,
                  }}
                >
                  RNC <span style={{ color: C.danger }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="101234567"
                  value={formData.rnc}
                  onChange={(e) =>
                    setFormData({ ...formData, rnc: e.target.value })
                  }
                  style={{
                    height: "42px",
                    padding: "0 14px",
                    border: `1px solid ${C.inputBorder}`,
                    borderRadius: "8px",
                    fontSize: "14px",
                    color: C.bodyText,
                    backgroundColor: C.cardBg,
                    outline: "none",
                  }}
                />
              </div>

              <div
                style={{ display: "flex", flexDirection: "column", gap: "6px" }}
              >
                <label
                  style={{
                    fontSize: "13px",
                    fontWeight: 600,
                    color: C.bodyText,
                  }}
                >
                  Phone <span style={{ color: C.danger }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="809-555-5555"
                  value={formData.phoneNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, phoneNumber: e.target.value })
                  }
                  style={{
                    height: "42px",
                    padding: "0 14px",
                    border: `1px solid ${C.inputBorder}`,
                    borderRadius: "8px",
                    fontSize: "14px",
                    color: C.bodyText,
                    backgroundColor: C.cardBg,
                    outline: "none",
                  }}
                />
              </div>

              <div
                style={{ display: "flex", flexDirection: "column", gap: "6px" }}
              >
                <label
                  style={{
                    fontSize: "13px",
                    fontWeight: 600,
                    color: C.bodyText,
                  }}
                >
                  Address <span style={{ color: C.danger }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Calle Principal 123, Santo Domingo"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  style={{
                    height: "42px",
                    padding: "0 14px",
                    border: `1px solid ${C.inputBorder}`,
                    borderRadius: "8px",
                    fontSize: "14px",
                    color: C.bodyText,
                    backgroundColor: C.cardBg,
                    outline: "none",
                  }}
                />
              </div>

              {/* Botones */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "10px",
                  paddingTop: "6px",
                  borderTop: `1px solid ${C.divider}`,
                }}
              >
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    height: "40px",
                    padding: "0 20px",
                    borderRadius: "8px",
                    border: `1px solid ${C.cardBorder}`,
                    backgroundColor: C.cardBg,
                    fontSize: "13px",
                    fontWeight: 600,
                    color: C.headText,
                    cursor: "pointer",
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{
                    height: "40px",
                    padding: "0 20px",
                    borderRadius: "8px",
                    border: "none",
                    backgroundColor: C.primary,
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "#fff",
                    cursor: "pointer",
                  }}
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

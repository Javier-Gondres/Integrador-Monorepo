"use client";

import {
  Check,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Plus,
  RotateCw,
  Trash2,
  X,
} from "lucide-react";
import React, { useEffect, useState } from "react";

interface Category {
  id: number;
  name: string;
  description: string | null;
  state: boolean;
  deleted: boolean;
}

interface PaginatedResponse {
  data: Category[];
  total: number;
  page: number;
  totalPages: number;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

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

export default function CategoriesPage() {
  // Estado del servidor y atributos que se le mandan al servidor
  const [data, setData] = useState<Category[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Controles busqueda y paginacion
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    state: true,
  });

  // Debounce aplicado a 350ms
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm), 350);
    return () => clearTimeout(t);
  }, [searchTerm]);

  // Resetear a página 1 cuando cambia el filtro
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  // Fetch principal
  useEffect(() => {
    const controller = new AbortController();

    const cargar = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: String(currentPage),
          take: String(rowsPerPage),
          ...(debouncedSearch && { q: debouncedSearch }),
        });

        const res = await fetch(`${API_URL}/categories?${params}`, {
          signal: controller.signal,
          headers: { Accept: "application/json" },
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const json: PaginatedResponse = await res.json();
        setData(json.data);
        setTotal(json.total);
        setTotalPages(json.totalPages);

        if (currentPage > json.totalPages) setCurrentPage(json.totalPages);
      } catch (e) {
        if (e instanceof Error && e.name === "AbortError") return;
        console.error(e);
        alert("No se pudieron cargar las categorías. Intenta de nuevo.");
      } finally {
        setLoading(false);
      }
    };

    cargar();
    return () => controller.abort();
  }, [currentPage, rowsPerPage, debouncedSearch]);

  // Cambiar estado activo/inactivo
  const cambiarEstado = async (id: number, cur: boolean) => {
    const next = !cur;
    try {
      const res = await fetch(`${API_URL}/categories/${id}/state/${next}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
      });
      if (res.ok) {
        setData((prev) =>
          prev.map((c) => (c.id === id ? { ...c, state: next } : c)),
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Borrado lógico
  const borradoLogico = async (id: number) => {
    try {
      const res = await fetch(`${API_URL}/categories/${id}/delete`, {
        method: "PATCH",
      });
      if (!res.ok) throw new Error("No se pudo eliminar");

      setData((prev) => prev.filter((c) => c.id !== id));
      setTotal((prev) => prev - 1);
    } catch (e) {
      console.error(e);
      alert("No se pudo procesar la solicitud de borrado");
    }
  };

  // ── Guardar (Crear o Editar)
  const guardarCategoria = async (e: React.FormEvent) => {
    e.preventDefault();

    const url = editingCategory
      ? `${API_URL}/categories/${editingCategory.id}`
      : `${API_URL}/categories`;
    const method = editingCategory ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setIsModalOpen(false);
        setEditingCategory(null);
        setFormData({ name: "", description: "", state: true });
        // Fuerza re-fetch de la página actual
        setCurrentPage((p) => (p === 1 ? 1 : p));
        setDebouncedSearch((s) => s);
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(`Error al guardar: ${errData.message || res.statusText}`);
      }
    } catch (e) {
      console.error(e);
      alert("Ocurrió un error de red al intentar guardar.");
    }
  };

  const openCreateModal = () => {
    setEditingCategory(null);
    setFormData({ name: "", description: "", state: true });
    setIsModalOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name,
      description: cat.description || "",
      state: cat.state,
    });
    setIsModalOpen(true);
  };

  // Valores para el footer (calculados para el server)
  const startIdx = total === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1;
  const endIdx = Math.min(currentPage * rowsPerPage, total);

  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: C.pageBg,
        fontFamily: "inherit",
      }}
    >
      {/* Header */}
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
          Panel / <span style={{ color: C.primary }}>Categorías</span>
        </p>
        <h1
          style={{
            fontSize: "24px",
            fontWeight: 700,
            color: C.bodyText,
            margin: 0,
          }}
        >
          Categorías
        </h1>
      </div>

      {/* Body */}
      <div
        style={{
          padding: "32px 40px",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
        }}
      >
        {/* Toolbar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
          }}
        >
          <input
            type="text"
            placeholder="Buscar categoría..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
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
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <button
              onClick={() => setDebouncedSearch((s) => s)}
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
              Nueva Categoría
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
          {/* Header tabla */}
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
              Lista de Categorías
            </h3>
            <span style={{ fontSize: "13px", color: C.mutedText }}>
              {total} {total === 1 ? "resultado" : "resultados"}
            </span>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ backgroundColor: C.tableHead }}>
                  {["Nombre", "Descripción", "Estado", "Acciones"].map((h) => (
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
                      colSpan={4}
                      style={{
                        textAlign: "center",
                        padding: "48px",
                        color: C.mutedText,
                        fontSize: "14px",
                      }}
                    >
                      Cargando categorías...
                    </td>
                  </tr>
                ) : data.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      style={{
                        textAlign: "center",
                        padding: "48px",
                        color: C.mutedText,
                        fontSize: "14px",
                      }}
                    >
                      No se encontraron categorías.
                    </td>
                  </tr>
                ) : (
                  data.map((cat, i) => (
                    <tr
                      key={cat.id}
                      style={{
                        borderBottom:
                          i < data.length - 1
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
                        {cat.name}
                      </td>
                      <td
                        style={{
                          padding: "14px 20px",
                          fontSize: "14px",
                          color: C.headText,
                          textAlign: "center",
                          maxWidth: "320px",
                        }}
                      >
                        <div
                          style={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {cat.description || (
                            <em
                              style={{ color: C.mutedText, fontSize: "13px" }}
                            >
                              Sin descripción
                            </em>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: "14px 20px", textAlign: "center" }}>
                        <button
                          onClick={() => cambiarEstado(cat.id, cat.state)}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "5px",
                            padding: "4px 12px",
                            borderRadius: "9999px",
                            fontSize: "12px",
                            fontWeight: 500,
                            cursor: "pointer",
                            border: `1px solid ${cat.state ? C.greenBorder : C.grayBorder}`,
                            backgroundColor: cat.state ? C.greenBg : C.grayBg,
                            color: cat.state ? C.greenText : C.grayText,
                          }}
                          title={
                            cat.state
                              ? "Click para desactivar"
                              : "Click para activar"
                          }
                        >
                          {cat.state ? (
                            <>
                              <Check
                                style={{
                                  width: "11px",
                                  height: "11px",
                                  strokeWidth: 3,
                                }}
                              />
                              Activo
                            </>
                          ) : (
                            <>
                              <X
                                style={{
                                  width: "11px",
                                  height: "11px",
                                  strokeWidth: 3,
                                }}
                              />
                              Inactivo
                            </>
                          )}
                        </button>
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
                            onClick={() => openEditModal(cat)}
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
                            onClick={() => borradoLogico(cat.id)}
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

          {/* Footer paginación */}
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

            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <span style={{ fontSize: "13px", color: C.headText }}>
                {total === 0 ? "0–0" : `${startIdx}–${endIdx}`} de {total}
              </span>
              <div style={{ display: "flex", gap: "6px" }}>
                {[
                  {
                    onClick: () => setCurrentPage((p) => Math.max(p - 1, 1)),
                    disabled: currentPage === 1 || loading,
                    Icon: ChevronLeft,
                  },
                  {
                    onClick: () =>
                      setCurrentPage((p) => Math.min(p + 1, totalPages)),
                    disabled: currentPage === totalPages || loading,
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

      {/* Modal */}
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
            }}
          >
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
                  {editingCategory ? "Editar Categoría" : "Nueva Categoría"}
                </h3>
                <p style={{ margin: 0, fontSize: "13px", color: C.headText }}>
                  {editingCategory
                    ? "Modifica los atributos de la categoría."
                    : "Completa los campos para añadir una nueva categoría."}
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

            <form
              onSubmit={guardarCategoria}
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
                  Nombre <span style={{ color: C.danger }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Tecnología, Alimentos..."
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
                  Descripción
                </label>
                <textarea
                  placeholder="Breve descripción de los elementos de esta categoría..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  style={{
                    height: "90px",
                    padding: "10px 14px",
                    resize: "none",
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
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "10px 14px",
                  backgroundColor: C.tableHead,
                  borderRadius: "8px",
                  border: `1px solid ${C.divider}`,
                }}
              >
                <input
                  type="checkbox"
                  id="modal-state"
                  checked={formData.state}
                  onChange={(e) =>
                    setFormData({ ...formData, state: e.target.checked })
                  }
                  style={{
                    width: "16px",
                    height: "16px",
                    accentColor: C.primary,
                    cursor: "pointer",
                  }}
                />
                <label
                  htmlFor="modal-state"
                  style={{
                    fontSize: "13px",
                    fontWeight: 500,
                    color: C.bodyText,
                    cursor: "pointer",
                  }}
                >
                  Habilitar categoría
                </label>
              </div>

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

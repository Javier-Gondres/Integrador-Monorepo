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
import { useParams } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { ERP_COLORS as C } from "@/constants/theme";
import { apiFetch } from "@/lib/api/client";
import { getErrorMessage } from "@/lib/api/errors";

import type { BranchListItem, MyCompanyListItem } from "../types/branch.types";

type StatusFilter = "active" | "inactive" | "all";

export function BranchesScreen() {
  const params = useParams<{ slug: string }>();
  const companySlug = params.slug;

  const [branches, setBranches] = useState<BranchListItem[]>([]);
  const [companyName, setCompanyName] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("active");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingBranch, setEditingBranch] = useState<BranchListItem | null>(
    null,
  );
  const [formData, setFormData] = useState({
    name: "",
    address: "",
  });

  // Fetch principal
  const cargarBranches = async (signal?: AbortSignal) => {
    setLoading(true);
    try {
      const data = await apiFetch<BranchListItem[]>("/branches", {
        signal,
      });
      setBranches(Array.isArray(data) ? data : []);
    } catch (e: unknown) {
      if (e instanceof Error) {
        if (e.name === "AbortError") return;
        console.error("Error real de la API:", e.message);
      } else {
        console.error("Error desconocido de la API:", e);
      }
      toast.error(
        getErrorMessage(
          e,
          "No se pudieron cargar las sucursales. Intenta de nuevo.",
        ),
      );
    } finally {
      setLoading(false);
    }
  };

  // Fetch del nombre de la empresa (solo para el breadcrumb)
  const cargarCompanyName = async (signal?: AbortSignal) => {
    try {
      const companies = await apiFetch<MyCompanyListItem[]>("/me/companies", {
        signal,
      });
      const currentCompany = companies.find(
        (company) => company.slug === companySlug,
      );
      if (currentCompany) {
        setCompanyName(currentCompany.name);
      }
    } catch (e: unknown) {
      if (e instanceof Error && e.name === "AbortError") return;
      // Falla silenciosa: el breadcrumb cae al texto base
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    cargarBranches(controller.signal);
    cargarCompanyName(controller.signal);

    return () => {
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companySlug]);

  // Borrado lógico
  const borradoLogico = async (id: string) => {
    try {
      await apiFetch<{ message: string }>(`/branches/${id}`, {
        method: "DELETE",
      });

      setBranches((prev) =>
        prev.map((b) => (b.id === id ? { ...b, isActive: false } : b)),
      );
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Error en el borrado lógico:", error.message);
      } else {
        console.error("Error desconocido en el borrado lógico:", error);
      }
      toast.error(
        getErrorMessage(error, "No se pudo procesar la solicitud de borrado"),
      );
    }
  };

  // Guardar (Crear o Editar)
  const guardarBranch = async (e: React.FormEvent) => {
    e.preventDefault();

    const endpoint = editingBranch
      ? `/branches/${editingBranch.id}`
      : "/branches";

    const method = editingBranch ? "PATCH" : "POST";

    const payload = {
      name: formData.name,
      address: formData.address.trim() === "" ? null : formData.address,
    };

    try {
      await apiFetch<BranchListItem>(endpoint, {
        method,
        body: JSON.stringify(payload),
      });
      setIsModalOpen(false);
      setEditingBranch(null);
      setFormData({ name: "", address: "" });
      cargarBranches();
    } catch (e) {
      console.error("Error al guardar la sucursal:", e);
      toast.error(
        getErrorMessage(e, "Ocurrió un error de red al intentar guardar."),
      );
    }
  };

  const openCreateModal = () => {
    setEditingBranch(null);
    setFormData({ name: "", address: "" });
    setIsModalOpen(true);
  };

  const openEditModal = (branch: BranchListItem) => {
    setEditingBranch(branch);
    setFormData({
      name: branch.name,
      address: branch.address ?? "",
    });
    setIsModalOpen(true);
  };

  // Paginación y filtros
  const filtered = useMemo(
    () =>
      branches
        .filter((b) => {
          if (statusFilter === "active") return b.isActive;
          if (statusFilter === "inactive") return !b.isActive;
          return true;
        })
        .filter((b) => {
          const q = searchTerm.toLowerCase();
          return (
            b.name.toLowerCase().includes(q) ||
            (b.address ?? "").toLowerCase().includes(q)
          );
        }),
    [branches, searchTerm, statusFilter],
  );

  const totalRows = filtered.length;
  const totalPages = useMemo(
    () => Math.ceil(totalRows / rowsPerPage) || 1,
    [totalRows, rowsPerPage],
  );
  const safePage = Math.min(currentPage, totalPages);
  const startIdx = (safePage - 1) * rowsPerPage;
  const endIdx = Math.min(startIdx + rowsPerPage, totalRows);
  const rows = useMemo(
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
          Panel / Empresas
          {companyName ? ` / ${companyName}` : ""} /{" "}
          <span style={{ color: C.primary }}>Sucursales</span>
        </p>
        <h1
          style={{
            fontSize: "24px",
            fontWeight: 700,
            color: C.bodyText,
            margin: 0,
          }}
        >
          Sucursales
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
          {/* Buscador y filtro de estado */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <input
              type="text"
              placeholder="Buscar sucursal..."
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
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as StatusFilter);
                setCurrentPage(1);
              }}
              style={{
                height: "40px",
                padding: "0 12px",
                border: `1px solid ${C.inputBorder}`,
                borderRadius: "8px",
                fontSize: "14px",
                color: C.bodyText,
                backgroundColor: C.cardBg,
                cursor: "pointer",
                outline: "none",
              }}
            >
              <option value="active">Activas</option>
              <option value="inactive">Inactivas</option>
              <option value="all">Todas</option>
            </select>
          </div>

          {/* Botones de accion */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <button
              onClick={() => cargarBranches()}
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
              Nueva Sucursal
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
              Lista de Sucursales
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
                  {["Nombre", "Dirección", "Estado", "Acciones"].map((h) => (
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
                      Cargando sucursales...
                    </td>
                  </tr>
                ) : rows.length === 0 ? (
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
                      No se encontraron sucursales.
                    </td>
                  </tr>
                ) : (
                  rows.map((branch, i) => (
                    <tr
                      key={branch.id}
                      style={{
                        borderBottom:
                          i < rows.length - 1
                            ? `1px solid ${C.divider}`
                            : "none",
                      }}
                      className="group hover:bg-[#F9FAFB] transition-colors"
                    >
                      {/* Nombre */}
                      <td
                        style={{
                          padding: "14px 20px",
                          fontSize: "14px",
                          fontWeight: 600,
                          color: C.bodyText,
                        }}
                      >
                        {branch.name}
                      </td>
                      {/* Dirección */}
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
                          {branch.address ? (
                            branch.address
                          ) : (
                            <em
                              style={{ color: C.mutedText, fontSize: "13px" }}
                            >
                              Sin dirección
                            </em>
                          )}
                        </div>
                      </td>
                      {/* Estado */}
                      <td style={{ padding: "14px 20px", textAlign: "center" }}>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "5px",
                            padding: "4px 12px",
                            borderRadius: "9999px",
                            fontSize: "12px",
                            fontWeight: 500,
                            border: `1px solid ${branch.isActive ? C.greenBorder : C.grayBorder}`,
                            backgroundColor: branch.isActive
                              ? C.greenBg
                              : C.grayBg,
                            color: branch.isActive ? C.greenText : C.grayText,
                          }}
                        >
                          {branch.isActive ? (
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
                        </span>
                      </td>
                      {/* Acciones */}
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
                            onClick={() => openEditModal(branch)}
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
                            onClick={() => borradoLogico(branch.id)}
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
                  {editingBranch ? "Editar Sucursal" : "Nueva Sucursal"}
                </h3>
                <p style={{ margin: 0, fontSize: "13px", color: C.headText }}>
                  {editingBranch
                    ? "Modifica los atributos de la sucursal."
                    : "Completa los campos para añadir una nueva sucursal."}
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
              onSubmit={guardarBranch}
              style={{
                padding: "24px",
                display: "flex",
                flexDirection: "column",
                gap: "18px",
              }}
            >
              {/* Nombre */}
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
                  placeholder="Ej. Sucursal Centro, Sucursal Norte..."
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

              {/* Dirección */}
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
                  Dirección
                </label>
                <input
                  type="text"
                  placeholder="Ej. Av. 27 de Febrero #123, Santo Domingo"
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

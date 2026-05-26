"use client";

import {
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Plus,
  RotateCw,
  Search,
  Trash2,
  X,
} from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  companyId: string | null;
  state: boolean;
  deleted: boolean;
}

interface Category {
  id: number;
  name: string;
  description?: string | null;
  state: boolean;
}

interface PaginatedResponse {
  data: Product[];
  total: number;
  page: number;
  totalPages: number;
}

interface CategoriesPaginatedResponse {
  data: Category[];
  total: number;
  page: number;
  totalPages: number;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
const CATEGORIES_PAGE_SIZE = 10;

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

// Combobox de selección de categorías para el formulario de producto

interface CategoryComboboxProps {
  selectedIds: number[];
  onChange: (ids: number[]) => void;
}

function CategoryCombobox({ selectedIds, onChange }: CategoryComboboxProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 450);
    return () => clearTimeout(t);
  }, [search]);

  // reinicializar al cambiar búsqueda
  useEffect(() => {
    setCategories([]);
    setPage(1);
    setTotalPages(1);
  }, [debouncedSearch]);

  // Fetch categories
  const fetchCategories = useCallback(
    async (pageNum: number, isLoadMore = false) => {
      if (isLoadMore) setLoadingMore(true);
      else setLoading(true);

      try {
        const params = new URLSearchParams({
          page: String(pageNum),
          take: String(CATEGORIES_PAGE_SIZE),
          ...(debouncedSearch && { q: debouncedSearch }),
        });

        const res = await fetch(`${API_URL}/categories?${params}`, {
          headers: { Accept: "application/json" },
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const json: CategoriesPaginatedResponse = await res.json();
        setTotalPages(json.totalPages);

        if (isLoadMore) {
          setCategories((prev) => [...prev, ...json.data]);
        } else {
          setCategories(json.data);
        }
      } catch (e) {
        console.error("Error fetching categories:", e);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [debouncedSearch]
  );

  // Fetch para página actual y búsqueda
  useEffect(() => {
    if (open) {
      fetchCategories(1, false);
    }
  }, [debouncedSearch, open, fetchCategories]);

  // Focus search when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => searchRef.current?.focus(), 50);
    } else {
      setSearch("");
    }
  }, [open]);

  // Scroll infinito para paginacion
  const handleListScroll = () => {
    const el = listRef.current;
    if (!el || loadingMore || page >= totalPages) return;
    const nearBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 40;
    if (nearBottom) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchCategories(nextPage, true);
    }
  };

  // Para que se cierre cuando das click afuera
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const toggle = (id: number) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((x) => x !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  const removeTag = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(selectedIds.filter((x) => x !== id));
  };

  // IDs seleccionados para mostrar en el trigger
  const selectedCategories = categories.filter((c) => selectedIds.includes(c.id));

  return (
    <div ref={containerRef} style={{ position: "relative" }}>
      {/* Trigger */}
      <div
        onClick={() => setOpen((v) => !v)}
        style={{
          minHeight: "42px",
          padding: "6px 36px 6px 10px",
          border: `1px solid ${open ? C.inputFocus : C.inputBorder}`,
          borderRadius: "8px",
          backgroundColor: C.cardBg,
          cursor: "pointer",
          display: "flex",
          flexWrap: "wrap",
          gap: "5px",
          alignItems: "center",
          position: "relative",
          transition: "border-color 0.15s",
          boxShadow: open ? `0 0 0 3px rgba(60,80,224,0.1)` : "none",
        }}
      >
        {selectedIds.length === 0 ? (
          <span style={{ fontSize: "14px", color: C.mutedText }}>
            Seleccionar categorías...
          </span>
        ) : (
          selectedCategories.map((cat) => (
            <span
              key={cat.id}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                padding: "2px 8px",
                backgroundColor: "#EEF2FF",
                color: C.primary,
                borderRadius: "6px",
                fontSize: "12px",
                fontWeight: 500,
                border: `1px solid #C7D2FE`,
              }}
            >
              {cat.name}
              <button
                onClick={(e) => removeTag(cat.id, e)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                  display: "flex",
                  color: "#818CF8",
                  marginLeft: "1px",
                }}
              >
                <X style={{ width: "10px", height: "10px" }} />
              </button>
            </span>
          ))
        )}
        <ChevronDown
          style={{
            position: "absolute",
            right: "10px",
            top: "50%",
            transform: `translateY(-50%) rotate(${open ? "180deg" : "0deg"})`,
            width: "15px",
            height: "15px",
            color: C.headText,
            transition: "transform 0.2s",
            flexShrink: 0,
          }}
        />
      </div>

      {/* Dropdown */}
      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            left: 0,
            right: 0,
            backgroundColor: C.cardBg,
            border: `1px solid ${C.cardBorder}`,
            borderRadius: "10px",
            boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
            zIndex: 100,
            overflow: "hidden",
          }}
        >
          {/* Search input */}
          <div
            style={{
              padding: "10px",
              borderBottom: `1px solid ${C.divider}`,
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <Search style={{ width: "14px", height: "14px", color: C.mutedText, flexShrink: 0 }} />
            <input
              ref={searchRef}
              type="text"
              placeholder="Buscar categoría..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                flex: 1,
                border: "none",
                outline: "none",
                fontSize: "13px",
                color: C.bodyText,
                backgroundColor: "transparent",
              }}
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                  display: "flex",
                  color: C.mutedText,
                }}
              >
                <X style={{ width: "13px", height: "13px" }} />
              </button>
            )}
          </div>

          {/* List */}
          <div
            ref={listRef}
            onScroll={handleListScroll}
            style={{
              maxHeight: "220px",
              overflowY: "auto",
            }}
          >
            {loading ? (
              <div
                style={{
                  padding: "20px",
                  textAlign: "center",
                  fontSize: "13px",
                  color: C.mutedText,
                }}
              >
                Cargando...
              </div>
            ) : categories.length === 0 ? (
              <div
                style={{
                  padding: "20px",
                  textAlign: "center",
                  fontSize: "13px",
                  color: C.mutedText,
                }}
              >
                No se encontraron categorías
              </div>
            ) : (
              <>
                {categories.map((cat) => {
                  const selected = selectedIds.includes(cat.id);
                  return (
                    <div
                      key={cat.id}
                      onClick={() => toggle(cat.id)}
                      style={{
                        padding: "9px 12px",
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        cursor: "pointer",
                        backgroundColor: selected ? "#EEF2FF" : "transparent",
                        transition: "background-color 0.1s",
                      }}
                      onMouseEnter={(e) => {
                        if (!selected)
                          (e.currentTarget as HTMLDivElement).style.backgroundColor = C.tableHead;
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLDivElement).style.backgroundColor = selected
                          ? "#EEF2FF"
                          : "transparent";
                      }}
                    >
                      <div
                        style={{
                          width: "16px",
                          height: "16px",
                          borderRadius: "4px",
                          border: `1.5px solid ${selected ? C.primary : C.grayBorder}`,
                          backgroundColor: selected ? C.primary : "transparent",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          transition: "all 0.15s",
                        }}
                      >
                        {selected && (
                          <Check
                            style={{ width: "10px", height: "10px", color: "#fff", strokeWidth: 3 }}
                          />
                        )}
                      </div>
                      <span
                        style={{
                          fontSize: "13px",
                          color: selected ? C.primary : C.bodyText,
                          fontWeight: selected ? 500 : 400,
                        }}
                      >
                        {cat.name}
                      </span>
                    </div>
                  );
                })}
                {loadingMore && (
                  <div
                    style={{
                      padding: "10px",
                      textAlign: "center",
                      fontSize: "12px",
                      color: C.mutedText,
                    }}
                  >
                    Cargando más...
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer info */}
          {selectedIds.length > 0 && (
            <div
              style={{
                padding: "8px 12px",
                borderTop: `1px solid ${C.divider}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span style={{ fontSize: "12px", color: C.mutedText }}>
                {selectedIds.length} seleccionada{selectedIds.length !== 1 ? "s" : ""}
              </span>
              <button
                onClick={() => onChange([])}
                style={{
                  fontSize: "12px",
                  color: C.danger,
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "2px 6px",
                  borderRadius: "4px",
                }}
              >
                Limpiar
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

//  ProductsPage 

export default function ProductsPage() {
  const [data, setData] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 0,
    companyId: "",
    state: true,
  });
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm), 550);
    return () => clearTimeout(t);
  }, [searchTerm]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

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

        const res = await fetch(`${API_URL}/products?${params}`, {
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
        alert("No se pudieron cargar los productos. Intenta de nuevo.");
      } finally {
        setLoading(false);
      }
    };

    cargar();
    return () => controller.abort();
  }, [currentPage, rowsPerPage, debouncedSearch, refreshKey]);

  const cambiarEstado = async (id: string, cur: boolean) => {
    const next = !cur;
    try {
      const res = await fetch(`${API_URL}/products/${id}/state/${next}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
      });
      if (res.ok) {
        setData((prev) =>
          prev.map((p) => (p.id === id ? { ...p, state: next } : p))
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  const borradoLogico = async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/products/${id}/delete`, {
        method: "PATCH",
      });
      if (!res.ok) throw new Error("No se pudo eliminar");

      setData((prev) => prev.filter((p) => p.id !== id));
      setTotal((prev) => prev - 1);
    } catch (e) {
      console.error(e);
      alert("No se pudo procesar la solicitud de borrado");
    }
  };

  const guardarProducto = async (e: React.FormEvent) => {
    e.preventDefault();

    const url = editingProduct
      ? `${API_URL}/products/${editingProduct.id}`
      : `${API_URL}/products`;
    const method = editingProduct ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          companyId: formData.companyId.trim() || null,
          categoryIds: selectedCategoryIds,
        }),
      });

      if (res.ok) {
        setIsModalOpen(false);
        setEditingProduct(null);
        setFormData({ name: "", description: "", price: 0, companyId: "", state: true });
        setSelectedCategoryIds([]);
        setRefreshKey((k) => k + 1);
        
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
    setEditingProduct(null);
    setFormData({ name: "", description: "", price: 0, companyId: "", state: true });
    setSelectedCategoryIds([]);
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || "",
      price: product.price,
      companyId: product.companyId || "",
      state: product.state,
    });
    setSelectedCategoryIds([]);
    setIsModalOpen(true);
  };

  const startIdx = total === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1;
  const endIdx = Math.min(currentPage * rowsPerPage, total);

  return (
    <main style={{ minHeight: "100vh", backgroundColor: C.pageBg, fontFamily: "inherit" }}>
      {/* Header */}
      <div
        style={{
          backgroundColor: C.cardBg,
          borderBottom: `1px solid ${C.cardBorder}`,
          padding: "20px 40px",
        }}
      >
        <p style={{ fontSize: "13px", color: C.mutedText, marginBottom: "4px" }}>
          Panel / <span style={{ color: C.primary }}>Productos</span>
        </p>
        <h1 style={{ fontSize: "24px", fontWeight: 700, color: C.bodyText, margin: 0 }}>
          Productos
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
            placeholder="Buscar producto..."
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
              onClick={() => setRefreshKey((k) => k + 1)}
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
              Nuevo Producto
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
          <div
            style={{
              padding: "16px 24px",
              borderBottom: `1px solid ${C.divider}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 600, color: C.bodyText }}>
              Lista de Productos
            </h3>
            <span style={{ fontSize: "13px", color: C.mutedText }}>
              {total} {total === 1 ? "resultado" : "resultados"}
            </span>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ backgroundColor: C.tableHead }}>
                  {["Nombre", "Descripción", "Precio", "Estado", "Acciones"].map((h) => (
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
                    <td colSpan={5} style={{ textAlign: "center", padding: "48px", color: C.mutedText, fontSize: "14px" }}>
                      Cargando productos...
                    </td>
                  </tr>
                ) : data.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: "center", padding: "48px", color: C.mutedText, fontSize: "14px" }}>
                      No se encontraron productos.
                    </td>
                  </tr>
                ) : (
                  data.map((product, i) => (
                    <tr
                      key={product.id}
                      style={{
                        borderBottom: i < data.length - 1 ? `1px solid ${C.divider}` : "none",
                      }}
                      className="group hover:bg-[#F9FAFB] transition-colors"
                    >
                      <td style={{ padding: "14px 20px", fontSize: "14px", fontWeight: 600, color: C.bodyText }}>
                        {product.name}
                      </td>
                      <td style={{ padding: "14px 20px", fontSize: "14px", color: C.headText, textAlign: "center", maxWidth: "280px" }}>
                        <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {product.description || (
                            <em style={{ color: C.mutedText, fontSize: "13px" }}>Sin descripción</em>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: "14px 20px", fontSize: "14px", fontWeight: 500, color: C.bodyText, textAlign: "center" }}>
                        ${product.price.toLocaleString("es-DO", { minimumFractionDigits: 2 })}
                      </td>
                      <td style={{ padding: "14px 20px", textAlign: "center" }}>
                        <button
                          onClick={() => cambiarEstado(product.id, product.state)}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "5px",
                            padding: "4px 12px",
                            borderRadius: "9999px",
                            fontSize: "12px",
                            fontWeight: 500,
                            cursor: "pointer",
                            border: `1px solid ${product.state ? C.greenBorder : C.grayBorder}`,
                            backgroundColor: product.state ? C.greenBg : C.grayBg,
                            color: product.state ? C.greenText : C.grayText,
                          }}
                          title={product.state ? "Click para desactivar" : "Click para activar"}
                        >
                          {product.state ? (
                            <>
                              <Check style={{ width: "11px", height: "11px", strokeWidth: 3 }} />
                              Activo
                            </>
                          ) : (
                            <>
                              <X style={{ width: "11px", height: "11px", strokeWidth: 3 }} />
                              Inactivo
                            </>
                          )}
                        </button>
                      </td>
                      <td style={{ padding: "14px 20px", textAlign: "center" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "4px" }}>
                          <button
                            onClick={() => openEditModal(product)}
                            title="Editar"
                            style={{
                              width: "34px", height: "34px",
                              display: "flex", alignItems: "center", justifyContent: "center",
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
                            onClick={() => borradoLogico(product.id)}
                            title="Eliminar"
                            style={{
                              width: "34px", height: "34px",
                              display: "flex", alignItems: "center", justifyContent: "center",
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
            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: C.headText }}>
              <span>Filas por página:</span>
              <select
                value={rowsPerPage}
                onChange={(e) => { setRowsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                style={{
                  height: "32px", padding: "0 8px",
                  border: `1px solid ${C.inputBorder}`, borderRadius: "6px",
                  fontSize: "13px", color: C.bodyText, backgroundColor: C.cardBg,
                  cursor: "pointer", outline: "none",
                }}
              >
                {[5, 10, 25, 50].map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <span style={{ fontSize: "13px", color: C.headText }}>
                {total === 0 ? "0–0" : `${startIdx}–${endIdx}`} de {total}
              </span>
              <div style={{ display: "flex", gap: "6px" }}>
                {[
                  { onClick: () => setCurrentPage((p) => Math.max(p - 1, 1)), disabled: currentPage === 1 || loading, Icon: ChevronLeft },
                  { onClick: () => setCurrentPage((p) => Math.min(p + 1, totalPages)), disabled: currentPage === totalPages || loading, Icon: ChevronRight },
                ].map(({ onClick, disabled, Icon }, i) => (
                  <button
                    key={i}
                    onClick={onClick}
                    disabled={disabled}
                    style={{
                      width: "32px", height: "32px",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      border: `1px solid ${C.inputBorder}`, borderRadius: "6px",
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
            position: "fixed", inset: 0,
            backgroundColor: "rgba(0,0,0,0.45)",
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 50, padding: "16px",
          }}
        >
          <div
            style={{
              backgroundColor: C.cardBg,
              width: "100%", maxWidth: "480px",
              borderRadius: "12px",
              border: `1px solid ${C.cardBorder}`,
              boxShadow: "0 20px 60px rgba(0,0,0,.15)",
              display: "flex", flexDirection: "column",
              maxHeight: "90vh", overflow: "hidden",
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: "20px 24px",
                borderBottom: `1px solid ${C.divider}`,
                display: "flex", alignItems: "flex-start", justifyContent: "space-between",
                flexShrink: 0,
              }}
            >
              <div>
                <h3 style={{ margin: "0 0 4px", fontSize: "17px", fontWeight: 700, color: C.bodyText }}>
                  {editingProduct ? "Editar Producto" : "Nuevo Producto"}
                </h3>
                <p style={{ margin: 0, fontSize: "13px", color: C.headText }}>
                  {editingProduct
                    ? "Modifica los atributos del producto."
                    : "Completa los campos para añadir un nuevo producto."}
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{
                  width: "30px", height: "30px",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  borderRadius: "6px", border: "none",
                  backgroundColor: "transparent", color: C.headText, cursor: "pointer",
                }}
              >
                <X style={{ width: "16px", height: "16px" }} />
              </button>
            </div>

            {/* Modal Form */}
            <form
              onSubmit={guardarProducto}
              style={{
                padding: "24px",
                display: "flex", flexDirection: "column", gap: "18px",
                overflowY: "auto",
              }}
            >
              {/* Nombre */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "13px", fontWeight: 600, color: C.bodyText }}>
                  Nombre <span style={{ color: C.danger }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Mouse Logitech M185"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{
                    height: "42px", padding: "0 14px",
                    border: `1px solid ${C.inputBorder}`, borderRadius: "8px",
                    fontSize: "14px", color: C.bodyText, backgroundColor: C.cardBg, outline: "none",
                  }}
                />
              </div>

              {/* Descripción */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "13px", fontWeight: 600, color: C.bodyText }}>
                  Descripción
                </label>
                <textarea
                  placeholder="Breve descripción del producto..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  style={{
                    height: "90px", padding: "10px 14px", resize: "none",
                    border: `1px solid ${C.inputBorder}`, borderRadius: "8px",
                    fontSize: "14px", color: C.bodyText, backgroundColor: C.cardBg, outline: "none",
                  }}
                />
              </div>

              {/* Precio */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "13px", fontWeight: 600, color: C.bodyText }}>
                  Precio <span style={{ color: C.danger }}>*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  placeholder="Ej. 999.99"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                  style={{
                    height: "42px", padding: "0 14px",
                    border: `1px solid ${C.inputBorder}`, borderRadius: "8px",
                    fontSize: "14px", color: C.bodyText, backgroundColor: C.cardBg, outline: "none",
                  }}
                />
              </div>

              {/* Company ID PROVICIONAL */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "13px", fontWeight: 600, color: C.bodyText }}>
                  Company ID
                </label>
                <input
                  type="text"
                  placeholder="POR AHORA ESTÁ ASI PERO LUEGO SE REGISTRARA AUTOMATICAMENTE)"
                  value={formData.companyId}
                  onChange={(e) => setFormData({ ...formData, companyId: e.target.value })}
                  style={{
                    height: "42px", padding: "0 14px",
                    border: `1px solid ${C.inputBorder}`, borderRadius: "8px",
                    fontSize: "14px", color: C.bodyText, backgroundColor: C.cardBg, outline: "none",
                  }}
                />
              </div>

              {/* Categorías */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "13px", fontWeight: 600, color: C.bodyText }}>
                  Categorías
                </label>
                <CategoryCombobox
                  selectedIds={selectedCategoryIds}
                  onChange={setSelectedCategoryIds}
                />
              </div>

              {/* Estado */}
              <div
                style={{
                  display: "flex", alignItems: "center", gap: "10px",
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
                  onChange={(e) => setFormData({ ...formData, state: e.target.checked })}
                  style={{ width: "16px", height: "16px", accentColor: C.primary, cursor: "pointer" }}
                />
                <label
                  htmlFor="modal-state"
                  style={{ fontSize: "13px", fontWeight: 500, color: C.bodyText, cursor: "pointer" }}
                >
                  Habilitar producto
                </label>
              </div>

              {/* Botones */}
              <div
                style={{
                  display: "flex", justifyContent: "flex-end", gap: "10px",
                  paddingTop: "6px",
                  borderTop: `1px solid ${C.divider}`,
                }}
              >
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    height: "40px", padding: "0 20px",
                    borderRadius: "8px",
                    border: `1px solid ${C.cardBorder}`,
                    backgroundColor: C.cardBg,
                    fontSize: "13px", fontWeight: 600, color: C.headText, cursor: "pointer",
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{
                    height: "40px", padding: "0 20px",
                    borderRadius: "8px", border: "none",
                    backgroundColor: C.primary,
                    fontSize: "13px", fontWeight: 600, color: "#fff", cursor: "pointer",
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
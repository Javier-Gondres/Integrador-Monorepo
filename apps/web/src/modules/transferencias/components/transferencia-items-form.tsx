import { ClipboardList, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

import { ERP_COLORS as C } from "@/constants/theme";

import type { ItemEnCarrito } from "../types/transferencia.types";

interface Producto {
  id: string;
  name: string;
  code: string;
}

interface Props {
  origenId: string;
  productos: Producto[];
  items: ItemEnCarrito[];
  notas: string;
  onItemsChange: (items: ItemEnCarrito[]) => void;
  onNotasChange: (notas: string) => void;
  fetchStock: (branchId: string, productId: string) => Promise<number>;
}

export function TransferenciaItemsForm({
  origenId,
  productos,
  items,
  notas,
  onItemsChange,
  onNotasChange,
  fetchStock,
}: Props) {
  const [selectedProductId, setSelectedProductId] = useState("");
  const [cantidadInput, setCantidadInput] = useState("");
  const [stockDisponible, setStockDisponible] = useState<number | null>(null);

  useEffect(() => {
    if (origenId && selectedProductId) {
      fetchStock(origenId, selectedProductId).then(setStockDisponible);
    } else {
      setStockDisponible(null);
    }
  }, [origenId, selectedProductId, fetchStock]);

  const selectedProduct = productos.find((p) => p.id === selectedProductId);
  const cantidadNum = parseFloat(cantidadInput);
  const isCantidadValid =
    !isNaN(cantidadNum) &&
    cantidadNum > 0 &&
    Number.isFinite(cantidadNum) &&
    Math.round(cantidadNum * 1000) / 1000 === cantidadNum;
  const isStockSufficient =
    stockDisponible !== null && cantidadNum <= stockDisponible;

  const canAdd =
    selectedProduct &&
    isCantidadValid &&
    isStockSufficient &&
    !items.find((i) => i.productId === selectedProductId);

  function handleAdd() {
    if (!canAdd || !selectedProduct) return;

    onItemsChange([
      ...items,
      {
        productId: selectedProduct.id,
        nombre: selectedProduct.name,
        sku: selectedProduct.code,
        cantidad: cantidadNum,
        stockDisponible: stockDisponible!,
      },
    ]);

    setSelectedProductId("");
    setCantidadInput("");
    setStockDisponible(null);
  }

  function handleRemove(productId: string) {
    onItemsChange(items.filter((i) => i.productId !== productId));
  }

  return (
    <div
      style={{
        background: C.cardBg,
        border: `1px solid ${C.cardBorder}`,
        borderRadius: 16,
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        gap: 20,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <ClipboardList size={16} color={C.mutedText} />
        <p
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: C.mutedText,
            margin: 0,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          Productos a transferir
        </p>
      </div>

      {/* Agregar producto */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 180px auto",
          gap: 12,
          alignItems: "end",
        }}
      >
        <Field label="Producto">
          <select
            value={selectedProductId}
            onChange={(e) => setSelectedProductId(e.target.value)}
            style={inputStyle}
            disabled={!origenId}
          >
            <option value="">Seleccionar producto…</option>
            {productos
              .filter((p) => !items.some((i) => i.productId === p.id)) // Ocultar ya agregados
              .map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} · {p.code}
                </option>
              ))}
          </select>
        </Field>

        <Field
          label={
            stockDisponible !== null
              ? `Cantidad (Stock: ${stockDisponible})`
              : "Cantidad"
          }
        >
          <input
            type="number"
            min={0.001}
            step={0.001}
            max={stockDisponible ?? undefined}
            placeholder="0"
            value={cantidadInput}
            onChange={(e) => setCantidadInput(e.target.value)}
            style={inputStyle}
            disabled={!selectedProductId}
          />
        </Field>

        <button
          onClick={handleAdd}
          disabled={!canAdd}
          style={{
            ...primaryBtn,
            opacity: canAdd ? 1 : 0.5,
            cursor: canAdd ? "pointer" : "not-allowed",
            height: 40,
          }}
        >
          <Plus size={16} />
          Agregar
        </button>
      </div>

      {/* Tabla de ítems */}
      {items.length > 0 && (
        <div
          style={{
            border: `1px solid ${C.cardBorder}`,
            borderRadius: 8,
            overflow: "hidden",
          }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr
                style={{
                  background: C.pageBg,
                  borderBottom: `1px solid ${C.cardBorder}`,
                }}
              >
                <th style={th}>Producto</th>
                <th style={{ ...th, textAlign: "right" }}>Stock Origen</th>
                <th style={{ ...th, textAlign: "right" }}>Cantidad</th>
                <th style={{ ...th, width: 40 }}></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr
                  key={item.productId}
                  style={{ borderBottom: `1px solid ${C.divider}` }}
                >
                  <td style={td}>
                    <div style={{ fontWeight: 500, color: C.bodyText }}>
                      {item.nombre}
                    </div>
                    <div style={{ fontSize: 12, color: C.mutedText }}>
                      {item.sku}
                    </div>
                  </td>
                  <td style={{ ...td, textAlign: "right", color: C.mutedText }}>
                    {item.stockDisponible}
                  </td>
                  <td
                    style={{
                      ...td,
                      textAlign: "right",
                      fontWeight: 600,
                      color: C.bodyText,
                    }}
                  >
                    {item.cantidad}
                  </td>
                  <td style={td}>
                    <button
                      onClick={() => handleRemove(item.productId)}
                      style={{
                        background: "none",
                        border: "none",
                        color: C.danger,
                        cursor: "pointer",
                        padding: 4,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Notas */}
      <Field label="Notas (opcional)">
        <textarea
          value={notas}
          onChange={(e) => onNotasChange(e.target.value)}
          placeholder="Ej. Transferencia urgente por quiebre de stock…"
          rows={2}
          style={{
            ...inputStyle,
            resize: "vertical",
            fontFamily: "inherit",
          }}
        />
      </Field>
    </div>
  );
}

// ── Helpers ─────────────────────────────────────────────────────────────

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: C.mutedText }}>
        {label}
      </label>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "9px 12px",
  borderRadius: 8,
  border: `1px solid ${C.inputBorder}`,
  fontSize: 14,
  color: C.bodyText,
  background: "#fff",
  outline: "none",
  boxSizing: "border-box",
  height: 40,
};

const primaryBtn: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 6,
  padding: "0 16px",
  borderRadius: 8,
  background: C.primary,
  color: "#fff",
  fontWeight: 600,
  fontSize: 14,
  border: "none",
};

const th: React.CSSProperties = {
  padding: "10px 14px",
  textAlign: "left",
  fontSize: 12,
  fontWeight: 600,
  color: C.mutedText,
};

const td: React.CSSProperties = {
  padding: "10px 14px",
  fontSize: 14,
};

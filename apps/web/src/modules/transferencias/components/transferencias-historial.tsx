import { ArrowRight, CheckCircle2, Truck, XCircle } from "lucide-react";

import { ERP_COLORS as C } from "@/constants/theme";
import { DataTable, DataTableColumn, DataTableToolbar } from "@/shared/data-table";

import type { Transferencia, TransferStatus } from "../types/transferencia.types";
import { ESTADO_COLORS, ESTADO_LABELS, formatRelative } from "../utils/format";

interface Props {
  transferencias: Transferencia[];
  total: number;
  currentPage: number;
  totalPages: number;
  rowsPerPage: number;
  loading: boolean;
  fetching: boolean;
  statusFilter?: TransferStatus;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rows: number) => void;
  onStatusFilterChange: (status: TransferStatus | undefined) => void;
  onRefresh: () => void;
  onDispatch: (id: string) => void;
  onComplete: (id: string) => void;
  onCancel: (id: string) => void;
  isMutating: boolean;
}

export function TransferenciasHistorial({
  transferencias,
  total,
  currentPage,
  totalPages,
  rowsPerPage,
  loading,
  fetching,
  statusFilter,
  onPageChange,
  onRowsPerPageChange,
  onStatusFilterChange,
  onRefresh,
  onDispatch,
  onComplete,
  onCancel,
  isMutating,
}: Props) {
  const columns: DataTableColumn<Transferencia>[] = [
    {
      id: "ruta",
      header: "Ruta",
      align: "left",
      cell: (t) => (
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 14,
              color: C.bodyText,
              flexWrap: "wrap",
            }}
          >
            <span style={{ fontWeight: 600 }}>{t.origenNombre}</span>
            <ArrowRight size={12} color={C.mutedText} />
            <span style={{ fontWeight: 600 }}>{t.destinoNombre}</span>
          </div>
          <span style={{ fontSize: 12, color: C.mutedText, display: "block", marginTop: 4 }}>
            ID: {t.id}
          </span>
        </div>
      ),
    },
    {
      id: "productos",
      header: "Productos",
      align: "left",
      cell: (t) => (
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {t.items.slice(0, 2).map((item) => (
            <div key={item.id} style={{ fontSize: 13, color: C.bodyText }}>
              <span style={{ fontWeight: 600 }}>{item.cantidad}x</span> {item.productoNombre}
            </div>
          ))}
          {t.items.length > 2 && (
            <div style={{ fontSize: 12, color: C.mutedText, fontStyle: "italic" }}>
              + {t.items.length - 2} items más
            </div>
          )}
        </div>
      ),
    },
    {
      id: "estado",
      header: "Estado",
      align: "center",
      cell: (t) => {
        const estado = ESTADO_COLORS[t.estado];
        return (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "4px 12px",
              borderRadius: 99,
              fontSize: 12,
              fontWeight: 600,
              background: estado.bg,
              color: estado.text,
              whiteSpace: "nowrap",
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: estado.dot,
                display: "inline-block",
              }}
            />
            {ESTADO_LABELS[t.estado]}
          </span>
        );
      },
    },
    {
      id: "fecha",
      header: "Creada",
      align: "right",
      cell: (t) => (
        <span style={{ color: C.mutedText, fontSize: 13 }}>
          {formatRelative(t.creadaEn)}
        </span>
      ),
    },
    {
      id: "acciones",
      header: "",
      align: "right",
      cell: (t) => (
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          {t.estado === "PENDING" && (
            <>
              <button
                onClick={() => onDispatch(t.id)}
                disabled={isMutating}
                title="Despachar"
                style={{ ...btnStyle, color: C.primary, background: "#e0e7ff" }}
              >
                <Truck size={15} />
              </button>
              <button
                onClick={() => onCancel(t.id)}
                disabled={isMutating}
                title="Cancelar"
                style={{ ...btnStyle, color: C.danger, background: C.dangerBg }}
              >
                <XCircle size={15} />
              </button>
            </>
          )}
          {t.estado === "IN_TRANSIT" && (
            <>
              <button
                onClick={() => onComplete(t.id)}
                disabled={isMutating}
                title="Completar (Mover stock)"
                style={{ ...btnStyle, color: C.greenText, background: C.greenBg }}
              >
                <CheckCircle2 size={15} />
              </button>
              <button
                onClick={() => onCancel(t.id)}
                disabled={isMutating}
                title="Cancelar"
                style={{ ...btnStyle, color: C.danger, background: C.dangerBg }}
              >
                <XCircle size={15} />
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ flex: 1 }}>
          <DataTableToolbar
            searchPlaceholder=""
            searchValue=""
            onSearchChange={() => {}} // Not implemented yet
            onRefresh={onRefresh}
            refreshing={fetching}
            createLabel=""
            onCreate={() => {}}
          />
        </div>
        <select
          value={statusFilter ?? ""}
          onChange={(e) => onStatusFilterChange(e.target.value ? (e.target.value as TransferStatus) : undefined)}
          style={{
            padding: "8px 12px",
            borderRadius: 8,
            border: `1px solid ${C.cardBorder}`,
            fontSize: 13,
            color: C.bodyText,
            background: "#fff",
            outline: "none",
          }}
        >
          <option value="">Todos los estados</option>
          <option value="PENDING">Pendientes</option>
          <option value="IN_TRANSIT">En Tránsito</option>
          <option value="COMPLETED">Completadas</option>
          <option value="CANCELLED">Canceladas</option>
        </select>
      </div>

      <DataTable
        title="Historial de Transferencias"
        columns={columns}
        data={transferencias}
        loading={loading}
        loadingMessage="Cargando transferencias..."
        emptyMessage="No hay transferencias registradas aún."
        total={total}
        getRowKey={(t) => t.id}
        pagination={{
          total,
          currentPage,
          totalPages,
          rowsPerPage,
          loading: fetching,
        }}
        onPageChange={onPageChange}
        onRowsPerPageChange={onRowsPerPageChange}
      />
    </div>
  );
}

const btnStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: 32,
  height: 32,
  borderRadius: 8,
  border: "none",
  cursor: "pointer",
  transition: "opacity 0.2s",
};

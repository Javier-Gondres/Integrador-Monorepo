import { Search } from "lucide-react";

import type { Supplier } from "@/modules/suppliers/types/supplier.types";

import {
  supplierAvatarColor,
  supplierInitials,
} from "../utils/supplier-avatar";
import styles from "./supplier-catalog.module.css";

interface SupplierRailProps {
  suppliers: Supplier[];
  selectedId: string | null;
  search: string;
  loading: boolean;
  onSearchChange: (value: string) => void;
  onSelect: (supplier: Supplier) => void;
}

export function SupplierRail({
  suppliers,
  selectedId,
  search,
  loading,
  onSearchChange,
  onSelect,
}: SupplierRailProps) {
  return (
    <div className={styles.rail}>
      <div className={styles.railHead}>
        <div className={styles.search}>
          <Search />
          <input
            className={styles.searchInput}
            placeholder="Buscar proveedor…"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>

      <div className={styles.railList}>
        <div className={styles.railTitle}>Proveedores · {suppliers.length}</div>

        {loading && suppliers.length === 0 ? (
          <div className={styles.railEmpty}>Cargando…</div>
        ) : suppliers.length === 0 ? (
          <div className={styles.railEmpty}>Sin resultados.</div>
        ) : (
          suppliers.map((supplier) => {
            const active = supplier.id === selectedId;
            return (
              <button
                key={supplier.id}
                type="button"
                className={`${styles.supItem} ${active ? styles.supItemActive : ""}`}
                onClick={() => onSelect(supplier)}
              >
                <div
                  className={styles.avatar}
                  style={{ background: supplierAvatarColor(supplier.id) }}
                >
                  {supplierInitials(supplier.name)}
                </div>
                <div className={styles.meta}>
                  <div className={styles.supName}>{supplier.name}</div>
                  <div className={styles.supContact}>
                    {supplier.contactName ?? "Sin contacto"}
                  </div>
                </div>
                <div className={styles.count}>{supplier.productsCount}</div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

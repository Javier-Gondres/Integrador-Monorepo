import { Permission } from "@repo/shared";
import { Plus, Search } from "lucide-react";

import type { Supplier } from "@/modules/suppliers/types/supplier.types";
import { Button } from "@/shared/ui/button";
import { Can } from "@/shared/ui/can";

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
  onCreateSupplier: () => void;
}

export function SupplierRail({
  suppliers,
  selectedId,
  search,
  loading,
  onSearchChange,
  onSelect,
  onCreateSupplier,
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

        <Can permission={Permission.SUPPLIERS_CREATE}>
          <Button
            variant="secondary"
            onClick={onCreateSupplier}
            style={{ width: "100%" }}
          >
            <Plus style={{ width: "16px", height: "16px" }} />
            Nuevo proveedor
          </Button>
        </Can>
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

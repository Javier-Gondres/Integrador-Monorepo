"use client";

import { useCallback, useState } from "react";

import { ERP_COLORS as C } from "@/constants/theme";
import type { Supplier } from "@/modules/suppliers/types/supplier.types";

import styles from "../components/supplier-catalog.module.css";
import { SupplierCatalogDetailContainer } from "../containers/supplier-catalog-detail-container";
import { SupplierRailContainer } from "../containers/supplier-rail-container";

export function SupplierCatalogScreen() {
  const [selected, setSelected] = useState<Supplier | null>(null);
  const handleSelect = useCallback((supplier: Supplier) => {
    setSelected(supplier);
  }, []);

  return (
    <div
      className={styles.page}
      style={{ minHeight: "100%", background: C.pageBg }}
    >
      <div className={styles.top}>
        <div className={styles.crumbs}>
          <span>Panel</span>
          <span className={styles.sep}>/</span>
          <span>Proveedores</span>
          <span className={styles.sep}>/</span>
          <span className={styles.here}>Catálogo</span>
        </div>
        <div className={styles.title}>Catálogo de Proveedores</div>
        <div className={styles.sub}>
          Administra los productos que ofrece cada proveedor.
        </div>
      </div>

      <div className={styles.body}>
        <div className={styles.card}>
          <div className={styles.split}>
            <SupplierRailContainer
              selectedId={selected?.id ?? null}
              onSelect={handleSelect}
            />
            {selected ? (
              <SupplierCatalogDetailContainer
                key={selected.id}
                supplier={selected}
              />
            ) : (
              <div className={styles.empty}>
                <div className={styles.emptyBig}>Selecciona un proveedor</div>
                <div>Elige un proveedor de la lista para ver su catálogo.</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

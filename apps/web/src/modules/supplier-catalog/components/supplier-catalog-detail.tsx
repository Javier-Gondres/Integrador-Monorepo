import { Permission } from "@repo/shared";
import {
  IdCard,
  Mail,
  Package,
  PackagePlus,
  Phone,
  Plus,
  Search,
} from "lucide-react";

import type { Supplier } from "@/modules/suppliers/types/supplier.types";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Can } from "@/shared/ui/can";
import { StatusToggle } from "@/shared/ui/status-toggle";

import type { SupplierProduct } from "../types/supplier-product.types";
import { formatCurrency } from "../utils/format-currency";
import {
  supplierAvatarColor,
  supplierInitials,
} from "../utils/supplier-avatar";
import styles from "./supplier-catalog.module.css";

interface SupplierCatalogDetailProps {
  supplier: Supplier;
  products: SupplierProduct[];
  loading: boolean;
  search: string;
  onSearchChange: (value: string) => void;
  onAssignClick: () => void;
  onCreateProductClick: () => void;
  onToggleStatus: (product: SupplierProduct) => void;
}

export function SupplierCatalogDetail({
  supplier,
  products,
  loading,
  search,
  onSearchChange,
  onAssignClick,
  onCreateProductClick,
  onToggleStatus,
}: SupplierCatalogDetailProps) {
  const isSearching = search.trim().length > 0;

  return (
    <div className={styles.detail}>
      <div className={styles.detailHead}>
        <div
          className={`${styles.avatar} ${styles.detailAvatar}`}
          style={{ background: supplierAvatarColor(supplier.id) }}
        >
          {supplierInitials(supplier.name)}
        </div>
        <div className={styles.hMeta}>
          <div className={styles.hName}>
            {supplier.name}
            {supplier.isActive ? (
              <Badge variant="success">Activo</Badge>
            ) : (
              <Badge variant="muted">Inactivo</Badge>
            )}
          </div>
          <div className={styles.chips}>
            <span className={styles.chip}>
              <Mail />
              {supplier.email ?? "Sin correo"}
            </span>
            <span className={styles.chip}>
              <Phone />
              {supplier.phone ?? "Sin teléfono"}
            </span>
            <span className={styles.chip}>
              <IdCard />
              RNC {supplier.rnc ?? "—"}
            </span>
          </div>
        </div>
      </div>

      <div className={styles.detailToolbar}>
        <div className={styles.prodSearch}>
          <Search />
          <input
            className={styles.prodSearchInput}
            placeholder="Buscar en el catálogo…"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <div className={styles.toolbarActions}>
          <Can permission={Permission.SUPPLIERS_CREATE}>
            <Can permission={Permission.PRODUCTS_CREATE}>
              <Button variant="secondary" onClick={onCreateProductClick}>
                <PackagePlus style={{ width: "16px", height: "16px" }} />
                Nuevo producto
              </Button>
            </Can>
            <Button onClick={onAssignClick}>
              <Plus style={{ width: "16px", height: "16px" }} />
              Asignar producto
            </Button>
          </Can>
        </div>
      </div>

      {loading ? (
        <div className={styles.loading}>Cargando catálogo…</div>
      ) : products.length > 0 ? (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Código</th>
              <th>Producto</th>
              <th className={styles.right}>Último costo</th>
              <th className={styles.center}>Estado</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.productId}>
                <td className={styles.tCode}>{product.code}</td>
                <td>
                  <div className={styles.tProd}>
                    <span className={styles.tDot}>
                      <Package />
                    </span>
                    <div>
                      <div className={styles.tName}>{product.name}</div>
                      <div className={styles.tDesc}>
                        {product.description ?? "Sin descripción"}
                      </div>
                    </div>
                  </div>
                </td>
                <td className={`${styles.right} ${styles.tPrice}`}>
                  {product.lastCost !== null
                    ? formatCurrency(product.lastCost)
                    : "—"}
                </td>
                <td className={styles.center}>
                  <Can permission={Permission.SUPPLIERS_UPDATE}>
                    <StatusToggle
                      isActive={product.isActive}
                      onToggle={() => onToggleStatus(product)}
                    />
                  </Can>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className={styles.empty}>
          <div className={styles.emptyBig}>
            {isSearching
              ? "Sin coincidencias"
              : "Este proveedor no tiene productos asignados"}
          </div>
          <div>
            {isSearching
              ? "Prueba con otro término de búsqueda."
              : "Usa “Asignar producto” para vincular uno existente o “Nuevo producto” para crearlo."}
          </div>
        </div>
      )}
    </div>
  );
}

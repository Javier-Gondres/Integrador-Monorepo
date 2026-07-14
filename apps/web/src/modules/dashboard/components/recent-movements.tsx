import React from "react";

import styles from "./recent-movements.module.css";

interface MovementItem {
  id: string;
  productName: string;
  productCode: string;
  type: string;
  quantity: number;
  referenceNumber: string | null;
  notes: string | null;
  createdAt: string;
  performedBy: string;
}

interface RecentMovementsProps {
  movements: MovementItem[];
  isLoading: boolean;
}

const typeLabels: Record<string, { label: string; colorClass: string }> = {
  SALE: { label: "Venta", colorClass: styles.sale ?? "" },
  PURCHASE: { label: "Compra", colorClass: styles.purchase ?? "" },
  RETURN: { label: "Devolución", colorClass: styles.return ?? "" },
  ADJUSTMENT: { label: "Ajuste", colorClass: styles.adjustment ?? "" },
  TRANSFER_IN: { label: "Entrada Transf.", colorClass: styles.transfer ?? "" },
  TRANSFER_OUT: { label: "Salida Transf.", colorClass: styles.transfer ?? "" },
  WASTE: { label: "Merma", colorClass: styles.waste ?? "" },
};

export function RecentMovementsList({
  movements,
  isLoading,
}: RecentMovementsProps) {
  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.skeletonTitle}></div>
        </div>
        <div className={styles.list}>
          {[1, 2, 3].map((i) => (
            <div key={i} className={styles.skeletonRow}></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>Actividad e Inventario Reciente</h3>
        <p className={styles.subtitle}>
          Últimos movimientos registrados en sucursal
        </p>
      </div>

      <div className={styles.list}>
        {movements.length === 0 ? (
          <p className={styles.noData}>No hay actividad registrada</p>
        ) : (
          movements.map((mv) => {
            const config = typeLabels[mv.type] || {
              label: mv.type,
              colorClass: "",
            };
            const formattedDate = new Date(mv.createdAt).toLocaleDateString(
              "es-DO",
              {
                day: "numeric",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              },
            );

            return (
              <div key={mv.id} className={styles.row}>
                <div className={styles.left}>
                  <span className={`${styles.badge} ${config.colorClass}`}>
                    {config.label}
                  </span>
                  <div className={styles.productInfo}>
                    <p className={styles.productName}>{mv.productName}</p>
                    <p className={styles.productCode}>{mv.productCode}</p>
                  </div>
                </div>
                <div className={styles.right}>
                  <div className={styles.metaInfo}>
                    <span className={styles.qty}>
                      {mv.quantity > 0 ? "+" : ""}
                      {mv.quantity} uds.
                    </span>
                    <span className={styles.author}>{mv.performedBy}</span>
                  </div>
                  <span className={styles.date}>{formattedDate}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

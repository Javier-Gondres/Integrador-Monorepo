import React, { useState } from "react";

import styles from "./dashboard-charts.module.css";

interface ComparisonItem {
  date: string;
  sales: number;
  purchases: number;
}

interface CategoryItem {
  name: string;
  value: number;
}

interface ProductItem {
  id: string;
  name: string;
  quantity: number;
  total: number;
  categories: string[];
}

interface ChartsProps {
  comparisonData: ComparisonItem[];
  categoryData: CategoryItem[];
  topProducts: ProductItem[];
  isLoading: boolean;
  onDaysChange: (days: number) => void;
  selectedDays: number;
}

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat("es-DO", {
    style: "currency",
    currency: "DOP",
    maximumFractionDigits: 0,
  }).format(val);
};

export function DashboardCharts({
  comparisonData,
  categoryData,
  topProducts,
  isLoading,
  onDaysChange,
  selectedDays,
}: ChartsProps) {
  const [showSales, setShowSales] = useState(true);
  const [showPurchases, setShowPurchases] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [hoveredBar, setHoveredBar] = useState<{
    index: number;
    type: "sales" | "purchases";
  } | null>(null);

  if (isLoading) {
    return (
      <div className={styles.chartsGrid}>
        <div className={`${styles.chartCard} ${styles.skeletonCard}`}>
          <div className={styles.skeletonHeader}></div>
          <div className={styles.skeletonPlot}></div>
        </div>
        <div className={`${styles.chartCard} ${styles.skeletonCard}`}>
          <div className={styles.skeletonHeader}></div>
          <div className={styles.skeletonPlot}></div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // Sales vs Purchases Chart Math (SVG Based)
  // ----------------------------------------------------
  const maxVal = Math.max(
    ...comparisonData.map((d) =>
      Math.max(showSales ? d.sales : 0, showPurchases ? d.purchases : 0, 100),
    ),
  );

  const chartHeight = 220;
  const paddingBottom = 30;
  const paddingTop = 20;
  const plotHeight = chartHeight - paddingTop - paddingBottom;

  // ----------------------------------------------------
  // Category & Products Interaction
  // ----------------------------------------------------
  // Default to first category if none selected
  const activeCategory = selectedCategory || categoryData[0]?.name || null;
  const filteredProducts = activeCategory
    ? topProducts
        .filter((p) => p.categories.includes(activeCategory))
        .slice(0, 3)
    : topProducts.slice(0, 3);

  // Donut chart segments helper
  const totalCategoryVal =
    categoryData.reduce((acc, curr) => acc + curr.value, 0) || 1;
  const donutColors = [
    "#10b981",
    "#3b82f6",
    "#f59e0b",
    "#ec4899",
    "#8b5cf6",
    "#64748b",
  ];

  let accumulatedAngle = 0;
  const donutRadius = 60;
  const donutCircumference = 2 * Math.PI * donutRadius;
  const donutCenter = 80;

  return (
    <div className={styles.chartsGrid}>
      {/* 1. COMPARISON CHART (Sales vs Purchases) */}
      <div className={styles.chartCard}>
        <div className={styles.chartHeader}>
          <div>
            <h3 className={styles.chartTitle}>Ventas vs Compras</h3>
            <p className={styles.chartDescription}>
              Comparativa de ingresos y gastos operativos del periodo
            </p>
          </div>
          <div className={styles.periodToggles}>
            {[7, 15, 30].map((days) => (
              <button
                key={days}
                onClick={() => onDaysChange(days)}
                className={`${styles.periodBtn} ${selectedDays === days ? styles.periodBtnActive : ""}`}
              >
                {days}d
              </button>
            ))}
          </div>
        </div>

        {/* Legend / Toggles */}
        <div className={styles.legendContainer}>
          <button
            onClick={() => setShowSales(!showSales)}
            className={`${styles.legendItem} ${!showSales ? styles.legendDisabled : ""}`}
          >
            <span className={`${styles.legendDot} ${styles.salesDot}`}></span>
            <span className={styles.legendText}>Ventas</span>
          </button>
          <button
            onClick={() => setShowPurchases(!showPurchases)}
            className={`${styles.legendItem} ${!showPurchases ? styles.legendDisabled : ""}`}
          >
            <span
              className={`${styles.legendDot} ${styles.purchasesDot}`}
            ></span>
            <span className={styles.legendText}>Compras</span>
          </button>
        </div>

        {/* Plot Area */}
        <div className={styles.plotContainer}>
          <div className={styles.barChart}>
            {comparisonData.map((d, index) => {
              const salesHeight = showSales
                ? (d.sales / maxVal) * plotHeight
                : 0;
              const purchasesHeight = showPurchases
                ? (d.purchases / maxVal) * plotHeight
                : 0;

              // Format date label (e.g. 12 Jul)
              const dateObj = new Date(d.date + "T00:00:00");
              const label = dateObj.toLocaleDateString("es-DO", {
                day: "numeric",
                month: "short",
              });

              return (
                <div key={d.date} className={styles.chartCol}>
                  <div
                    className={styles.barGroup}
                    style={{ height: `${plotHeight}px` }}
                  >
                    {showSales && (
                      <div
                        className={`${styles.bar} ${styles.salesBar}`}
                        style={{ height: `${Math.max(salesHeight, 3)}px` }}
                        onMouseEnter={() =>
                          setHoveredBar({ index, type: "sales" })
                        }
                        onMouseLeave={() => setHoveredBar(null)}
                      >
                        {hoveredBar?.index === index &&
                          hoveredBar?.type === "sales" && (
                            <div className={styles.tooltip}>
                              <p className={styles.tooltipDate}>{label}</p>
                              <p className={styles.tooltipValue}>
                                Venta: {formatCurrency(d.sales)}
                              </p>
                            </div>
                          )}
                      </div>
                    )}
                    {showPurchases && (
                      <div
                        className={`${styles.bar} ${styles.purchasesBar}`}
                        style={{ height: `${Math.max(purchasesHeight, 3)}px` }}
                        onMouseEnter={() =>
                          setHoveredBar({ index, type: "purchases" })
                        }
                        onMouseLeave={() => setHoveredBar(null)}
                      >
                        {hoveredBar?.index === index &&
                          hoveredBar?.type === "purchases" && (
                            <div className={styles.tooltip}>
                              <p className={styles.tooltipDate}>{label}</p>
                              <p className={styles.tooltipValue}>
                                Compra: {formatCurrency(d.purchases)}
                              </p>
                            </div>
                          )}
                      </div>
                    )}
                  </div>
                  <span className={styles.colLabel}>{label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. INTERACTIVE CATEGORY DISTRIBUTION & TOP PRODUCTS */}
      <div className={styles.chartCard}>
        <div className={styles.chartHeader}>
          <div>
            <h3 className={styles.chartTitle}>Desglose por Categoría</h3>
            <p className={styles.chartDescription}>
              Selecciona una categoría para ver sus productos estrella
            </p>
          </div>
        </div>

        <div className={styles.categoryContent}>
          {/* Interactive Donut / List */}
          <div className={styles.donutSection}>
            {categoryData.length === 0 ? (
              <p className={styles.noData}>No hay datos en el periodo</p>
            ) : (
              <div className={styles.donutWrapper}>
                <svg width="160" height="160" viewBox="0 0 160 160">
                  {categoryData.map((cat, i) => {
                    const percentage = cat.value / totalCategoryVal;
                    const strokeDasharray = `${percentage * donutCircumference} ${donutCircumference}`;
                    const strokeDashoffset =
                      -accumulatedAngle * donutCircumference;
                    accumulatedAngle += percentage;

                    const color = donutColors[i % donutColors.length];
                    const isSelected = activeCategory === cat.name;

                    return (
                      <circle
                        key={cat.name}
                        cx={donutCenter}
                        cy={donutCenter}
                        r={donutRadius}
                        fill="transparent"
                        stroke={color}
                        strokeWidth={isSelected ? 18 : 12}
                        strokeDasharray={strokeDasharray}
                        strokeDashoffset={strokeDashoffset}
                        onClick={() => setSelectedCategory(cat.name)}
                        className={styles.donutSegment}
                        style={{ transformOrigin: "center" }}
                      />
                    );
                  })}
                  <circle
                    cx={donutCenter}
                    cy={donutCenter}
                    r={donutRadius - 8}
                    fill="white"
                  />
                  <text
                    x={donutCenter}
                    y={donutCenter + 5}
                    textAnchor="middle"
                    className={styles.donutText}
                  >
                    Categorías
                  </text>
                </svg>
              </div>
            )}

            <div className={styles.categoryList}>
              {categoryData.slice(0, 4).map((cat, i) => {
                const color = donutColors[i % donutColors.length];
                const isSelected = activeCategory === cat.name;

                return (
                  <button
                    key={cat.name}
                    onClick={() => setSelectedCategory(cat.name)}
                    className={`${styles.categoryListItem} ${isSelected ? styles.categoryListItemActive : ""}`}
                  >
                    <span className={styles.categoryNameContainer}>
                      <span
                        className={styles.categoryDot}
                        style={{ backgroundColor: color }}
                      ></span>
                      <span className={styles.categoryListName}>
                        {cat.name}
                      </span>
                    </span>
                    <span className={styles.categoryListVal}>
                      {formatCurrency(cat.value)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Interactive side-panel showing details of selected Category */}
          <div className={styles.categoryProductsPanel}>
            <div className={styles.panelHeader}>
              <h4 className={styles.panelTitle}>
                Top en <span>{activeCategory || "Todo"}</span>
              </h4>
            </div>

            <div className={styles.panelList}>
              {filteredProducts.length === 0 ? (
                <p className={styles.noData}>No hay ventas de esta categoría</p>
              ) : (
                filteredProducts.map((p, index) => (
                  <div key={p.id} className={styles.prodItem}>
                    <div className={styles.prodInfo}>
                      <span className={styles.prodRank}>#{index + 1}</span>
                      <span className={styles.prodName}>{p.name}</span>
                    </div>
                    <div className={styles.prodMeta}>
                      <span className={styles.prodQty}>{p.quantity} uds.</span>
                      <span className={styles.prodTotal}>
                        {formatCurrency(p.total)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

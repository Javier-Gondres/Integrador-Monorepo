"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { useSupplierProducts } from "@/modules/supplier-catalog/hooks/use-supplier-products";
import type { SupplierProduct } from "@/modules/supplier-catalog/types/supplier-product.types";
import { useSuppliers } from "@/modules/suppliers/hooks/use-suppliers";

import { OrderPanel } from "../components/order-panel";
import { ProductList } from "../components/product-list";
import { SupplierRail } from "../components/supplier-rail";
import { useCreatePurchase } from "../hooks/use-create-purchase";
import { usePurchaseOrder } from "../hooks/use-purchase-order";

interface PurchaseOrderContainerProps {
  branchId: string | null;
}

export function PurchaseOrderContainer({
  branchId,
}: PurchaseOrderContainerProps) {
  const [selectedSupplierId, setSelectedSupplierId] = useState<string | null>(
    null,
  );
  const [supplierSearch, setSupplierSearch] = useState("");
  const [productSearch, setProductSearch] = useState("");

  const order = usePurchaseOrder();
  const createPurchase = useCreatePurchase();

  const { data: suppliersData, isLoading: suppliersLoading } = useSuppliers({
    take: 100,
  });
  const suppliers = useMemo(() => suppliersData?.items ?? [], [suppliersData]);

  const { data: productsData, isLoading: productsLoading } =
    useSupplierProducts(selectedSupplierId, { take: 100 });

  // Selecciona el primer proveedor disponible cuando aún no hay selección.
  useEffect(() => {
    if (selectedSupplierId) return;
    const first = suppliers[0]?.id ?? null;
    if (first) setSelectedSupplierId(first);
  }, [suppliers, selectedSupplierId]);

  // Estricto: cambiar de sucursal vacía la orden en progreso.
  useEffect(() => {
    order.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [branchId]);

  const selectedSupplier =
    suppliers.find((supplier) => supplier.id === selectedSupplierId) ?? null;

  const visibleSuppliers = suppliers.filter((supplier) => {
    const q = supplierSearch.trim().toLowerCase();
    if (!q) return true;
    return (
      supplier.name.toLowerCase().includes(q) ||
      (supplier.contactName ?? "").toLowerCase().includes(q)
    );
  });

  const supplierProducts = (productsData?.items ?? []).filter(
    (product) => product.isActive && product.productIsActive,
  );
  const visibleProducts = supplierProducts.filter((product) => {
    const q = productSearch.trim().toLowerCase();
    if (!q) return true;
    return (
      product.name.toLowerCase().includes(q) ||
      product.code.toLowerCase().includes(q)
    );
  });

  const orderedQty: Record<string, number> = {};
  for (const [id, line] of Object.entries(order.lines)) {
    orderedQty[id] = line.quantity;
  }

  function handleSelectSupplier(id: string) {
    if (id === selectedSupplierId) return;
    setSelectedSupplierId(id);
    setProductSearch("");
    order.reset(); // una orden = un proveedor
  }

  function handleAdd(product: SupplierProduct) {
    const unitCost = product.lastCost ?? product.price;
    order.add(
      {
        id: product.productId,
        code: product.code,
        name: product.name,
        price: product.price,
      },
      unitCost,
    );
  }

  async function handleConfirm() {
    if (!branchId) {
      toast.error("Selecciona una sucursal");
      return;
    }
    if (!selectedSupplierId || order.productIds.length === 0) return;

    const items = Object.values(order.lines).map((line) => ({
      productId: line.product.id,
      quantity: line.quantity,
      unitCost: line.unitCost,
    }));

    try {
      await createPurchase.mutateAsync({
        branchId,
        supplierId: selectedSupplierId,
        items,
      });
      toast.success(
        `Compra registrada a ${selectedSupplier?.name ?? "proveedor"} · ${items.length} ${
          items.length === 1 ? "producto" : "productos"
        }`,
      );
      order.reset();
    } catch {
      // El error ya se notifica en el hook (useCreatePurchase).
    }
  }

  return (
    <div className="grid h-[calc(100vh-13rem)] grid-cols-[300px_1fr_360px] overflow-hidden rounded-xl border border-card-border bg-white shadow-sm max-[1100px]:grid-cols-[260px_1fr_340px]">
      <SupplierRail
        suppliers={visibleSuppliers}
        selectedId={selectedSupplierId}
        onSelect={handleSelectSupplier}
        search={supplierSearch}
        onSearchChange={setSupplierSearch}
        loading={suppliersLoading}
      />
      <ProductList
        supplierName={selectedSupplier?.name ?? null}
        products={visibleProducts}
        orderedQty={orderedQty}
        search={productSearch}
        onSearchChange={setProductSearch}
        onAdd={handleAdd}
        loading={Boolean(selectedSupplierId) && productsLoading}
      />
      <OrderPanel
        lines={order.lines}
        productIds={order.productIds}
        subtotal={order.subtotal}
        itbis={order.itbis}
        total={order.total}
        totalUnits={order.totalUnits}
        supplierName={selectedSupplier?.name ?? null}
        onSetQuantity={order.setQuantity}
        onSetUnitCost={order.setUnitCost}
        onRemove={order.remove}
        onClear={order.reset}
        onConfirm={handleConfirm}
        submitting={createPurchase.isPending}
      />
    </div>
  );
}

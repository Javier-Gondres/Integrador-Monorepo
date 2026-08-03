"use client";

import { Permission } from "@repo/shared";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/api/errors";
import { usePermissions } from "@/modules/auth/hooks/use-permissions";
import { CustomerFormModalContainer } from "@/modules/customers/containers/customer-form-modal-container";
import { useCustomers } from "@/modules/customers/hooks/use-customers";
import type { Customer } from "@/modules/customers/types/customer.types";
import { printInvoiceReceipt } from "@/modules/invoice-print/utils/print-invoice";
import { useDebouncedValue } from "@/shared/hooks/use-debounced-value";
import { Modal } from "@/shared/ui/modal";

import { ClientCard } from "../components/client-card";
import { ProductPicker } from "../components/product-picker";
import { SaleConfirmModal } from "../components/sale-confirm-modal";
import { SaleDateModal } from "../components/sale-date-modal";
import { SaleDetail } from "../components/sale-detail";
import { useCreateSale } from "../hooks/use-create-sale";
import { useCustomerCreditNotes } from "../hooks/use-customer-credit-notes";
import { round2, useSale } from "../hooks/use-sale";
import { useSaleProducts } from "../hooks/use-sale-products";
import type { PaymentMethod } from "../types/sale.types";
import { localToday, saleDayToIso } from "../utils/format";

const PAYMENT_METHOD_MAP: Record<string, PaymentMethod> = {
  contado: "CASH",
  tarjeta: "CARD",
  credito: "CREDIT",
};

const ALL_CATEGORIES = "Todos";

interface SaleScreenContainerProps {
  branchId: string | null;
  hasOpenShift: boolean;
}

export function SaleScreenContainer({
  branchId,
  hasOpenShift,
}: SaleScreenContainerProps) {
  const order = useSale();
  const createSale = useCreateSale();
  const { can } = usePermissions();
  const canBackdate = can(Permission.SALES_BACKDATE);

  const [productSearch, setProductSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState(ALL_CATEGORIES);
  const [customerSearch, setCustomerSearch] = useState("");
  const [showProductPicker, setShowProductPicker] = useState(false);
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [showDateModal, setShowDateModal] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const debouncedProductSearch = useDebouncedValue(productSearch);
  const debouncedCustomerSearch = useDebouncedValue(customerSearch);

  const { data: productsData, isLoading: productsLoading } = useSaleProducts(
    branchId,
    debouncedProductSearch,
    null,
  );
  const products = useMemo(() => productsData?.items ?? [], [productsData]);

  const { data: customersData, isLoading: customersLoading } = useCustomers({
    search: debouncedCustomerSearch.trim() || undefined,
    take: 20,
    isActive: true,
  });

  const customerId = order.customer?.id ?? null;
  const { data: creditNotesData, isLoading: creditNotesLoading } =
    useCustomerCreditNotes(customerId);
  const creditNotes = useMemo(
    () => creditNotesData?.items ?? [],
    [creditNotesData],
  );

  // Vaciar la venta al cambiar de sucursal.
  useEffect(() => {
    order.reset();
    setProductSearch("");
    setActiveCategory(ALL_CATEGORIES);
    setCustomerSearch("");
    setShowProductPicker(false);
    setShowCustomerForm(false);
    setShowDateModal(false);
    setShowConfirm(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [branchId]);

  const categories = useMemo(() => {
    const names = new Set<string>();
    for (const product of products) {
      for (const category of product.categories) {
        names.add(category.name);
      }
    }
    return [ALL_CATEGORIES, ...[...names].sort((a, b) => a.localeCompare(b))];
  }, [products]);

  const visibleProducts = useMemo(() => {
    if (activeCategory === ALL_CATEGORIES) return products;
    return products.filter((product) =>
      product.categories.some((category) => category.name === activeCategory),
    );
  }, [products, activeCategory]);

  const cartQty = useMemo(() => {
    const map: Record<string, number> = {};
    for (const [id, line] of Object.entries(order.lines)) {
      map[id] = line.quantity;
    }
    return map;
  }, [order.lines]);

  const creditApplied = useMemo(
    () =>
      round2(
        creditNotes
          .filter((note) => order.selectedCreditNoteIds.includes(note.id))
          .reduce((sum, note) => sum + note.amount, 0),
      ),
    [creditNotes, order.selectedCreditNoteIds],
  );
  const amountPayable = Math.max(0, round2(order.total - creditApplied));

  const lineList = Object.values(order.lines);
  const missingCustomer = !order.customer;
  const disabledHint = !hasOpenShift
    ? "No hay un turno de caja abierto en esta sucursal"
    : missingCustomer
      ? "Selecciona o crea un cliente para generar la factura"
      : null;
  const submitDisabled =
    !hasOpenShift || lineList.length === 0 || missingCustomer;

  function handlePickCustomer(customer: Customer) {
    order.setCustomer({
      id: customer.id,
      name: customer.fullName,
      cedula: customer.cedula,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
    });
    setCustomerSearch("");
  }

  async function handleConfirm(print: boolean) {
    if (!branchId || submitDisabled) return;

    const method = PAYMENT_METHOD_MAP[order.paymentOption];
    const payments =
      amountPayable > 0 && method ? [{ method, amount: amountPayable }] : [];

    // Solo OWNER/ADMIN envían fecha pasada. Si el día elegido es hoy, omitimos
    // soldAt (el backend usa ahora) para no mandar mediodía local "futuro".
    const soldAt =
      canBackdate && order.saleDate && order.saleDate !== localToday()
        ? saleDayToIso(order.saleDate)
        : undefined;

    try {
      const sale = await createSale.mutateAsync({
        branchId,
        customerId: order.customer?.id,
        items: lineList.map((line) => ({
          productId: line.product.id,
          quantity: line.quantity,
        })),
        payments,
        creditNoteIds: order.selectedCreditNoteIds.length
          ? order.selectedCreditNoteIds
          : undefined,
        soldAt,
      });
      toast.success(
        sale.ncf
          ? `Factura generada · NCF ${sale.ncf}`
          : "Factura generada correctamente",
      );
      // Imprime la representación impresa (recibo 58mm) en un iframe oculto,
      // sin abrir una pestaña nueva, solo si se eligió "Registrar e Imprimir".
      // Ver modules/invoice-print.
      if (print) {
        printInvoiceReceipt(sale.id);
      }
      setShowConfirm(false);
      order.reset();
      setCustomerSearch("");
    } catch (error) {
      // El hook ya notifica; este catch evita un rechazo sin manejar. El modal
      // permanece abierto para que el usuario pueda reintentar.
      void getErrorMessage(error);
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <ClientCard
        customer={order.customer}
        searchValue={customerSearch}
        onSearchChange={setCustomerSearch}
        customers={customersData?.items ?? []}
        loadingCustomers={customersLoading}
        onPickCustomer={handlePickCustomer}
        onNewCustomer={() => setShowCustomerForm(true)}
        paymentOption={order.paymentOption}
        onPaymentChange={order.setPaymentOption}
      />

      <div className="flex min-h-0 flex-1 flex-col">
        <SaleDetail
          lines={lineList}
          qtyTotal={order.qtyTotal}
          onSetQuantity={order.setQuantity}
          onRemove={order.remove}
          onClear={order.clearCart}
          onAddProduct={() => setShowProductPicker(true)}
          canBackdate={canBackdate}
          saleDate={order.saleDate}
          onOpenDateModal={() => setShowDateModal(true)}
          onClearDate={order.clearSaleDate}
          subtotal={order.subtotal}
          itbis={order.itbis}
          total={order.total}
          creditApplied={creditApplied}
          amountPayable={amountPayable}
          submitting={createSale.isPending}
          disabled={submitDisabled}
          disabledHint={disabledHint}
          onSubmit={() => {
            if (!submitDisabled) setShowConfirm(true);
          }}
          onCancel={order.reset}
          showCreditNotes={Boolean(order.customer)}
          creditNotes={creditNotes}
          selectedCreditNoteIds={order.selectedCreditNoteIds}
          onToggleCreditNote={order.toggleCreditNote}
          creditNotesLoading={creditNotesLoading}
        />
      </div>

      {showProductPicker && (
        <Modal
          title="Agregar Productos"
          description="Busca por código o nombre y añade artículos a la factura."
          onClose={() => setShowProductPicker(false)}
          maxWidth="640px"
        >
          <ProductPicker
            products={visibleProducts}
            search={productSearch}
            onSearchChange={setProductSearch}
            categories={categories}
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
            cartQty={cartQty}
            onAdd={order.add}
            loading={productsLoading}
          />
        </Modal>
      )}

      {showCustomerForm && (
        <CustomerFormModalContainer
          customer={null}
          onClose={() => setShowCustomerForm(false)}
          onCreated={handlePickCustomer}
        />
      )}

      {canBackdate && showDateModal && (
        <SaleDateModal
          value={order.saleDate}
          onConfirm={order.setSaleDate}
          onClear={order.clearSaleDate}
          onClose={() => setShowDateModal(false)}
        />
      )}

      {showConfirm && (
        <SaleConfirmModal
          lines={lineList}
          customerName={order.customer?.name ?? ""}
          subtotal={order.subtotal}
          itbis={order.itbis}
          total={order.total}
          creditApplied={creditApplied}
          amountPayable={amountPayable}
          submitting={createSale.isPending}
          onConfirm={handleConfirm}
          onClose={() => setShowConfirm(false)}
        />
      )}
    </div>
  );
}

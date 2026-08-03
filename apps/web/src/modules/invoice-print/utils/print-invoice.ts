const PRINT_FRAME_ID = "invoice-print-frame";
const CLEANUP_FALLBACK_MS = 60_000;

/**
 * Imprime la factura de una venta en un iframe oculto (misma pestaña), en lugar
 * de abrir una pestaña nueva. Carga la ruta `/print/sales/[id]`, cuyo
 * `InvoicePrintScreen` dispara `window.print()` al montar; este helper solo
 * gestiona el ciclo de vida del iframe (no llama a print, para evitar un doble
 * diálogo). El diálogo de impresión del navegador sigue apareciendo: una página
 * web no puede imprimir de forma silenciosa.
 */
export function printInvoiceReceipt(saleId: string): void {
  if (typeof window === "undefined") return;

  document.getElementById(PRINT_FRAME_ID)?.remove();

  const iframe = document.createElement("iframe");
  iframe.id = PRINT_FRAME_ID;
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  iframe.src = `/print/sales/${saleId}`;

  const cleanup = () => iframe.remove();

  iframe.addEventListener("load", () => {
    const frameWindow = iframe.contentWindow;
    if (frameWindow) {
      // Se dispara al cerrar el diálogo (imprimir o cancelar). Mismo origen.
      frameWindow.addEventListener("afterprint", cleanup);
    }
    // Red de seguridad por si `afterprint` no llega (p. ej. fallo de carga).
    window.setTimeout(cleanup, CLEANUP_FALLBACK_MS);
  });

  document.body.appendChild(iframe);
}

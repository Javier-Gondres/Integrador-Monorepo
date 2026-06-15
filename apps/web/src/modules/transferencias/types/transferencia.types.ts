export type TransferStatus =
  | "PENDING"
  | "IN_TRANSIT"
  | "COMPLETED"
  | "CANCELLED";

export interface TransferItem {
  id: string;
  cantidad: number;
  productoId: string;
  productoNombre: string;
  productoSku: string;
}

export interface Transferencia {
  id: string;
  origenNombre: string;
  origenDireccion: string | null;
  destinoNombre: string;
  destinoDireccion: string | null;
  estado: TransferStatus;
  notas: string | null;
  items: TransferItem[];
  creadaEn: string;
}

export interface CrearTransferenciaPayload {
  fromBranchId: string;
  toBranchId: string;
  notes?: string;
  items: { productId: string; quantity: number }[];
}

export interface ItemEnCarrito {
  productId: string;
  nombre: string;
  sku: string;
  cantidad: number;
  stockDisponible: number;
}

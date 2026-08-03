export type TransferStatus =
  | "PENDING"
  | "IN_TRANSIT"
  | "COMPLETED"
  | "CANCELLED";

interface TransferBranchDto {
  name: string;
  address: string | null;
}

interface TransferItemProductDto {
  id: string;
  name: string;
  code: string;
}

interface TransferItemDto {
  id: string;
  /** Decimal serializado por Prisma (puede llegar como string). */
  quantity: number | string;
  product: TransferItemProductDto;
}

/** Respuesta del backend tal como llega del API. */
export interface TransferDto {
  id: string;
  fromBranch: TransferBranchDto;
  toBranch: TransferBranchDto;
  status: TransferStatus;
  notes: string | null;
  createdAt: string;
  items: TransferItemDto[];
}

export interface TransferFilters {
  page?: number;
  take?: number;
  search?: string;
  status?: TransferStatus;
}

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

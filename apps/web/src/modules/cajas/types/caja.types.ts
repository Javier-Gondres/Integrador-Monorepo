export interface Turno {
  id: string;
  estado: "abierto" | "cerrado";
  empleadoNombre: string;
  fechaApertura: string;
  montoApertura: number;
  totalVentas: number;
  totalEfectivo: number;
  totalTarjeta: number;
}

export interface Caja {
  id: string;
  nombre: string;
  descripcion?: string;
  turnoActivo?: Turno | null;
}

export interface AbrirTurnoPayload {
  cajaId: string;
  montoApertura: number;
}

export interface CerrarTurnoPayload {
  turnoId: string;
  montoCierre: number;
}

export interface TurnoHistorial {
  id: string;
  empleadoNombre: string;
  montoApertura: number;
  montoCierre: number | null;
  totalVentas: number;
  totalEfectivo: number;
  totalTarjeta: number;
  diferencia: number | null;
  abiertoEn: string;
  cerradoEn: string | null;
}

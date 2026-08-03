"use client";

import { useState } from "react";

import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Modal } from "@/shared/ui/modal";

import { localToday } from "../utils/format";
interface SaleDateModalProps {
  /** Día actualmente seleccionado (`YYYY-MM-DD`) o `null`. */
  value: string | null;
  onConfirm: (day: string) => void;
  onClear: () => void;
  onClose: () => void;
}

/**
 * Modal para elegir la fecha en que ocurrió una venta pasada. Solo se usa para
 * usuarios con permiso de registrar ventas con fecha pasada (OWNER/ADMIN); el
 * backend es la autoridad real.
 */
export function SaleDateModal({
  value,
  onConfirm,
  onClear,
  onClose,
}: SaleDateModalProps) {
  const max = localToday();
  const [day, setDay] = useState(value ?? max);
  const invalid = !day || day > max;

  return (
    <Modal
      title="Fecha de la venta"
      description="Registra una venta que ocurrió en una fecha pasada. Si no eliges fecha, se usa la de hoy."
      onClose={onClose}
      maxWidth="420px"
    >
      <div className="flex flex-col gap-4 p-4 sm:p-6">
        <Input
          type="date"
          label="Fecha"
          max={max}
          value={day}
          onChange={(e) => setDay(e.target.value)}
        />

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          {value ? (
            <Button
              variant="ghost"
              onClick={() => {
                onClear();
                onClose();
              }}
            >
              Quitar fecha
            </Button>
          ) : (
            <span />
          )}

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Button
              variant="secondary"
              onClick={onClose}
              className="w-full justify-center sm:w-auto"
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              disabled={invalid}
              className="w-full justify-center sm:w-auto"
              onClick={() => {
                if (invalid) return;
                onConfirm(day);
                onClose();
              }}
            >
              Aplicar
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

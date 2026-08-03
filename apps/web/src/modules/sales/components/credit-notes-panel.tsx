"use client";

import { Ticket } from "lucide-react";

import type { CreditNoteDto } from "../types/sale.types";
import { money } from "../utils/format";

interface CreditNotesPanelProps {
  creditNotes: CreditNoteDto[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  loading?: boolean;
}

export function CreditNotesPanel({
  creditNotes,
  selectedIds,
  onToggle,
  loading = false,
}: CreditNotesPanelProps) {
  if (loading) {
    return (
      <div className="rounded-lg border border-card-border bg-white p-3 text-sm text-muted">
        Buscando notas de crédito…
      </div>
    );
  }

  if (creditNotes.length === 0) {
    return null;
  }

  return (
    <div className="rounded-lg border border-green-border bg-green-bg/50 p-3">
      <p className="flex items-center gap-2 text-xs font-semibold text-green-text">
        <Ticket className="h-4 w-4" />
        Notas de crédito disponibles
      </p>
      <ul className="mt-2 flex flex-col gap-1.5">
        {creditNotes.map((note) => {
          const checked = selectedIds.includes(note.id);
          return (
            <li key={note.id}>
              <label className="flex cursor-pointer items-center gap-2.5 rounded-md bg-white px-2.5 py-2">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => onToggle(note.id)}
                  className="h-4 w-4 accent-green-text"
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-body">
                    {note.ncf ?? "Nota de crédito"}
                  </span>
                  <span className="block text-xs text-muted">
                    {new Date(note.createdAt).toLocaleDateString("es-DO")}
                  </span>
                </span>
                <span className="text-sm font-semibold tabular-nums text-green-text">
                  {money(note.amount)}
                </span>
              </label>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

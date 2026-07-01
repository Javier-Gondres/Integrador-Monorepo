"use client";

import { useState } from "react";

import { ERP_COLORS as C } from "@/constants/theme";
import { PageHeader } from "@/shared/ui";

import { RegisterReturnModalContainer } from "../containers/register-return-modal-container";
import { ReturnDetailsModalContainer } from "../containers/return-details-modal-container";
import { ReturnsTableContainer } from "../containers/returns-table-container";

type ModalState =
  | { type: "register" }
  | { type: "details"; returnId: string }
  | null;

export function ReturnsScreen() {
  const [modal, setModal] = useState<ModalState>(null);

  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: C.pageBg,
        fontFamily: "inherit",
      }}
    >
      <PageHeader breadcrumb="Devoluciones" title="Devoluciones" />

      <div
        style={{
          padding: "32px 40px",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
        }}
      >
        <ReturnsTableContainer
          onRegister={() => setModal({ type: "register" })}
          onViewDetails={(returnItem) =>
            setModal({ type: "details", returnId: returnItem.id })
          }
        />
      </div>

      {modal?.type === "register" && (
        <RegisterReturnModalContainer onClose={() => setModal(null)} />
      )}

      {modal?.type === "details" && (
        <ReturnDetailsModalContainer
          returnId={modal.returnId}
          onClose={() => setModal(null)}
        />
      )}
    </main>
  );
}

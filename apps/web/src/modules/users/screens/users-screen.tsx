"use client";

import { useState } from "react";

import { ERP_COLORS as C } from "@/constants/theme";
import { PageHeader } from "@/shared/ui";

import { UserFormModalContainer } from "../containers/user-form-modal-container";
import { UsersTableContainer } from "../containers/users-table-container";
import type { User } from "../types/user.types";

export function UsersScreen() {
  const [modalUser, setModalUser] = useState<User | null | undefined>(
    undefined,
  );

  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: C.pageBg,
        fontFamily: "inherit",
      }}
    >
      <PageHeader breadcrumb="Usuarios" title="Usuarios" />

      <div
        style={{
          padding: "32px 40px",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
        }}
      >
        <UsersTableContainer
          onEdit={setModalUser}
          onCreate={() => setModalUser(null)}
        />
      </div>

      {modalUser !== undefined && (
        <UserFormModalContainer
          user={modalUser}
          onClose={() => setModalUser(undefined)}
        />
      )}
    </main>
  );
}

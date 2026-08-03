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

      <div className="flex flex-col gap-4 p-4 sm:gap-5 sm:p-6 md:p-8 md:gap-6">
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

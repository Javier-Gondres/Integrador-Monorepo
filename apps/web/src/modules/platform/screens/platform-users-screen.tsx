"use client";

import { FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";

import { DEFAULT_PAGE_SIZE, ERP_COLORS as C } from "@/constants/theme";
import { apiFetch } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { getErrorMessage } from "@/lib/api/errors";
import type { DataTableColumn } from "@/shared/data-table";
import { DataTable, DataTableToolbar } from "@/shared/data-table";
import { Badge, Button, Input, Modal, PageHeader, Select } from "@/shared/ui";

type UserStatus = "ACTIVE" | "BLOCKED" | "DELETED";
type AccountType = "USER" | "SUPER_ADMIN";
type TabKey = "users" | "activations" | "invitations";
type ActivationStatus = "PENDING" | "ACTIVATED" | "EXPIRED" | "CANCELLED";
type InvitationStatus = "PENDING" | "ACCEPTED" | "EXPIRED" | "REVOKED";
type PlatformDisplayStatus = UserStatus | ActivationStatus | InvitationStatus;

type PageMeta = {
  page: number;
  take: number;
  total: number;
  totalPages: number;
};

type ApiPage<T> = {
  items: T[];
  meta: PageMeta;
};

type PlatformCompanyOption = {
  id: string;
  name: string;
};

type PlatformUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  type: AccountType;
  status: UserStatus;
  isSuperAdmin: boolean;
  deletedAt: string | null;
  emailVerifiedAt: string | null;
  lastLoginAt: string | null;
  createdAt: string;
  company: { id: string; name: string; slug: string; isActive: boolean } | null;
  role: { id: string; name: string } | null;
};

type PlatformUserDetail = PlatformUser & {
  updatedAt: string;
  activations: PlatformActivation[];
  sentInvitations: PlatformInvitation[];
};

type PlatformActivation = {
  id: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    emailVerifiedAt: string | null;
  };
  status: ActivationStatus;
  expiresAt: string;
  usedAt: string | null;
  revokedAt: string | null;
  createdAt: string;
};

type PlatformInvitation = {
  id: string;
  email: string;
  status: InvitationStatus;
  expiresAt: string;
  acceptedAt: string | null;
  revokedAt: string | null;
  createdAt: string;
  company: { id: string; name: string; isActive?: boolean };
  role: { name: string };
  invitedBy: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
};

const USER_STATUS_OPTIONS = ["Todos", "ACTIVE", "BLOCKED", "DELETED"] as const;
const USER_TYPE_OPTIONS = ["Todos", "USER", "SUPER_ADMIN"] as const;
const MEMBERSHIP_OPTIONS = [
  "Todos",
  "WITH_COMPANY",
  "WITHOUT_COMPANY",
] as const;
const ACTIVATION_STATUS_OPTIONS = [
  "Todos",
  "PENDING",
  "ACTIVATED",
  "EXPIRED",
  "CANCELLED",
] as const;
const INVITATION_STATUS_OPTIONS = [
  "Todos",
  "PENDING",
  "ACCEPTED",
  "EXPIRED",
  "REVOKED",
] as const;
const ROLE_OPTIONS = [
  "ADMIN",
  "MANAGER",
  "CASHIER",
  "INVENTORY_ASSISTANT",
] as const;

function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("es-DO", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function statusBadge(status: PlatformDisplayStatus) {
  const variant =
    status === "ACTIVE" || status === "ACTIVATED" || status === "ACCEPTED"
      ? "success"
      : status === "PENDING"
        ? "warning"
        : status === "BLOCKED" || status === "REVOKED" || status === "CANCELLED"
          ? "error"
          : "muted";

  return <Badge variant={variant}>{status}</Badge>;
}

export function PlatformUsersScreen() {
  const [activeTab, setActiveTab] = useState<TabKey>("users");
  const [search, setSearch] = useState("");
  const [status, setStatus] =
    useState<(typeof USER_STATUS_OPTIONS)[number]>("Todos");
  const [type, setType] = useState<(typeof USER_TYPE_OPTIONS)[number]>("Todos");
  const [membership, setMembership] =
    useState<(typeof MEMBERSHIP_OPTIONS)[number]>("Todos");
  const [companyId, setCompanyId] = useState("Todos");
  const [activationStatus, setActivationStatus] =
    useState<(typeof ACTIVATION_STATUS_OPTIONS)[number]>("Todos");
  const [invitationStatus, setInvitationStatus] =
    useState<(typeof INVITATION_STATUS_OPTIONS)[number]>("Todos");
  const [page, setPage] = useState(1);
  const [take, setTake] = useState(DEFAULT_PAGE_SIZE);
  const [usersPage, setUsersPage] = useState<ApiPage<PlatformUser> | null>(
    null,
  );
  const [activationsPage, setActivationsPage] =
    useState<ApiPage<PlatformActivation> | null>(null);
  const [invitationsPage, setInvitationsPage] =
    useState<ApiPage<PlatformInvitation> | null>(null);
  const [companies, setCompanies] = useState<PlatformCompanyOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<PlatformUserDetail | null>(
    null,
  );
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });
  const [editUser, setEditUser] = useState({ firstName: "", lastName: "" });
  const [assignCompanyId, setAssignCompanyId] = useState("");
  const [assignRole, setAssignRole] =
    useState<(typeof ROLE_OPTIONS)[number]>("ADMIN");
  const [selectedRole, setSelectedRole] =
    useState<(typeof ROLE_OPTIONS)[number]>("ADMIN");

  async function loadCompanies() {
    const result = await apiFetch<ApiPage<PlatformCompanyOption>>(
      ENDPOINTS.platform.companies,
      { params: { page: 1, take: 50 } },
    );
    setCompanies(
      result.items.map((item) => ({ id: item.id, name: item.name })),
    );
  }

  async function loadUsers() {
    const result = await apiFetch<ApiPage<PlatformUser>>(
      ENDPOINTS.platform.users,
      {
        params: {
          page,
          take,
          search,
          status: status === "Todos" ? undefined : status,
          type: type === "Todos" ? undefined : type,
          membership: membership === "Todos" ? undefined : membership,
          companyId: companyId === "Todos" ? undefined : companyId,
        },
      },
    );
    setUsersPage(result);
  }

  async function loadActivations() {
    const result = await apiFetch<ApiPage<PlatformActivation>>(
      ENDPOINTS.platform.activations,
      {
        params: {
          page,
          take,
          search,
          status: activationStatus === "Todos" ? undefined : activationStatus,
        },
      },
    );
    setActivationsPage(result);
  }

  async function loadInvitations() {
    const result = await apiFetch<ApiPage<PlatformInvitation>>(
      ENDPOINTS.platform.invitations,
      {
        params: {
          page,
          take,
          search,
          companyId: companyId === "Todos" ? undefined : companyId,
          status: invitationStatus === "Todos" ? undefined : invitationStatus,
        },
      },
    );
    setInvitationsPage(result);
  }

  async function refreshCurrentTab() {
    setLoading(true);
    try {
      if (activeTab === "users") await loadUsers();
      if (activeTab === "activations") await loadActivations();
      if (activeTab === "invitations") await loadInvitations();
    } catch (error) {
      toast.error(getErrorMessage(error, "No se pudo cargar la información"));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadCompanies().catch(() => undefined);
  }, []);

  useEffect(() => {
    void refreshCurrentTab();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    activeTab,
    page,
    take,
    search,
    status,
    type,
    membership,
    companyId,
    activationStatus,
    invitationStatus,
  ]);

  async function openUserDetail(id: string) {
    try {
      const detail = await apiFetch<PlatformUserDetail>(
        ENDPOINTS.platform.userById(id),
      );
      setSelectedUser(detail);
      setEditUser({ firstName: detail.firstName, lastName: detail.lastName });
      setAssignCompanyId(companies[0]?.id ?? "");
      setSelectedRole(
        ROLE_OPTIONS.includes(
          detail.role?.name as (typeof ROLE_OPTIONS)[number],
        )
          ? (detail.role?.name as (typeof ROLE_OPTIONS)[number])
          : "ADMIN",
      );
    } catch (error) {
      toast.error(getErrorMessage(error, "No se pudo cargar el usuario"));
    }
  }

  async function mutate(endpoint: string, method: string, body?: unknown) {
    await apiFetch(endpoint, {
      method,
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    await refreshCurrentTab();
  }

  async function createUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      await mutate(ENDPOINTS.platform.users, "POST", newUser);
      setNewUser({ firstName: "", lastName: "", email: "" });
      setIsCreateOpen(false);
      toast.success("Usuario creado y activación enviada");
    } catch (error) {
      toast.error(getErrorMessage(error, "No se pudo crear el usuario"));
    }
  }

  async function updateSelectedUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedUser) return;
    try {
      await mutate(
        ENDPOINTS.platform.userById(selectedUser.id),
        "PATCH",
        editUser,
      );
      await openUserDetail(selectedUser.id);
      toast.success("Usuario actualizado");
    } catch (error) {
      toast.error(getErrorMessage(error, "No se pudo actualizar el usuario"));
    }
  }

  async function runUserAction(action: string) {
    if (!selectedUser) return;
    try {
      if (action === "block" || action === "unblock") {
        await mutate(
          ENDPOINTS.platform.updateUserStatus(selectedUser.id),
          "PATCH",
          {
            status: action === "block" ? "BLOCKED" : "ACTIVE",
          },
        );
      }
      if (action === "reset") {
        await mutate(
          ENDPOINTS.platform.resetUserPassword(selectedUser.id),
          "POST",
        );
      }
      if (action === "forceLogout") {
        await mutate(
          ENDPOINTS.platform.forceLogoutUser(selectedUser.id),
          "POST",
        );
      }
      if (action === "delete") {
        if (!confirm("¿Eliminar este usuario de forma lógica?")) return;
        const deleted = await apiFetch<PlatformUser>(
          ENDPOINTS.platform.userById(selectedUser.id),
          { method: "DELETE" },
        );
        setSelectedUser((current) =>
          current
            ? {
                ...current,
                ...deleted,
                status: "DELETED",
              }
            : null,
        );
        await refreshCurrentTab();
        toast.success("Usuario eliminado");
        return;
      }
      if (action === "restore") {
        await mutate(ENDPOINTS.platform.restoreUser(selectedUser.id), "PATCH");
      }
      if (action === "removeMembership") {
        if (!confirm("¿Sacar este usuario de su empresa actual?")) return;
        await mutate(
          ENDPOINTS.platform.userMembership(selectedUser.id),
          "DELETE",
        );
      }
      if (action === "transferOwnership" && selectedUser.company) {
        if (
          !confirm(
            "¿Transferir la propiedad de la empresa a este usuario? El OWNER actual pasará a ADMIN.",
          )
        ) {
          return;
        }
        await mutate(
          ENDPOINTS.platform.transferCompanyOwnership(selectedUser.company.id),
          "POST",
          { newOwnerUserId: selectedUser.id },
        );
      }
      await openUserDetail(selectedUser.id);
      toast.success("Acción completada");
    } catch (error) {
      toast.error(getErrorMessage(error, "No se pudo completar la acción"));
    }
  }

  async function assignSelectedUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedUser || !assignCompanyId) return;
    try {
      await mutate(ENDPOINTS.platform.userMembership(selectedUser.id), "POST", {
        companyId: assignCompanyId,
        role: assignRole,
      });
      await openUserDetail(selectedUser.id);
      toast.success("Usuario agregado a empresa");
    } catch (error) {
      toast.error(getErrorMessage(error, "No se pudo agregar a empresa"));
    }
  }

  async function updateSelectedUserRole(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedUser) return;
    try {
      await mutate(
        ENDPOINTS.platform.updateUserMembershipRole(selectedUser.id),
        "PATCH",
        {
          role: selectedRole,
        },
      );
      await openUserDetail(selectedUser.id);
      toast.success("Rol actualizado");
    } catch (error) {
      toast.error(getErrorMessage(error, "No se pudo actualizar el rol"));
    }
  }

  const userColumns: DataTableColumn<PlatformUser>[] = [
    {
      id: "type",
      header: "Tipo",
      cell: (row) => (
        <Badge variant={row.type === "SUPER_ADMIN" ? "primary" : "muted"}>
          {row.type === "SUPER_ADMIN" ? "Super Admin" : "Usuario"}
        </Badge>
      ),
    },
    {
      id: "user",
      header: "Usuario",
      align: "left",
      cell: (row) => (
        <div style={{ display: "grid", gap: 3 }}>
          <strong>{row.fullName}</strong>
          <span style={{ color: C.mutedText, fontSize: 12 }}>{row.email}</span>
        </div>
      ),
    },
    {
      id: "company",
      header: "Empresa actual",
      align: "left",
      cell: (row) => row.company?.name ?? "Sin empresa",
    },
    {
      id: "role",
      header: "Rol",
      cell: (row) => row.role?.name ?? "—",
    },
    {
      id: "status",
      header: "Estado",
      cell: (row) => statusBadge(row.status),
    },
    {
      id: "createdAt",
      header: "Creado",
      cell: (row) => formatDate(row.createdAt),
    },
    {
      id: "actions",
      header: "Acciones",
      cell: (row) => (
        <Button
          size="sm"
          variant="secondary"
          onClick={() => void openUserDetail(row.id)}
        >
          Detalle
        </Button>
      ),
    },
  ];

  const activationColumns: DataTableColumn<PlatformActivation>[] = [
    {
      id: "user",
      header: "Usuario",
      align: "left",
      cell: (row) => (
        <div style={{ display: "grid", gap: 3 }}>
          <strong>
            {row.user.firstName} {row.user.lastName}
          </strong>
          <span style={{ color: C.mutedText, fontSize: 12 }}>
            {row.user.email}
          </span>
        </div>
      ),
    },
    { id: "status", header: "Estado", cell: (row) => statusBadge(row.status) },
    {
      id: "createdAt",
      header: "Creada",
      cell: (row) => formatDate(row.createdAt),
    },
    {
      id: "expiresAt",
      header: "Expira",
      cell: (row) => formatDate(row.expiresAt),
    },
    {
      id: "actions",
      header: "Acciones",
      cell: (row) => (
        <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
          <Button
            size="sm"
            variant="secondary"
            disabled={row.status === "ACTIVATED"}
            onClick={() =>
              void mutate(ENDPOINTS.platform.resendActivation(row.id), "POST")
            }
          >
            Reenviar
          </Button>
          <Button
            size="sm"
            variant="ghost"
            disabled={row.status !== "PENDING"}
            onClick={() =>
              void mutate(ENDPOINTS.platform.cancelActivation(row.id), "POST")
            }
          >
            Cancelar
          </Button>
        </div>
      ),
    },
  ];

  const invitationColumns: DataTableColumn<PlatformInvitation>[] = [
    {
      id: "email",
      header: "Invitado",
      align: "left",
      cell: (row) => (
        <div style={{ display: "grid", gap: 3 }}>
          <strong>{row.email}</strong>
          <span style={{ color: C.mutedText, fontSize: 12 }}>
            {row.company.name} · {row.role.name}
          </span>
        </div>
      ),
    },
    {
      id: "createdBy",
      header: "Creada por",
      align: "left",
      cell: (row) =>
        `${row.invitedBy.firstName} ${row.invitedBy.lastName}`.trim() ||
        row.invitedBy.email,
    },
    { id: "status", header: "Estado", cell: (row) => statusBadge(row.status) },
    {
      id: "createdAt",
      header: "Creada",
      cell: (row) => formatDate(row.createdAt),
    },
    {
      id: "expiresAt",
      header: "Expira",
      cell: (row) => formatDate(row.expiresAt),
    },
    {
      id: "actions",
      header: "Acciones",
      cell: (row) => (
        <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
          <Button
            size="sm"
            variant="secondary"
            disabled={row.status === "ACCEPTED"}
            onClick={() =>
              void mutate(ENDPOINTS.platform.resendInvitation(row.id), "POST")
            }
          >
            Reenviar
          </Button>
          <Button
            size="sm"
            variant="ghost"
            disabled={row.status !== "PENDING"}
            onClick={() =>
              void mutate(ENDPOINTS.platform.revokeInvitation(row.id), "POST")
            }
          >
            Revocar
          </Button>
        </div>
      ),
    },
  ];

  const currentPage =
    activeTab === "users"
      ? usersPage
      : activeTab === "activations"
        ? activationsPage
        : invitationsPage;

  return (
    <main style={{ minHeight: "100vh", backgroundColor: C.pageBg }}>
      <PageHeader breadcrumb="Plataforma / Usuarios" title="Usuarios" />
      <div style={{ padding: "32px 40px", display: "grid", gap: 20 }}>
        <div style={{ display: "flex", gap: 8 }}>
          {[
            ["users", "Usuarios"],
            ["activations", "Activaciones"],
            ["invitations", "Invitaciones de empresa"],
          ].map(([key, label]) => (
            <Button
              key={key}
              variant={activeTab === key ? "primary" : "secondary"}
              onClick={() => {
                setActiveTab(key as TabKey);
                setPage(1);
              }}
            >
              {label}
            </Button>
          ))}
        </div>

        <DataTableToolbar
          searchPlaceholder="Buscar por nombre, apellido o email..."
          searchValue={search}
          onSearchChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
          onRefresh={() => void refreshCurrentTab()}
          refreshing={loading}
          createLabel={activeTab === "users" ? "Nuevo Usuario" : ""}
          onCreate={() => {
            if (activeTab === "users") setIsCreateOpen(true);
          }}
        />

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          {activeTab === "users" ? (
            <>
              <Filter label="Estado">
                <Select
                  options={USER_STATUS_OPTIONS}
                  value={status}
                  onChange={(event) => {
                    setStatus(event.target.value as typeof status);
                    setPage(1);
                  }}
                />
              </Filter>
              <Filter label="Tipo">
                <Select
                  options={USER_TYPE_OPTIONS}
                  value={type}
                  onChange={(event) => {
                    setType(event.target.value as typeof type);
                    setPage(1);
                  }}
                />
              </Filter>
              <Filter label="Empresa">
                <CompanySelect
                  companies={companies}
                  value={companyId}
                  onChange={(value) => {
                    setCompanyId(value);
                    setPage(1);
                  }}
                />
              </Filter>
              <Filter label="Membresía">
                <Select
                  options={MEMBERSHIP_OPTIONS}
                  value={membership}
                  onChange={(event) => {
                    setMembership(event.target.value as typeof membership);
                    setPage(1);
                  }}
                />
              </Filter>
            </>
          ) : null}
          {activeTab === "activations" ? (
            <Filter label="Estado">
              <Select
                options={ACTIVATION_STATUS_OPTIONS}
                value={activationStatus}
                onChange={(event) => {
                  setActivationStatus(
                    event.target.value as typeof activationStatus,
                  );
                  setPage(1);
                }}
              />
            </Filter>
          ) : null}
          {activeTab === "invitations" ? (
            <>
              <Filter label="Empresa">
                <CompanySelect
                  companies={companies}
                  value={companyId}
                  onChange={(value) => {
                    setCompanyId(value);
                    setPage(1);
                  }}
                />
              </Filter>
              <Filter label="Estado">
                <Select
                  options={INVITATION_STATUS_OPTIONS}
                  value={invitationStatus}
                  onChange={(event) => {
                    setInvitationStatus(
                      event.target.value as typeof invitationStatus,
                    );
                    setPage(1);
                  }}
                />
              </Filter>
            </>
          ) : null}
        </div>

        {activeTab === "users" ? (
          <DataTable
            title="Usuarios registrados"
            columns={userColumns}
            data={usersPage?.items ?? []}
            loading={loading}
            total={usersPage?.meta.total ?? 0}
            getRowKey={(row) => row.id}
            pagination={{
              total: usersPage?.meta.total ?? 0,
              currentPage: page,
              totalPages: usersPage?.meta.totalPages ?? 1,
              rowsPerPage: take,
            }}
            onPageChange={setPage}
            onRowsPerPageChange={(value) => {
              setTake(value);
              setPage(1);
            }}
          />
        ) : null}

        {activeTab === "activations" ? (
          <DataTable
            title="Activaciones de plataforma"
            columns={activationColumns}
            data={activationsPage?.items ?? []}
            loading={loading}
            total={currentPage?.meta.total ?? 0}
            getRowKey={(row) => row.id}
            pagination={{
              total: currentPage?.meta.total ?? 0,
              currentPage: page,
              totalPages: currentPage?.meta.totalPages ?? 1,
              rowsPerPage: take,
            }}
            onPageChange={setPage}
            onRowsPerPageChange={(value) => {
              setTake(value);
              setPage(1);
            }}
          />
        ) : null}

        {activeTab === "invitations" ? (
          <DataTable
            title="Invitaciones de empresa"
            columns={invitationColumns}
            data={invitationsPage?.items ?? []}
            loading={loading}
            total={currentPage?.meta.total ?? 0}
            getRowKey={(row) => row.id}
            pagination={{
              total: currentPage?.meta.total ?? 0,
              currentPage: page,
              totalPages: currentPage?.meta.totalPages ?? 1,
              rowsPerPage: take,
            }}
            onPageChange={setPage}
            onRowsPerPageChange={(value) => {
              setTake(value);
              setPage(1);
            }}
          />
        ) : null}
      </div>

      {isCreateOpen ? (
        <Modal
          title="Nuevo Usuario"
          description="Crea una cuenta global y envía el correo de activación."
          onClose={() => setIsCreateOpen(false)}
        >
          <form
            onSubmit={createUser}
            style={{ padding: 24, display: "grid", gap: 16 }}
          >
            <Input
              label="Nombre"
              required
              value={newUser.firstName}
              onChange={(event) =>
                setNewUser((current) => ({
                  ...current,
                  firstName: event.target.value,
                }))
              }
            />
            <Input
              label="Apellido"
              required
              value={newUser.lastName}
              onChange={(event) =>
                setNewUser((current) => ({
                  ...current,
                  lastName: event.target.value,
                }))
              }
            />
            <Input
              label="Email"
              type="email"
              required
              value={newUser.email}
              onChange={(event) =>
                setNewUser((current) => ({
                  ...current,
                  email: event.target.value,
                }))
              }
            />
            <Button type="submit">Crear y enviar activación</Button>
          </form>
        </Modal>
      ) : null}

      {selectedUser ? (
        <Modal
          title={selectedUser.fullName}
          description={`${selectedUser.email} · ${selectedUser.type === "SUPER_ADMIN" ? "Super Admin" : "Usuario"}`}
          maxWidth="900px"
          onClose={() => setSelectedUser(null)}
        >
          <div
            style={{ padding: 24, display: "grid", gap: 20, overflowY: "auto" }}
          >
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {statusBadge(selectedUser.status)}
              <Badge variant="primary">
                {selectedUser.type === "SUPER_ADMIN"
                  ? "Super Admin"
                  : "Usuario"}
              </Badge>
              <Badge variant="muted">
                {selectedUser.company?.name ?? "Sin empresa"}
              </Badge>
            </div>

            <InfoGrid
              items={[
                ["Empresa", selectedUser.company?.name ?? "Sin empresa"],
                ["Rol", selectedUser.role?.name ?? "—"],
                ["Creado", formatDate(selectedUser.createdAt)],
                ["Último acceso", formatDate(selectedUser.lastLoginAt)],
                ["Email verificado", formatDate(selectedUser.emailVerifiedAt)],
              ]}
            />

            <section style={{ display: "grid", gap: 10 }}>
              <h3 style={{ margin: 0, fontSize: 15 }}>Editar usuario</h3>
              <form
                onSubmit={updateSelectedUser}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr auto",
                  gap: 12,
                }}
              >
                <Input
                  label="Nombre"
                  value={editUser.firstName}
                  onChange={(event) =>
                    setEditUser((current) => ({
                      ...current,
                      firstName: event.target.value,
                    }))
                  }
                />
                <Input
                  label="Apellido"
                  value={editUser.lastName}
                  onChange={(event) =>
                    setEditUser((current) => ({
                      ...current,
                      lastName: event.target.value,
                    }))
                  }
                />
                <Button type="submit" style={{ alignSelf: "end" }}>
                  Guardar
                </Button>
              </form>
            </section>

            {selectedUser.status !== "DELETED" &&
            selectedUser.company &&
            selectedUser.role?.name !== "OWNER" ? (
              <section style={{ display: "grid", gap: 10 }}>
                <h3 style={{ margin: 0, fontSize: 15 }}>Modificar rol</h3>
                <form
                  onSubmit={updateSelectedUserRole}
                  style={{
                    display: "flex",
                    gap: 12,
                    alignItems: "end",
                    flexWrap: "wrap",
                  }}
                >
                  <Filter label="Rol">
                    <Select
                      options={ROLE_OPTIONS}
                      value={selectedRole}
                      onChange={(event) =>
                        setSelectedRole(
                          event.target.value as typeof selectedRole,
                        )
                      }
                    />
                  </Filter>
                  <Button type="submit" size="sm" style={{ marginBottom: 1 }}>
                    Actualizar rol
                  </Button>
                </form>
              </section>
            ) : null}

            <section style={{ display: "grid", gap: 10 }}>
              <h3 style={{ margin: 0, fontSize: 15 }}>
                Acciones administrativas
              </h3>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <Button
                  variant="secondary"
                  onClick={() =>
                    void runUserAction(
                      selectedUser.status === "ACTIVE" ? "block" : "unblock",
                    )
                  }
                  disabled={selectedUser.status === "DELETED"}
                >
                  {selectedUser.status === "ACTIVE"
                    ? "Bloquear"
                    : "Desbloquear"}
                </Button>
                {selectedUser.status !== "DELETED" ? (
                  <>
                    <Button
                      variant="secondary"
                      onClick={() => void runUserAction("reset")}
                    >
                      Restablecer contraseña
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => void runUserAction("forceLogout")}
                    >
                      Forzar cierre de sesión
                    </Button>
                  </>
                ) : null}
                <Button
                  variant="ghost"
                  onClick={() =>
                    void runUserAction(
                      selectedUser.status === "DELETED" ? "restore" : "delete",
                    )
                  }
                >
                  {selectedUser.status === "DELETED" ? "Restaurar" : "Eliminar"}
                </Button>
                {selectedUser.status !== "DELETED" && selectedUser.company ? (
                  <Button
                    variant="ghost"
                    onClick={() => void runUserAction("removeMembership")}
                    disabled={selectedUser.role?.name === "OWNER"}
                  >
                    Sacar de empresa
                  </Button>
                ) : null}
                {selectedUser.status !== "DELETED" &&
                selectedUser.company &&
                selectedUser.role?.name !== "OWNER" ? (
                  <Button
                    variant="secondary"
                    onClick={() => void runUserAction("transferOwnership")}
                  >
                    Transferir propiedad a este usuario
                  </Button>
                ) : null}
              </div>
            </section>

            {selectedUser.status !== "DELETED" &&
            !selectedUser.company &&
            !selectedUser.isSuperAdmin ? (
              <section style={{ display: "grid", gap: 10 }}>
                <h3 style={{ margin: 0, fontSize: 15 }}>Agregar a empresa</h3>
                <form
                  onSubmit={assignSelectedUser}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 180px auto",
                    gap: 12,
                    alignItems: "end",
                  }}
                >
                  <Filter label="Empresa">
                    <CompanySelect
                      companies={companies}
                      value={assignCompanyId}
                      includeAll={false}
                      onChange={setAssignCompanyId}
                    />
                  </Filter>
                  <Filter label="Rol">
                    <Select
                      options={ROLE_OPTIONS}
                      value={assignRole}
                      onChange={(event) =>
                        setAssignRole(event.target.value as typeof assignRole)
                      }
                    />
                  </Filter>
                  <Button type="submit">Agregar</Button>
                </form>
              </section>
            ) : null}
          </div>
        </Modal>
      ) : null}
    </main>
  );
}

function Filter({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label style={{ display: "grid", gap: 6, fontSize: 13, fontWeight: 600 }}>
      {label}
      {children}
    </label>
  );
}

function CompanySelect({
  companies,
  value,
  onChange,
  includeAll = true,
}: {
  companies: PlatformCompanyOption[];
  value: string;
  onChange: (value: string) => void;
  includeAll?: boolean;
}) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      style={{
        height: "32px",
        minWidth: 180,
        padding: "0 8px",
        border: `1px solid ${C.inputBorder}`,
        borderRadius: 6,
        color: C.bodyText,
        background: C.cardBg,
      }}
    >
      {includeAll ? <option value="Todos">Todas</option> : null}
      {companies.map((company) => (
        <option key={company.id} value={company.id}>
          {company.name}
        </option>
      ))}
    </select>
  );
}

function InfoGrid({ items }: { items: Array<[string, string]> }) {
  return (
    <dl
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
        gap: 12,
      }}
    >
      {items.map(([label, value]) => (
        <div
          key={label}
          style={{
            border: `1px solid ${C.cardBorder}`,
            borderRadius: 8,
            padding: 12,
          }}
        >
          <dt style={{ color: C.mutedText, fontSize: 12 }}>{label}</dt>
          <dd style={{ margin: "4px 0 0", fontWeight: 600 }}>{value}</dd>
        </div>
      ))}
    </dl>
  );
}

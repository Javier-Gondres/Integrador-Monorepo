"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { ERP_COLORS as C } from "@/constants/theme";
import { apiFetch } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { getErrorMessage } from "@/lib/api/errors";
import { getRoleLabel } from "@/modules/users/utils/role-labels";
import { DataTableToolbar } from "@/shared/data-table";
import { Badge, Button, PageHeader } from "@/shared/ui";

type PermissionInfo = {
  code: string;
  name: string;
  description: string | null;
};

type RolePermissionGroup = {
  role: string;
  permissions: PermissionInfo[];
};

type PermissionsCatalog = {
  permissions: PermissionInfo[];
  roles: RolePermissionGroup[];
};

type ViewTab = "by-role" | "catalog";

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

function matchesPermission(permission: PermissionInfo, query: string): boolean {
  if (!query) {
    return true;
  }

  const normalized = normalize(query);
  return (
    normalize(permission.code).includes(normalized) ||
    normalize(permission.name).includes(normalized) ||
    normalize(permission.description ?? "").includes(normalized)
  );
}

function matchesRole(group: RolePermissionGroup, query: string): boolean {
  if (!query) {
    return true;
  }

  const normalized = normalize(query);
  return (
    normalize(group.role).includes(normalized) ||
    normalize(getRoleLabel(group.role)).includes(normalized) ||
    group.permissions.some((permission) => matchesPermission(permission, query))
  );
}

function getPermissionModule(code: string): string {
  return code.split(".")[0] ?? "general";
}

function humanizeModule(moduleName: string): string {
  return moduleName
    .split(/[-_]/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function PlatformPermissionsScreen() {
  const [catalog, setCatalog] = useState<PermissionsCatalog | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<ViewTab>("by-role");
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [search, setSearch] = useState("");

  async function loadCatalog() {
    setLoading(true);
    try {
      const data = await apiFetch<PermissionsCatalog>(
        ENDPOINTS.platform.permissions,
      );
      setCatalog(data);
      setSelectedRole((current) => current || data.roles[0]?.role || "");
    } catch (error) {
      toast.error(
        getErrorMessage(error, "No se pudo cargar el catálogo de permisos"),
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadCatalog();
  }, []);

  const visibleRoles = useMemo(() => {
    if (!catalog) {
      return [];
    }

    return catalog.roles.filter((group) => matchesRole(group, search));
  }, [catalog, search]);

  useEffect(() => {
    if (visibleRoles.length === 0) {
      return;
    }

    const stillVisible = visibleRoles.some(
      (group) => group.role === selectedRole,
    );
    if (!stillVisible) {
      setSelectedRole(visibleRoles[0]?.role ?? "");
    }
  }, [visibleRoles, selectedRole]);

  const selectedRoleGroup = useMemo(
    () => visibleRoles.find((group) => group.role === selectedRole) ?? null,
    [visibleRoles, selectedRole],
  );

  const filteredRolePermissions = useMemo(() => {
    if (!selectedRoleGroup) {
      return [];
    }

    return selectedRoleGroup.permissions.filter((permission) =>
      matchesPermission(permission, search),
    );
  }, [selectedRoleGroup, search]);

  const filteredCatalogPermissions = useMemo(() => {
    if (!catalog) {
      return [];
    }

    return catalog.permissions.filter((permission) =>
      matchesPermission(permission, search),
    );
  }, [catalog, search]);

  const catalogByModule = useMemo(() => {
    const groups = new Map<string, PermissionInfo[]>();

    for (const permission of filteredCatalogPermissions) {
      const permissionModule = getPermissionModule(permission.code);
      const current = groups.get(permissionModule) ?? [];
      current.push(permission);
      groups.set(permissionModule, current);
    }

    return [...groups.entries()].sort(([left], [right]) =>
      left.localeCompare(right),
    );
  }, [filteredCatalogPermissions]);

  const rolePermissionGroups = useMemo(() => {
    const groups = new Map<string, PermissionInfo[]>();

    for (const permission of filteredRolePermissions) {
      const permissionModule = getPermissionModule(permission.code);
      const current = groups.get(permissionModule) ?? [];
      current.push(permission);
      groups.set(permissionModule, current);
    }

    return [...groups.entries()].sort(([left], [right]) =>
      left.localeCompare(right),
    );
  }, [filteredRolePermissions]);

  return (
    <main style={{ minHeight: "100vh", backgroundColor: C.pageBg }}>
      <PageHeader breadcrumb="Plataforma / Permisos" title="Permisos" />

      <div style={{ padding: "32px 40px", display: "grid", gap: 20 }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {[
            ["by-role", "Por rol"],
            ["catalog", "Catálogo completo"],
          ].map(([key, label]) => (
            <Button
              key={key}
              variant={activeView === key ? "primary" : "secondary"}
              onClick={() => setActiveView(key as ViewTab)}
            >
              {label}
            </Button>
          ))}
        </div>

        <DataTableToolbar
          searchPlaceholder={
            activeView === "by-role"
              ? "Buscar rol o permiso..."
              : "Buscar permiso por nombre, código o descripción..."
          }
          searchValue={search}
          onSearchChange={setSearch}
          onRefresh={() => void loadCatalog()}
          refreshing={loading}
          createLabel=""
          onCreate={() => {}}
        />

        {activeView === "by-role" ? (
          <section style={cardStyle}>
            <div style={{ display: "grid", gap: 16 }}>
              <div>
                <h2 style={titleStyle}>Permisos por rol</h2>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: 8,
                  flexWrap: "wrap",
                  paddingBottom: 4,
                  borderBottom: `1px solid ${C.divider}`,
                }}
              >
                {(catalog?.roles ?? []).map((group) => {
                  const isVisible = visibleRoles.some(
                    (item) => item.role === group.role,
                  );
                  if (!isVisible) {
                    return null;
                  }

                  const isSelected = selectedRole === group.role;

                  return (
                    <Button
                      key={group.role}
                      size="sm"
                      variant={isSelected ? "primary" : "secondary"}
                      onClick={() => setSelectedRole(group.role)}
                    >
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        {getRoleLabel(group.role)}
                        <Badge variant={isSelected ? "primary" : "muted"}>
                          {group.permissions.length}
                        </Badge>
                      </span>
                    </Button>
                  );
                })}
              </div>

              {selectedRoleGroup ? (
                <div style={{ display: "grid", gap: 16 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 12,
                      flexWrap: "wrap",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <h3 style={{ margin: 0, fontSize: 16 }}>
                        {getRoleLabel(selectedRoleGroup.role)}
                      </h3>
                      <p
                        style={{
                          margin: "6px 0 0",
                          color: C.mutedText,
                          fontSize: 13,
                        }}
                      >
                        Código: <strong>{selectedRoleGroup.role}</strong> ·{" "}
                        {filteredRolePermissions.length} permiso
                        {filteredRolePermissions.length === 1 ? "" : "s"}
                        {search ? " coincidentes" : " asignados"}
                      </p>
                    </div>
                  </div>

                  {filteredRolePermissions.length > 0 ? (
                    <div style={{ display: "grid", gap: 20 }}>
                      {rolePermissionGroups.map(
                        ([permissionModule, permissions]) => (
                          <div
                            key={permissionModule}
                            style={{ display: "grid", gap: 10 }}
                          >
                            <h4 style={moduleTitleStyle}>
                              {humanizeModule(permissionModule)}
                              <span
                                style={{ color: C.mutedText, fontWeight: 400 }}
                              >
                                {" "}
                                ({permissions.length})
                              </span>
                            </h4>
                            <div style={{ display: "grid", gap: 8 }}>
                              {permissions.map((permission) => (
                                <PermissionRow
                                  key={permission.code}
                                  permission={permission}
                                />
                              ))}
                            </div>
                          </div>
                        ),
                      )}
                    </div>
                  ) : (
                    <EmptyState message="No hay permisos que coincidan con la búsqueda para este rol." />
                  )}
                </div>
              ) : (
                <EmptyState message="No hay roles que coincidan con la búsqueda." />
              )}
            </div>
          </section>
        ) : (
          <section style={cardStyle}>
            <div style={{ display: "grid", gap: 16 }}>
              <div>
                <h2 style={titleStyle}>Catálogo de permisos</h2>
                <p style={subtitleStyle}>
                  Referencia completa del sistema RBAC agrupada por módulo.
                </p>
              </div>

              {filteredCatalogPermissions.length > 0 ? (
                <div style={{ display: "grid", gap: 20 }}>
                  {catalogByModule.map(([permissionModule, permissions]) => (
                    <div
                      key={permissionModule}
                      style={{ display: "grid", gap: 10 }}
                    >
                      <h4 style={moduleTitleStyle}>
                        {humanizeModule(permissionModule)}
                        <span style={{ color: C.mutedText, fontWeight: 400 }}>
                          {" "}
                          ({permissions.length})
                        </span>
                      </h4>
                      <div style={{ display: "grid", gap: 8 }}>
                        {permissions.map((permission) => (
                          <PermissionRow
                            key={permission.code}
                            permission={permission}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState message="No hay permisos que coincidan con la búsqueda." />
              )}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

function PermissionRow({ permission }: { permission: PermissionInfo }) {
  return (
    <div style={permissionRowStyle}>
      <div>
        <div
          style={{
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <strong>{permission.name}</strong>
          <Badge variant="muted">{permission.code}</Badge>
        </div>
        <p style={{ margin: "4px 0 0", color: C.mutedText, fontSize: 13 }}>
          {permission.description ?? "Sin descripción"}
        </p>
      </div>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div
      style={{
        padding: 24,
        borderRadius: 10,
        background: C.grayBg,
        color: C.mutedText,
        textAlign: "center",
        fontSize: 14,
      }}
    >
      {message}
    </div>
  );
}

const cardStyle: React.CSSProperties = {
  backgroundColor: C.cardBg,
  border: `1px solid ${C.cardBorder}`,
  borderRadius: 12,
  boxShadow: C.cardShadow,
  padding: 24,
};

const titleStyle: React.CSSProperties = {
  margin: "0 0 8px",
  fontSize: 18,
  color: C.bodyText,
};

const subtitleStyle: React.CSSProperties = {
  margin: 0,
  color: C.mutedText,
  fontSize: 14,
};

const moduleTitleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 14,
  color: C.bodyText,
  fontWeight: 700,
};

const permissionRowStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  padding: 12,
  border: `1px solid ${C.divider}`,
  borderRadius: 8,
};

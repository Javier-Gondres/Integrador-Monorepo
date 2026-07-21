/**
 * Mapa central de endpoints del API.
 *
 * Rutas estáticas como literales `as const`; rutas con parámetros como
 * funciones, para mantener autocompletado y una sola fuente de verdad.
 */
export const ENDPOINTS = {
  auth: {
    login: "/auth/login",
    logout: "/auth/logout",
    refresh: "/auth/refresh",
    session: "/auth/session",
    profile: "/auth/profile",
    resetPassword: "/auth/reset-password",
  },
  me: {
    profile: "/me",
    company: "/me/company",
    branch: "/me/branch",
    switchBranch: "/me/switch-branch",
  },
  products: {
    root: "/products",
    byId: (id: string) => `/products/${id}`,
    activate: (id: string) => `/products/${id}/activate`,
    deactivate: (id: string) => `/products/${id}/deactivate`,
  },
  categories: {
    root: "/categories",
    all: "/categories/all",
    byId: (id: string) => `/categories/${id}`,
    activate: (id: string) => `/categories/${id}/activate`,
    deactivate: (id: string) => `/categories/${id}/deactivate`,
  },
  discounts: {
    root: "/discounts",
    byId: (id: string) => `/discounts/${id}`,
    activate: (id: string) => `/discounts/${id}/activate`,
    deactivate: (id: string) => `/discounts/${id}/deactivate`,
    current: "/discounts/current",
    applicableToProduct: (productId: string) =>
      `/discounts/applicable/${productId}`,
  },
  suppliers: {
    root: "/suppliers",
    byId: (id: string) => `/suppliers/${id}`,
    restore: (id: string) => `/suppliers/${id}/restore`,
    products: {
      root: (supplierId: string) => `/suppliers/${supplierId}/products`,
      byId: (supplierId: string, productId: string) =>
        `/suppliers/${supplierId}/products/${productId}`,
      activate: (supplierId: string, productId: string) =>
        `/suppliers/${supplierId}/products/${productId}/activate`,
      deactivate: (supplierId: string, productId: string) =>
        `/suppliers/${supplierId}/products/${productId}/deactivate`,
    },
  },
  employees: {
    root: "/employees",
    byId: (id: string) => `/employees/${id}`,
    laborProfileByUserId: (userId: string) =>
      `/employees/by-user/${userId}/labor-profile`,
    restore: (id: string) => `/employees/${id}/restore`,
  },
  branches: {
    root: "/branches",
    byId: (id: string) => `/branches/${id}`,
  },
  companies: {
    root: "/companies",
    byId: (id: string) => `/companies/${id}`,
  },
  users: {
    root: "/users",
    roles: "/users/roles",
    byId: (id: string) => `/users/${id}`,
    activate: (id: string) => `/users/${id}/activate`,
    deactivate: (id: string) => `/users/${id}/deactivate`,
    restore: (id: string) => `/users/${id}/restore`,
    removeMembership: (id: string) => `/users/${id}/membership`,
    transferOwnership: "/users/transfer-ownership",
  },
  invitations: {
    root: "/invitations",
    byToken: (token: string) => `/invitations/${token}`,
    accept: (token: string) => `/invitations/${token}/accept`,
    register: (token: string) => `/invitations/${token}/register`,
    resend: (id: string) => `/invitations/${id}/resend`,
    revoke: (id: string) => `/invitations/${id}/revoke`,
  },
  platform: {
    overview: "/platform/overview",
    permissions: "/platform/permissions",
    companies: "/platform/companies",
    companyById: (id: string) => `/platform/companies/${id}`,
    transferCompanyOwnership: (id: string) =>
      `/platform/companies/${id}/transfer-ownership`,
    activateCompany: (id: string) => `/platform/companies/${id}/activate`,
    deactivateCompany: (id: string) => `/platform/companies/${id}/deactivate`,
    users: "/platform/users",
    userById: (id: string) => `/platform/users/${id}`,
    updateUserStatus: (id: string) => `/platform/users/${id}/status`,
    resetUserPassword: (id: string) => `/platform/users/${id}/reset-password`,
    forceLogoutUser: (id: string) => `/platform/users/${id}/force-logout`,
    verifyUserEmail: (id: string) => `/platform/users/${id}/verify-email`,
    restoreUser: (id: string) => `/platform/users/${id}/restore`,
    userMembership: (id: string) => `/platform/users/${id}/membership`,
    updateUserMembershipRole: (id: string) =>
      `/platform/users/${id}/membership/role`,
    activations: "/platform/activations",
    resendActivation: (id: string) => `/platform/activations/${id}/resend`,
    cancelActivation: (id: string) => `/platform/activations/${id}/cancel`,
    invitations: "/platform/invitations",
    resendInvitation: (id: string) => `/platform/invitations/${id}/resend`,
    revokeInvitation: (id: string) => `/platform/invitations/${id}/revoke`,
  },
  purchases: {
    root: "/purchases",
    byId: (id: string) => `/purchases/${id}`,
  },
  returns: {
    root: "/returns",
    byId: (id: string) => `/returns/${id}`,
    saleLookup: "/returns/sale-lookup",
  },
  sales: {
    root: "/sales",
    byId: (id: string) => `/sales/${id}`,
    products: "/sales/products",
    currentShift: "/sales/current-shift",
    creditNotes: "/sales/credit-notes",
  },
  reservations: {
    root: "/reservations",
    byId: (id: string) => `/reservations/${id}`,
    cancel: (id: string) => `/reservations/${id}/cancel`,
  },
  cashRegisters: {
    root: "/cash-registers",
    byId: (id: string) => `/cash-registers/${id}`,
    openShift: (id: string) => `/cash-registers/${id}/open-shift`,
    closeShift: (id: string, shiftId: string) =>
      `/cash-registers/${id}/close-shift/${shiftId}`,
    shifts: (id: string) => `/cash-registers/${id}/shifts`,
  },
  inventories: {
    root: "/inventories",
    byId: (id: string) => `/inventories/${id}`,
    activate: (id: string) => `/inventories/${id}/activate`,
    deactivate: (id: string) => `/inventories/${id}/deactivate`,
  },
  inventoryMovements: {
    root: "/inventory-movements",
    adjustments: "/inventory-movements/adjustments",
    waste: "/inventory-movements/waste",
  },
  transfers: {
    root: "/transfers",
    stock: "/transfers/stock",
    dispatch: (id: string) => `/transfers/${id}/dispatch`,
    complete: (id: string) => `/transfers/${id}/complete`,
    cancel: (id: string) => `/transfers/${id}/cancel`,
  },
  customers: {
    root: "/customers",
    byId: (id: string) => `/customers/${id}`,
    activate: (id: string) => `/customers/${id}/activate`,
    deactivate: (id: string) => `/customers/${id}/deactivate`,
    checkUniqueness: "/customers/check-uniqueness",
  },
} as const;

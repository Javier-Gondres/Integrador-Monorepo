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
  },
  platform: {
    overview: "/platform/overview",
    companies: "/platform/companies",
    companyById: (id: string) => `/platform/companies/${id}`,
    activateCompany: (id: string) => `/platform/companies/${id}/activate`,
    deactivateCompany: (id: string) => `/platform/companies/${id}/deactivate`,
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
  dashboard: {
    summary: "/dashboard/summary",
  },
} as const;

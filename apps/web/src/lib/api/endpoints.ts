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
  },
  me: {
    profile: "/me",
    company: "/me/company",
  },
  products: {
    root: "/products",
    byId: (id: string) => `/products/${id}`,
    activate: (id: string) => `/products/${id}/activate`,
    deactivate: (id: string) => `/products/${id}/deactivate`,
  },
  categories: {
    root: "/categories",
    byId: (id: string) => `/categories/${id}`,
    activate: (id: string) => `/categories/${id}/activate`,
    deactivate: (id: string) => `/categories/${id}/deactivate`,
  },
  suppliers: {
    root: "/suppliers",
    byId: (id: string) => `/suppliers/${id}`,
  },
  employees: {
    root: "/employees",
    byId: (id: string) => `/employees/${id}`,
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
    roles: "/users/roles",
  },
} as const;

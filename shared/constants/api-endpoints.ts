// API Endpoints Constants for SafeTrade Platform

export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout'
  },
  
  // Reports (Spanish endpoints)
  REPORTS: {
    BASE: '/reportes',
    CREATE: '/reportes',
    BY_ID: (id: string) => `/reportes/${id}`,
    UPDATE_STATUS: (id: string) => `/reportes/${id}/estado`,
    ATTACHMENTS: (id: string) => `/reportes/${id}/adjuntos`,
    ANONYMOUS: '/reportes/anonimo'
  },
  
  // Community Trends (Spanish endpoints)  
  COMMUNITY: {
    BASE: '/tendencias-comunidad',
    TRENDS: '/tendencias-comunidad/tendencias',
    RECOMMENDATIONS: '/tendencias-comunidad/recomendaciones',
    ANALYTICS: '/tendencias-comunidad/analitica'
  },
  
  // Admin
  ADMIN: {
    BASE: '/admin',
    LOGIN: '/admin/login',
    DASHBOARD: '/admin/dashboard',
    REPORTS: '/reportes',
    USERS: '/admin/usuarios',
    ANALYTICS: '/admin/analitica'
  },
  
  // Health & Utils
  HEALTH: '/health',
  ROOT: '/'
} as const;
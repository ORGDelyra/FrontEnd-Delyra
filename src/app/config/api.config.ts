/**
 * CONFIGURACIÓN CENTRALIZADA DE API
 *
 * ⚠️ DESARROLLO: http://localhost:8000
 * 📦 PRODUCCIÓN: https://backend-delyra-production.up.railway.app (via proxy Vercel)
 *
 * En producción (Vercel), las peticiones /api/* se forwarden automáticamente
 * al backend mediante el archivo vercel.json (rewrites)
 */


// Configuración fija de backend (producción)
const BASE_BACKEND = 'https://backend-delyra-production.up.railway.app';


export const API_CONFIG = {
  // URL base del backend
  // Usa siempre la URL completa del backend
  BASE_URL: 'https://backend-delyra-production.up.railway.app', // PRODUCCIÓN
  endpoints: {
    auth: '/api',
    user: '/api/user',
    product: '/api/product',
    branch: '/api/branch',
    upload: '/api/upload/cloudinary',
    mercadoPago: '/api/mercado-pago'
  }
};

// Función auxiliar para construir URLs
export function getApiUrl(endpoint: string): string {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
}

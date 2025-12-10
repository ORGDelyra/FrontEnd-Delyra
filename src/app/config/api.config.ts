/**
 * CONFIGURACIÓN CENTRALIZADA DE API
 *
 * ⚠️ DESARROLLO: http://localhost:8000
 * 📦 PRODUCCIÓN: https://backend-delyra-production.up.railway.app (via proxy Vercel)
 *
 * En producción (Vercel), las peticiones /api/* se forwarden automáticamente
 * al backend mediante el archivo vercel.json (rewrites)
 */

// Detectar si está en desarrollo local
const isDevelopment = typeof window !== 'undefined' && 
                     (window.location.hostname === 'localhost' || 
                      window.location.hostname === '127.0.0.1');

export const API_CONFIG = {
  // URL base del backend
  // En desarrollo (localhost): usa http://localhost:8000
  // En producción (Vercel): usa rutas relativas /api/* (serán forwardeadas por vercel.json)
  BASE_URL: isDevelopment ? 'http://localhost:8000' : '',

  // Endpoints
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

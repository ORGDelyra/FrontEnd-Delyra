/**
 * CONFIGURACIÓN CENTRALIZADA DE API
 *
 * ⚠️ DESARROLLO: http://localhost:8000
 * 📦 PRODUCCIÓN: https://backend-delyra-production.up.railway.app
 *
 * Cambiar solo AQUÍ cuando pases de dev a producción
 */

export const API_CONFIG = {
  // URL base del backend
  BASE_URL: 'https://backend-delyra-production.up.railway.app',

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

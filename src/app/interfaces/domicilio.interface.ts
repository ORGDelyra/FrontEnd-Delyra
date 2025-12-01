// Interface para la tabla domicilios
export interface Domicilio {
  id?: number;
  id_usuario: number;
  estado_dispo?: string; // Por defecto 'activo'
  created_at?: string;
  updated_at?: string;
}

// Interface para crear domicilio
export interface CreateDomicilioRequest {
  estado_dispo?: string;
}


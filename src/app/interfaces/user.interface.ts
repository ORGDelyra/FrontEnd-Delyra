// Interface para la tabla users
export interface User {
  id?: number;
  id_rol: number;
  primer_nombre: string;
  segundo_nombre?: string;
  primer_apellido: string;
  segundo_apellido?: string;
  telefono: string;
  estado_cuenta?: boolean;
  correo: string;
  password: string;
  cuenta_bancaria: string;
  remember_token?: string;
  created_at?: string;
  updated_at?: string;
}

// Interface para el rol
export interface Rol {
  id?: number;
  nombre: string;
  created_at?: string;
  updated_at?: string;
}

// Interface para login
export interface LoginRequest {
  correo: string;
  password: string;
}

// Interface para respuesta de login
export interface LoginResponse {
  token?: string;
  user?: User;
  message?: string;
}

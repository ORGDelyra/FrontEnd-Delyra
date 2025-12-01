// Interface para la tabla branches (Sucursales del vendedor)
export interface Branch {
  id?: number;
  id_usuario: number;
  nombre_sucursal: string;
  nit: string;
  img_nit: string;
  logo_comercio?: string;
  latitud?: string;
  longitud?: string;
  direccion?: string;
  created_at?: string;
  updated_at?: string;
}

// Interface para crear sucursal
export interface CreateBranchRequest {
  nombre_sucursal: string;
  nit: string;
  img_nit: string;
  logo_comercio?: string;
  latitud?: string;
  longitud?: string;
  direccion?: string;
}

// Interface para la tabla products
export interface Product {
  id?: number;
  id_usuario: number;
  id_categoria: number;
  id_sucursal?: number;
  nombre: string;
  descripcion?: string;
  precio: number;
  cantidad: number;
  images?: ProductImage[];  // Array de imágenes relacionadas
  category?: Category;      // Relación con categoría
  created_at?: string;
  updated_at?: string;
}

// Interface para imágenes del producto (tabla images - polimórfica)
export interface ProductImage {
  id?: number;
  url: string;
  type: string;  // 'product' o 'comprobante'
  descripcion?: string;
  imageable_id: number;
  imageable_type: string;
  created_at?: string;
  updated_at?: string;
}

// Interface para categoría
export interface Category {
  id?: number;
  nombre_categoria: string;
  created_at?: string;
  updated_at?: string;
}

// Interface para crear/editar producto
export interface CreateProductRequest {
  id_categoria: number;
  nombre: string;
  descripcion?: string;
  precio: number;
  cantidad: number;
}

// Interface para editar producto
export interface UpdateProductRequest extends Partial<CreateProductRequest> {
  id?: number;
}


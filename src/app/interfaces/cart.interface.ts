// Interface para la tabla carts (Pedidos)
export interface Cart {
  id?: number;
  id_usuario?: number;
  id_cliente?: number;
  activo?: boolean | number;  // Indica si es el carrito activo del usuario
  tipo_entrega?: 'recogida' | 'domicilio';
  direccion_entrega?: string | null;
  latitud_entrega?: string | null;
  longitud_entrega?: string | null;
  id_domiciliario?: number | null;
  estado_pedido?: 'pendiente' | 'confirmado' | 'en_preparacion' | 'listo' | 'entregado' | 'recogido';
  total?: number;
  created_at?: string;
  updated_at?: string;
  // Relaciones
  usuario?: {
    id: number;
    nombre_completo?: string;
    primer_nombre?: string;
    primer_apellido?: string;
    telefono?: string;
    correo?: string;
  };
  cliente?: {
    nombre_completo: string;
    telefono: string;
    correo: string;
  };
  domiciliario?: {
    id: number;
    nombre_completo: string;
    telefono: string;
  } | null;
  productos?: ProductoPedido[];
}

// Interface para productos en un pedido
export interface ProductoPedido {
  id?: number;
  id_producto?: number;
  nombre?: string;
  cantidad: number;
  precio_unitario: number;
  subtotal?: number;
}

// Interface para product_selects
export interface ProductSelect {
  id_producto: number;
  id_carrito: number;
  cantidad: number;
  created_at?: string;
  updated_at?: string;
}

// Interface para payment_transactions
export interface PaymentTransaction {
  id?: number;
  id_carrito: number;
  monto: number;
  metodo_pago: string;
  estado?: string; // Por defecto 'no pagado'
  created_at?: string;
  updated_at?: string;
}

// Interface para shipments
export interface Shipment {
  id?: number;
  id_transaccion: number;
  id_servicio?: number; // Referencia a domicilios.id
  fecha_estimada: string; // Formato DATE
  estado?: string; // Por defecto 'espera'
  total: number;
  created_at?: string;
  updated_at?: string;
}

// Interface para agregar producto al carrito
export interface AddToCartRequest {
  id_producto: number;
  cantidad: number;
}

// Interface para crear pedido
export interface CrearPedidoRequest {
  productos: {
    id_producto: number;
    cantidad: number;
    precio_unitario: number;
  }[];
  tipo_entrega: 'recogida' | 'domicilio';
  direccion_entrega?: string;
  latitud_entrega?: string;
  longitud_entrega?: string;
}

// Interface para actualizar estado del pedido
export interface ActualizarEstadoRequest {
  estado_pedido: 'pendiente' | 'confirmado' | 'en_preparacion' | 'listo' | 'entregado' | 'recogido';
}

// Interface para asignar domiciliario
export interface AsignarDomiciliarioRequest {
  id_domiciliario: number;
}

// Interface para marcar como entregado
export interface MarcarEntregadoRequest {
  codigo_confirmacion?: string;
  comentario?: string;
}

// Interface para marcar como recogido
export interface MarcarRecogidoRequest {
  comentario?: string;
}


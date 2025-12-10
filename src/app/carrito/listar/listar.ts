import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CarritoService } from '../../services/carrito.service';
import { ProductosService } from '../../services/productos.service';
import { PedidosService } from '../../services/pedidos.service';
import { ImageUploadService } from '../../services/image-upload.service';
import { MercadoPagoService } from '../../services/mercado-pago.service';
import { MonedaColombianaPipe } from '../../pipes/moneda-colombiana.pipe';
import { SelectorUbicacion } from '../selector-ubicacion/selector-ubicacion';
import { Product } from '../../interfaces/product.interface';
import { Cart, ProductSelect } from '../../interfaces/cart.interface';

@Component({
  selector: 'app-listar',
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule, MonedaColombianaPipe, SelectorUbicacion],
  templateUrl: './listar.html',
  styleUrl: './listar.css',
})
export class ListarCarrito implements OnInit {

  productos: Array<Product & { cantidad: number }> = [];
  total: number = 0;
  subtotal: number = 0;
  envio: number = 3000; // Costo fijo de envío en COP ($3.000)
  servicio: number = 0; // 5% del subtotal
  cargando: boolean = false;
  carritoId: number | null = null;
  tipoEntrega: 'recogida' | 'domicilio' = 'domicilio';
  metodoPago: string = 'efectivo';
  direccionEntrega: string = '';
  latitudEntrega: string = '';
  longitudEntrega: string = '';
  mensajeError: string = '';
  mensajeExito: string = '';
  comprobantePago: string = '';
  cargandoComprobante: boolean = false;
  notificacion: { tipo: 'error' | 'exito' | 'info'; mensaje: string } | null = null;
  procesandoPago: boolean = false;

  constructor(
    private carritoService: CarritoService,
    private productosService: ProductosService,
    private pedidosService: PedidosService,
    private imageUploadService: ImageUploadService,
    private mercadoPagoService: MercadoPagoService,
    private router: Router
  ) {}

  ngOnInit() {
    this.cargarCarrito();
  }

  mostrarNotificacion(tipo: 'error' | 'exito' | 'info', mensaje: string) {
    this.notificacion = { tipo, mensaje };
    setTimeout(() => {
      this.notificacion = null;
    }, 4000);
  }

  cargarCarrito() {
    this.cargando = true;

    // Obtener todos los carritos del usuario y buscar el activo
    this.carritoService.obtenerCarritos().subscribe({
      next: (carts: Cart[]) => {
        console.log('🛒 Carritos recibidos del backend:', carts);

        // Buscar el carrito activo sin estado_pedido
        const carritoActivo = carts.find(c => (c.activo === true || c.activo === 1) && !c.estado_pedido);

        console.log('🎯 Carrito activo encontrado:', carritoActivo);

        if (carritoActivo && carritoActivo.id) {
          this.carritoId = carritoActivo.id;

          // Si el carrito viene con productos incluidos
          if ((carritoActivo as any).products && Array.isArray((carritoActivo as any).products)) {
            console.log('📦 Productos en el carrito:', (carritoActivo as any).products);
            this.productos = (carritoActivo as any).products.map((p: any) => ({
              ...p,
              stock: p.cantidad || 0,  // Guardar el stock real del producto
              cantidad: p.pivot?.cantidad || 1  // Cantidad en el carrito
            }));
            this.calcularTotal();
          } else {
            console.warn('⚠️ El carrito no tiene productos o no vienen en la respuesta');
            this.productos = [];
          }
        } else {
          // No hay carrito activo - El carrito se creará automáticamente cuando el usuario agregue un producto
          console.log('ℹ️ No hay carrito activo');
          this.carritoId = null;
          this.productos = [];
        }
        this.cargando = false;
      },
      error: (err) => {
        console.error("Error al cargar carritos:", err);
        // No hay carritos - El carrito se creará automáticamente cuando el usuario agregue un producto
        this.carritoId = null;
        this.productos = [];
        this.cargando = false;
      }
    });
  }

  actualizarCantidad(producto: Product & { cantidad: number; stock?: number; cantidadCarrito?: number }, nuevaCantidad: number) {
    if (nuevaCantidad < 1) {
      this.mostrarNotificacion('error', 'La cantidad debe ser al menos 1');
      return;
    }

    // Verificar si excede el stock disponible
    const stockDisponible = producto.stock || producto.cantidad || 0;  // usar stock si existe, sino cantidad

    if (nuevaCantidad > stockDisponible) {
      this.mostrarNotificacion('error', 'La cantidad que seleccionaste supera las existencias actuales de este producto');
      return;
    }

    if (!this.carritoId || !producto.id) return;

    const cantidadAnterior = producto.cantidad;
    producto.cantidad = nuevaCantidad;

    this.carritoService.actualizarCantidadProducto(this.carritoId, producto.id, nuevaCantidad).subscribe({
      next: (response) => {
        this.calcularTotal();
        this.mostrarNotificacion('exito', 'Cantidad actualizada correctamente');
      },
      error: (err) => {
        // Revertir cantidad si falla
        producto.cantidad = cantidadAnterior;

        if (err.status === 400 && err.error?.stock_disponible !== undefined) {
          this.mostrarNotificacion('error', `Solo hay ${err.error.stock_disponible} unidades disponibles de ${producto.nombre}`);
        } else if (err.error?.mensaje) {
          this.mostrarNotificacion('error', err.error.mensaje);
        } else {
          this.mostrarNotificacion('error', 'Error al actualizar la cantidad. Intenta de nuevo.');
        }
      }
    });
  }

  eliminarProducto(producto: Product & { cantidad: number }) {
    if (!this.carritoId || !producto.id) return;

    if (!confirm(`¿Estás seguro de eliminar ${producto.nombre} del carrito?`)) {
      return;
    }

    this.carritoService.eliminarProductoDelCarrito(this.carritoId, producto.id).subscribe({
      next: () => {
        this.productos = this.productos.filter(p => p.id !== producto.id);
        this.calcularTotal();
      },
      error: (err) => {
        console.error("Error al eliminar producto:", err);
        alert('Error al eliminar el producto');
      }
    });
  }

  calcularTotal() {
    this.subtotal = this.productos.reduce((sum, p) => sum + (p.precio * p.cantidad), 0);
    this.servicio = this.subtotal * 0.05; // 5% de servicio
    // Si es recogida, no hay costo de envío
    this.envio = this.tipoEntrega === 'domicilio' ? 3000 : 0; // $3.000 COP para domicilio
    this.total = this.subtotal + this.envio + this.servicio;
  }

  /**
   * Recibe los datos de ubicación desde el selector de mapa
   */
  onUbicacionSeleccionada(ubicacion: { direccion: string; latitud: string; longitud: string }) {
    this.direccionEntrega = ubicacion.direccion;
    this.latitudEntrega = ubicacion.latitud;
    this.longitudEntrega = ubicacion.longitud;
    this.mostrarNotificacion('exito', '✅ Ubicación confirmada');
  }

  procederAlPago() {
    if (this.productos.length === 0) {
      this.mensajeError = 'Tu carrito está vacío';
      return;
    }

    // Validar campos según tipo de entrega
    if (this.tipoEntrega === 'domicilio') {
      if (!this.direccionEntrega.trim()) {
        this.mensajeError = 'Por favor ingresa la dirección de entrega';
        return;
      }
      if (!this.latitudEntrega || !this.longitudEntrega) {
        this.mensajeError = 'Por favor permite el acceso a tu ubicación o ingrésala manualmente';
        return;
      }
    }

    this.procesandoPago = true;
    this.cargando = true;
    this.mensajeError = '';
    this.mensajeExito = '';

    // Preparar datos del pedido
    const productosPedido = this.productos.map(p => ({
      id_producto: p.id!,
      cantidad: p.cantidad,
      precio_unitario: p.precio
    }));

    const datosPedido: any = {
      productos: productosPedido,
      tipo_entrega: this.tipoEntrega,
      metodo_pago: this.metodoPago,
      total: this.total,
      subtotal: this.subtotal,
      costo_envio: this.envio,
      costo_servicio: this.servicio
    };

    // Si es domicilio, agregar dirección y coordenadas
    if (this.tipoEntrega === 'domicilio') {
      datosPedido.direccion_entrega = this.direccionEntrega;
      datosPedido.latitud_entrega = this.latitudEntrega;
      datosPedido.longitud_entrega = this.longitudEntrega;
    }

    // Lógica de flujos de pago según tipo de entrega y método de pago
    if (this.tipoEntrega === 'domicilio' && this.metodoPago === 'mercado-pago') {
      // Flujo 1: Domicilio + Mercado Pago (Pago Online)
      // Primero crear el pedido, luego iniciar pago
      this.crearPedidoParaMercadoPago(datosPedido);
    } else if (this.tipoEntrega === 'domicilio' && this.metodoPago === 'contraentrega') {
      // Flujo 2: Domicilio + Contraentrega (Pago Contra Entrega)
      this.crearPedidoSinPago(datosPedido);
    } else if (this.tipoEntrega === 'recogida') {
      // Flujo 3: Recogida en Tienda + Efectivo Local (Pago en Tienda)
      this.crearPedidoSinPago(datosPedido);
    } else {
      // Fallback: Crear pedido sin pago online
      this.crearPedidoSinPago(datosPedido);
    }
  }

  /**
   * Crea pedido primero, luego inicia pago con Mercado Pago
   */
  private crearPedidoParaMercadoPago(datosPedido: any) {
    this.pedidosService.crearPedido(datosPedido).subscribe({
      next: (resultado: any) => {
        // El pedido fue creado exitosamente, obtener su ID con tolerancia a estructuras distintas
        const pedidoId = resultado?.id
          ?? resultado?.pedido_id
          ?? resultado?.pedidoId
          ?? resultado?.pedido?.id
          ?? resultado?.cart?.id
          ?? resultado?.carrito?.id
          ?? resultado?.data?.id;

        if (!pedidoId) {
          this.mensajeError = 'Error: no se obtuvo ID del pedido (respuesta inesperada del backend)';
          this.procesandoPago = false;
          this.cargando = false;
          return;
        }

        // Ahora iniciar el pago con Mercado Pago
        this.iniciarPagoMercadoPago(pedidoId);
      },
      error: (err) => {
        console.error("❌ Error al crear pedido para MP:", err);
        let mensajeError = 'Error al crear el pedido. Por favor intenta de nuevo.';
        if (err.error?.mensaje) {
          mensajeError = err.error.mensaje;
        }
        this.mensajeError = mensajeError;
        this.procesandoPago = false;
        this.cargando = false;
      }
    });
  }

  /**
   * Inicia flujo de pago con Mercado Pago
   */
  private iniciarPagoMercadoPago(pedidoId: number) {
    // Obtener datos del usuario autenticado
    const usuarioData = JSON.parse(localStorage.getItem('usuarioData') || '{}');

    // Crear preferencia de pago en Mercado Pago
    this.mercadoPagoService.crearPreferenciaPago({
      pedidoId: pedidoId,
      items: this.productos.map(p => ({
        id: `SKU-${p.id}`,
        title: p.nombre,
        quantity: p.cantidad,
        unit_price: Math.round(p.precio) // Asegurar que es entero en COP
      })),
      total: Math.round(this.total), // Total en COP (entero sin decimales)
      cliente: {
        nombre: usuarioData.nombre || 'Cliente',
        email: usuarioData.email || '',
        telefono: usuarioData.telefono || ''
      }
    }).subscribe({
      next: (respuesta: any) => {
        // Backend retorna: { mensaje, preference_id, init_point, pedido_id }
        if (respuesta.init_point) {
          // Redirigir a Mercado Pago
          window.location.href = respuesta.init_point;
        } else {
          this.mensajeError = 'Error al iniciar Mercado Pago. Por favor intenta de nuevo.';
          this.procesandoPago = false;
          this.cargando = false;
        }
      },
      error: (err) => {
        console.error("❌ Error al crear preferencia de Mercado Pago:", err);
        this.mensajeError = 'Error al procesar el pago. Por favor intenta de nuevo.';
        this.procesandoPago = false;
        this.cargando = false;
      }
    });
  }

  /**
   * Crea pedido sin requerir pago online (contraentrega o recogida)
   */
  private crearPedidoSinPago(datosPedido: any) {
    this.pedidosService.crearPedido(datosPedido).subscribe({
      next: (resultado: any) => {
        this.mensajeExito = resultado.mensaje || 'Pedido creado exitosamente';
        localStorage.removeItem('carritoId');
        this.carritoId = null;
        this.productos = [];
        this.total = 0;
        this.procesandoPago = false;
        this.cargando = false;
        setTimeout(() => {
          this.router.navigate(['/cliente/pedidos']);
        }, 2000);
      },
      error: (err) => {
        console.error("❌ Error completo al crear pedido:", err);
        console.error("📋 Respuesta del servidor:", err.error);

        // Extraer mensaje de error más limpio
        let mensajeError = 'Error al crear el pedido. Por favor intenta de nuevo.';
        if (err.error?.mensaje) {
          mensajeError = err.error.mensaje;
        } else if (err.error?.message) {
          mensajeError = err.error.message;
        } else if (err.message) {
          mensajeError = err.message;
        }

        // Si el error menciona domiciliario, dar contexto
        if (mensajeError.toLowerCase().includes('domiciliario')) {
          mensajeError = 'Tu pedido ha sido recibido pero hay un problema en el sistema. Por favor contacta con soporte.';
          console.error("🐛 BUG: El backend está requiriendo domiciliario al crear pedido (no debería)");
        }

        this.mensajeError = mensajeError;
        this.cargando = false;
      }
    });
  }

  async onComprobanteSeleccionado(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    this.cargandoComprobante = true;

    // Usar validateDocument en lugar de validateImage para PDFs y otros documentos
    const validacion = await this.imageUploadService.validateDocument(file);

    if (!validacion.valid) {
      this.mensajeError = validacion.error || 'Error en la validación del archivo';
      this.cargandoComprobante = false;
      return;
    }

    try {
      const response = await this.imageUploadService.uploadImage(file);
      this.comprobantePago = response.secure_url;
      this.mensajeExito = 'Comprobante de pago adjuntado correctamente';
      this.cargandoComprobante = false;
      setTimeout(() => this.mensajeExito = '', 3000);
    } catch (err: any) {
      this.mensajeError = 'Error al subir el comprobante: ' + (err?.message || '');
      this.cargandoComprobante = false;
    }
  }
}

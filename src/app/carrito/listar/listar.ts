import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CarritoService } from '../../services/carrito.service';
import { ProductosService } from '../../services/productos.service';
import { PedidosService } from '../../services/pedidos.service';
import { ImageUploadService } from '../../services/image-upload.service';
import { Product } from '../../interfaces/product.interface';
import { Cart, ProductSelect } from '../../interfaces/cart.interface';

@Component({
  selector: 'app-listar',
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule],
  templateUrl: './listar.html',
  styleUrl: './listar.css',
})
export class ListarCarrito implements OnInit {

  productos: Array<Product & { cantidad: number }> = [];
  total: number = 0;
  subtotal: number = 0;
  envio: number = 3000; // Costo fijo de envío
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

  constructor(
    private carritoService: CarritoService,
    private productosService: ProductosService,
    private pedidosService: PedidosService,
    private imageUploadService: ImageUploadService,
    private router: Router
  ) {}

  ngOnInit() {
    this.cargarCarrito();
  }

  cargarCarrito() {
    this.cargando = true;
    // Usar el método especial de ProductController para obtener el carrito del usuario actual
    this.carritoService.obtenerCarritoUsuarioActual().subscribe({
      next: (cart: Cart) => {
        if (cart && cart.id) {
          this.carritoId = cart.id;
          // El carrito viene con productos incluidos (si el backend lo permite)
          if ((cart as any).products && Array.isArray((cart as any).products)) {
            this.productos = (cart as any).products.map((p: any) => ({
              ...p,
              cantidad: p.pivot?.cantidad || 1
            }));
            this.calcularTotal();
          } else {
            this.cargarProductosDelCarrito();
          }
        } else {
          // Si no hay carrito, crear uno nuevo
          this.crearCarrito();
        }
        this.cargando = false;
      },
      error: (err) => {
        console.error("Error al cargar carrito:", err);
        // Si no hay carrito activo, crear uno nuevo
        this.crearCarrito();
      }
    });
  }

  crearCarrito() {
    this.carritoService.crearCarrito().subscribe({
      next: (cart: Cart) => {
        this.carritoId = cart.id || null;
        if (this.carritoId) {
          localStorage.setItem('carritoId', this.carritoId.toString());
        }
      },
      error: (err) => console.error("Error al crear carrito:", err)
    });
  }

  cargarProductosDelCarrito() {
    if (!this.carritoId) return;

    // Nota: El backend debería devolver los productos en el carrito
    // Si usa ProductController.viewCart, los productos vienen incluidos
    // Por ahora intentamos obtenerlos directamente del carrito
    this.carritoService.obtenerCarritoPorId(this.carritoId).subscribe({
      next: (cart: Cart) => {
        if ((cart as any).products) {
          this.productos = (cart as any).products.map((p: any) => ({
            ...p,
            cantidad: p.pivot?.cantidad || 1
          }));
          this.calcularTotal();
        }
      },
      error: (err) => {
        console.error("Error al cargar productos del carrito:", err);
      }
    });
  }

  actualizarCantidad(producto: Product & { cantidad: number }, nuevaCantidad: number) {
    if (nuevaCantidad < 1) return;
    if (!this.carritoId || !producto.id) return;

    producto.cantidad = nuevaCantidad;
    this.carritoService.actualizarCantidadProducto(this.carritoId, producto.id, nuevaCantidad).subscribe({
      next: () => {
        this.calcularTotal();
      },
      error: (err) => {
        console.error("Error al actualizar cantidad:", err);
        // Revertir cantidad si falla
        producto.cantidad = nuevaCantidad - (nuevaCantidad > producto.cantidad ? 1 : -1);
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
    this.envio = this.tipoEntrega === 'domicilio' ? 3000 : 0;
    this.total = this.subtotal + this.envio + this.servicio;
  }

  obtenerUbicacion() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.latitudEntrega = position.coords.latitude.toString();
          this.longitudEntrega = position.coords.longitude.toString();
        },
        (error) => {
          console.error('Error al obtener ubicación:', error);
          this.mensajeError = 'No se pudo obtener tu ubicación. Por favor ingrésala manualmente.';
        }
      );
    }
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
      tipo_entrega: this.tipoEntrega
    };

    // Si es domicilio, agregar dirección y coordenadas
    if (this.tipoEntrega === 'domicilio') {
      datosPedido.direccion_entrega = this.direccionEntrega;
      datosPedido.latitud_entrega = this.latitudEntrega;
      datosPedido.longitud_entrega = this.longitudEntrega;
    }

    // Crear pedido usando el nuevo endpoint
    this.pedidosService.crearPedido(datosPedido).subscribe({
      next: (resultado: any) => {
        this.mensajeExito = resultado.mensaje || 'Pedido creado exitosamente';
        localStorage.removeItem('carritoId');
        this.carritoId = null;
        this.productos = [];
        this.total = 0;
        setTimeout(() => {
          this.router.navigate(['/cliente/pedidos']);
        }, 2000);
      },
      error: (err) => {
        console.error("Error al crear pedido:", err);
        this.mensajeError = err.error?.mensaje || 'Error al crear el pedido. Por favor intenta de nuevo.';
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

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProductosService } from '../../services/productos.service';
import { CarritoService } from '../../services/carrito.service';
import { Product } from '../../interfaces/product.interface';
import { Branch } from '../../interfaces/branch.interface';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-perfil-tienda',
  standalone: true,
  imports: [ CommonModule, RouterModule ],
  templateUrl: './perfil.html',
  styleUrl: './perfil.css',
})
export class PerfilTienda implements OnInit {

  sucursal: Branch | null = null;
  productos: Product[] = [];
  cargando: boolean = false;
  sucursalId: number | null = null;
  mensajeExito: string = '';
  mensajeError: string = '';

  private api = 'http://127.0.0.1:8000/api';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productosService: ProductosService,
    private carritoService: CarritoService,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.sucursalId = +params['id'];
      if (this.sucursalId) {
        this.cargarSucursal();
        this.cargarProductos();
      }
    });
  }

  cargarSucursal() {
    console.log(`🏪 Cargando información de sucursal ${this.sucursalId}...`);
    // Endpoint público para ver info de sucursal
    this.http.get<Branch>(`${this.api}/branch/${this.sucursalId}`).subscribe({
      next: (sucursal) => {
        this.sucursal = sucursal;
        console.log('✅ Sucursal cargada:', sucursal);
      },
      error: (err) => {
        console.error('❌ Error al cargar sucursal:', err);
        this.mensajeError = 'No se pudo cargar la información de la tienda';
      }
    });
  }

  cargarProductos() {
    if (!this.sucursalId) return;

    this.cargando = true;
    console.log(`📦 Cargando productos de sucursal ${this.sucursalId}...`);

    this.productosService.obtenerProductosPorSucursal(this.sucursalId).subscribe({
      next: (productos) => {
        this.productos = productos;
        console.log(`✅ ${productos.length} productos cargados`);
        console.log('📦 Productos recibidos:', productos);
        if (productos.length === 0) {
          console.warn('⚠️ El backend devolvió 0 productos. Verifica:');
          console.warn('   1. Que existan productos con id_sucursal = ' + this.sucursalId);
          console.warn('   2. Que el endpoint /api/products/branch/{id} esté filtrando correctamente');
        }
        this.cargando = false;
      },
      error: (err) => {
        console.error('❌ Error al cargar productos:', err);
        this.mensajeError = 'No se pudieron cargar los productos';
        this.cargando = false;
      }
    });
  }

  agregarAlCarrito(producto: Product) {
    if (!producto.id) {
      this.mensajeError = 'Error: Producto no válido';
      return;
    }

    console.log(`🛒 Agregando producto ${producto.id} al carrito...`);

    this.carritoService.agregarProductoAlCarrito(producto.id, 1).subscribe({
      next: (response) => {
        console.log('✅ Producto agregado al carrito:', response);
        console.log('📦 Cart devuelto por el backend:', response.cart);
        console.log('🔍 Cart ID:', response.cart?.id);
        console.log('✓ Activo:', response.cart?.activo);
        console.log('📋 Estado pedido:', response.cart?.estado_pedido);
        console.log('🛍️ Cantidad de productos en cart:', response.cart?.products?.length);

        // Expandir productos para ver detalles
        if (response.cart?.products) {
          console.log('📦 PRODUCTOS DETALLADOS:');
          response.cart.products.forEach((p: any, index: number) => {
            console.log(`  ${index + 1}. ID: ${p.id}, Nombre: ${p.nombre}, Cantidad: ${p.pivot?.cantidad || '?'}`);
          });
        }

        this.mensajeExito = `✅ ${producto.nombre} agregado al carrito`;
        setTimeout(() => this.mensajeExito = '', 3000);
      },
      error: (err) => {
        console.error('❌ Error al agregar al carrito:', err);
        console.error('📋 Status:', err.status);
        console.error('💬 Mensaje del backend:', err.error);

        let mensaje = 'Error al agregar al carrito';

        if (err.status === 401 || err.status === 403) {
          mensaje = 'Debes iniciar sesión como cliente para agregar productos al carrito';
        } else if (err.status === 500) {
          mensaje = err.error?.mensaje || err.error?.message || 'Error del servidor. Verifica que el endpoint /add-to-cart esté implementado en el backend';
        } else if (err.error?.mensaje) {
          mensaje = err.error.mensaje;
        } else if (err.error?.message) {
          mensaje = err.error.message;
        }

        this.mensajeError = mensaje;
        setTimeout(() => this.mensajeError = '', 5000);
      }
    });
  }

  abrirChat() {
    if (!this.sucursalId) return;
    // Redirigir a la página de chat con el vendedor de esta sucursal
    this.router.navigate(['/cliente/chat', this.sucursalId]);
  }

  verCarrito() {
    this.router.navigate(['/carrito/listar']);
  }
}

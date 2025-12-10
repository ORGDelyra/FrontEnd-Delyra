import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MapaUsuarios } from '../../mapa/mapa-usuarios';
import { ProductosService } from '../../services/productos.service';
import { CarritoService } from '../../services/carrito.service';
import { MonedaColombianaPipe } from '../../pipes/moneda-colombiana.pipe';
import { Category, Product } from '../../interfaces/product.interface';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule, MapaUsuarios, MonedaColombianaPipe],
  templateUrl: './inicio.html',
  styleUrl: './inicio.css',
})
export class InicioCliente implements OnInit {

  categorias: Category[] = [];
  productosDestacados: Product[] = [];
  terminoBusqueda: string = '';
  categoriaSeleccionada: string = 'Todas';
  menuAbierto: boolean = false;
  cargandoProductos: boolean = false;

  // Variables para el modal de cantidad
  mostrarModalCantidad: boolean = false;
  productoSeleccionado: Product | null = null;
  cantidadSeleccionada: number = 1;
  Infinity = Infinity;

  constructor(
    private router: Router,
    private productosService: ProductosService,
    private carritoService: CarritoService
  ) {}

  ngOnInit() {
    this.cargarCategorias();
    this.cargarProductosDestacados();
  }

  cargarCategorias() {
    this.productosService.obtenerCategorias().subscribe({
      next: (cats: Category[]) => {
        this.categorias = cats;
      },
      error: (err) => {
        console.error("Error al cargar categorías:", err);
      }
    });
  }

  cargarProductosDestacados() {
    this.cargandoProductos = true;
    this.productosService.obtenerProductos().subscribe({
      next: (prods: Product[]) => {
        // Mostrar solo los primeros 8 productos como destacados
        this.productosDestacados = prods.slice(0, 8);
        this.cargandoProductos = false;
      },
      error: (err) => {
        console.error("Error al cargar productos destacados:", err);
        this.cargandoProductos = false;
      }
    });
  }

  seleccionarCategoria(categoria: string) {
    this.categoriaSeleccionada = categoria;
    this.router.navigate(['/productos/listar'], {
      queryParams: { categoria: categoria !== 'Todas' ? categoria : null }
    });
  }

  buscar() {
    if (this.terminoBusqueda.trim()) {
      this.router.navigate(['/productos/listar'], {
        queryParams: { busqueda: this.terminoBusqueda }
      });
    }
  }

  verTodosLosProductos() {
    this.router.navigate(['/productos/listar']);
  }

  abrirModalCantidad(producto: Product) {
    if (!producto.id) {
      alert('Error: Producto no válido');
      return;
    }
    this.productoSeleccionado = { ...producto };
    this.cantidadSeleccionada = 1;
    this.mostrarModalCantidad = true;
  }

  cerrarModalCantidad() {
    this.mostrarModalCantidad = false;
    this.productoSeleccionado = null;
    this.cantidadSeleccionada = 1;
  }

  obtenerStockDisponible(): number {
    return this.productoSeleccionado?.stock || this.productoSeleccionado?.cantidad || Infinity;
  }

  puedeIncrementar(): boolean {
    return this.cantidadSeleccionada < this.obtenerStockDisponible();
  }

  incrementarCantidad() {
    const stockDisponible = this.productoSeleccionado?.stock || this.productoSeleccionado?.cantidad || Infinity;
    if (this.cantidadSeleccionada < stockDisponible) {
      this.cantidadSeleccionada++;
    }
  }

  decrementarCantidad() {
    if (this.cantidadSeleccionada > 1) {
      this.cantidadSeleccionada--;
    }
  }

  confirmarAgregarAlCarrito() {
    if (!this.productoSeleccionado || !this.productoSeleccionado.id) {
      alert('Error: Producto no válido');
      return;
    }

    this.carritoService.agregarProductoAlCarrito(this.productoSeleccionado.id, this.cantidadSeleccionada).subscribe({
      next: (res: any) => {
        console.log("Producto agregado al carrito:", res);
        alert(`✅ ${this.cantidadSeleccionada}x ${this.productoSeleccionado!.nombre} agregado al carrito`);
        this.cerrarModalCantidad();
      },
      error: (err: any) => {
        console.error("Error al agregar producto:", err);
        alert(err.error?.mensaje || `Error al agregar ${this.productoSeleccionado!.nombre} al carrito`);
      }
    });
  }

  agregarAlCarrito(producto: Product) {
    if (!producto.id) {
      alert('Error: Producto no válido');
      return;
    }

    this.carritoService.agregarProductoAlCarrito(producto.id, 1).subscribe({
      next: (res: any) => {
        console.log("Producto agregado al carrito:", res);
        alert(`✅ ${producto.nombre} agregado al carrito`);
      },
      error: (err: any) => {
        console.error("Error al agregar producto:", err);
        alert(err.error?.mensaje || `Error al agregar ${producto.nombre} al carrito`);
      }
    });
  }

  cerrarSesion() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.router.navigate(['/bienvenida']);
  }

  toggleMenu() {
    this.menuAbierto = !this.menuAbierto;
  }

  cerrarMenu() {
    this.menuAbierto = false;
  }
}

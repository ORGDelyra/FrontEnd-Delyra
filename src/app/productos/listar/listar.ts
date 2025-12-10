import { Component, OnInit } from '@angular/core';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductosService } from '../../services/productos.service';
import { CarritoService } from '../../services/carrito.service';
import { MonedaColombianaPipe } from '../../pipes/moneda-colombiana.pipe';
import { Product, Category } from '../../interfaces/product.interface';

@Component({
  selector: 'app-listar',
  standalone: true,
  imports: [RouterModule, CommonModule, MonedaColombianaPipe, FormsModule],
  templateUrl: './listar.html',
  styleUrl: './listar.css',
})
export class ListarProductos implements OnInit {

  productos: Product[] = [];
  productosFiltrados: Product[] = [];
  categorias: Category[] = [];
  categoriaSeleccionada: string = 'Todas';
  terminoBusqueda: string = '';
  cargando: boolean = false;

  // Variables para el modal de cantidad
  mostrarModalCantidad: boolean = false;
  productoSeleccionado: Product | null = null;
  cantidadSeleccionada: number = 1;
  Infinity = Infinity;

  constructor(
    private productosService: ProductosService,
    private carritoService: CarritoService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.categoriaSeleccionada = params['categoria'] || 'Todas';
      this.terminoBusqueda = params['busqueda'] || '';
      this.cargarProductos();
    });
    this.cargarCategorias();
  }

  cargarCategorias() {
    this.productosService.obtenerCategorias().subscribe({
      next: (cats: Category[]) => {
        this.categorias = cats;
      },
      error: (err) => console.error("Error al cargar categorías:", err)
    });
  }

  cargarProductos() {
    this.cargando = true;
    this.productosService.obtenerProductos().subscribe({
      next: (prods: Product[]) => {
        this.productos = prods;
        this.aplicarFiltros();
        this.cargando = false;
      },
      error: (err) => {
        console.error("Error al cargar productos:", err);
        this.cargando = false;
      }
    });
  }

  aplicarFiltros() {
    let filtrados = [...this.productos];

    // Filtro por categoría
    if (this.categoriaSeleccionada !== 'Todas') {
      filtrados = filtrados.filter(p =>
        this.categorias.find(c => c.id === p.id_categoria)?.nombre_categoria === this.categoriaSeleccionada
      );
    }

    // Filtro por búsqueda
    if (this.terminoBusqueda) {
      filtrados = filtrados.filter(p =>
        p.nombre.toLowerCase().includes(this.terminoBusqueda.toLowerCase()) ||
        (p.descripcion && p.descripcion.toLowerCase().includes(this.terminoBusqueda.toLowerCase()))
      );
    }

    this.productosFiltrados = filtrados;
  }

  onBusquedaChange() {
    this.aplicarFiltros();
  }

  abrirModalCantidad(producto: Product) {
    if (!producto.id) {
      alert('Error: Producto no válido');
      return;
    }
    this.productoSeleccionado = producto;
    this.cantidadSeleccionada = 1;
    this.mostrarModalCantidad = true;
  }

  cerrarModalCantidad() {
    this.mostrarModalCantidad = false;
    this.productoSeleccionado = null;
    this.cantidadSeleccionada = 1;
  }

  incrementarCantidad() {
    const stockDisponible = this.productoSeleccionado?.stock || this.productoSeleccionado?.cantidad || Infinity;
    if (this.cantidadSeleccionada < stockDisponible) {
      this.cantidadSeleccionada++;
    }
  }

  obtenerStockDisponible(): number {
    return this.productoSeleccionado?.stock || this.productoSeleccionado?.cantidad || Infinity;
  }

  puedeIncrementar(): boolean {
    return this.cantidadSeleccionada < this.obtenerStockDisponible();
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

  filtrarPorCategoria(categoria: string) {
    this.categoriaSeleccionada = categoria;
    this.aplicarFiltros();
    this.router.navigate(['/productos/listar'], {
      queryParams: { categoria: categoria !== 'Todas' ? categoria : null }
    });
  }

  volverAlInicio() {
    this.router.navigate(['/cliente/inicio']);
  }
}

import { Component, OnInit } from '@angular/core';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProductosService } from '../../services/productos.service';
import { CarritoService } from '../../services/carrito.service';
import { Product, Category } from '../../interfaces/product.interface';

@Component({
  selector: 'app-listar',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './listar.html',
  styleUrl: './listar.css',
})
export class ListarProductos implements OnInit {

  productos: Product[] = [];
  categorias: Category[] = [];
  categoriaSeleccionada: string = 'Todas';
  terminoBusqueda: string = '';
  cargando: boolean = false;

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
        if (this.categoriaSeleccionada !== 'Todas') {
          this.productos = this.productos.filter(p => 
            this.categorias.find(c => c.id === p.id_categoria)?.nombre_categoria === this.categoriaSeleccionada
          );
        }
        if (this.terminoBusqueda) {
          this.productos = this.productos.filter(p => 
            p.nombre.toLowerCase().includes(this.terminoBusqueda.toLowerCase())
          );
        }
        this.cargando = false;
      },
      error: (err) => {
        console.error("Error al cargar productos:", err);
        this.cargando = false;
      }
    });
  }

  agregarAlCarrito(producto: Product) {
    if (!producto.id) {
      alert('Error: Producto no válido');
      return;
    }

    // Usar el método especial de ProductController
    this.carritoService.agregarProductoAlCarrito(producto.id, 1).subscribe({
      next: (res: any) => {
        console.log("Producto agregado al carrito:", res);
        alert(`✅ ${producto.nombre} agregado al carrito`);
        // Opcional: mostrar notificación o actualizar contador
      },
      error: (err: any) => {
        console.error("Error al agregar producto:", err);
        alert(err.error?.mensaje || `Error al agregar ${producto.nombre} al carrito`);
      }
    });
  }

  filtrarPorCategoria(categoria: string) {
    this.categoriaSeleccionada = categoria;
    this.router.navigate(['/productos/listar'], { 
      queryParams: { categoria: categoria !== 'Todas' ? categoria : null } 
    });
  }
}

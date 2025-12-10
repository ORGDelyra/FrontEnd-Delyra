import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { VendedorService } from '../../services/vendedor.service';
import { MonedaColombianaPipe } from '../../pipes/moneda-colombiana.pipe';
import { Product } from '../../interfaces/product.interface';

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [RouterModule, CommonModule, MonedaColombianaPipe],
  templateUrl: './productos.html',
  styleUrl: './productos.css',
})
export class ProductosVendedor implements OnInit {

  productos: Product[] = [];
  cargando: boolean = false;

  constructor(
    private vendedorService: VendedorService,
    private router: Router
  ) {}

  ngOnInit() {
    this.cargarProductos();
  }

  cargarProductos() {
    this.cargando = true;
    console.log('🔄 Cargando productos del vendedor...');
    this.vendedorService.obtenerProductos().subscribe({
      next: (prods: Product[]) => {
        this.productos = prods;
        console.log(`✅ ${prods.length} productos cargados`);
        console.log('📦 Productos completos:', prods);
        console.log('🖼️ Estructura de imágenes:', prods.map(p => ({
          id: p.id,
          nombre: p.nombre,
          images: p.images
        })));
        this.cargando = false;
      },
      error: (err) => {
        console.error("❌ Error al cargar productos:", err);
        this.cargando = false;
      }
    });
  }

  eliminarProducto(id: number) {
    if (confirm('¿Estás seguro de eliminar este producto?')) {
      console.log('🗑️ Eliminando producto ID:', id);
      this.vendedorService.eliminarProducto(id).subscribe({
        next: (response) => {
          console.log('✅ Producto eliminado exitosamente:', response);
          alert('✅ Producto eliminado correctamente');
          this.cargarProductos();
        },
        error: (err) => {
          console.error("❌ Error al eliminar producto:", err);
          console.error("📋 Status:", err.status);
          console.error("💬 Mensaje:", err.error?.message);

          if (err.status === 403) {
            alert('⚠️ No tienes permisos para eliminar este producto');
          } else if (err.status === 500) {
            alert('❌ Error del servidor. El backend necesita implementar el método destroy() en ProductController');
          } else {
            alert('❌ Error al eliminar producto: ' + (err.error?.message || 'Error desconocido'));
          }
        }
      });
    }
  }
}

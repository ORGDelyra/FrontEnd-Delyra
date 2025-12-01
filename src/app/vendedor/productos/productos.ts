import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { VendedorService } from '../../services/vendedor.service';
import { Product } from '../../interfaces/product.interface';

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [RouterModule, CommonModule],
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
    this.vendedorService.obtenerProductos().subscribe({
      next: (prods: Product[]) => {
        this.productos = prods;
        this.cargando = false;
      },
      error: (err) => {
        console.error("Error al cargar productos:", err);
        this.cargando = false;
      }
    });
  }

  eliminarProducto(id: number) {
    if (confirm('¿Estás seguro de eliminar este producto?')) {
      this.vendedorService.eliminarProducto(id).subscribe({
        next: () => {
          this.cargarProductos();
        },
        error: (err) => console.error("Error al eliminar producto:", err)
      });
    }
  }
}

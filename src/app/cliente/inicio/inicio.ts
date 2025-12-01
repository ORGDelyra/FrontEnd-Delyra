import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MapaUsuarios } from '../../mapa/mapa-usuarios';
import { ProductosService } from '../../services/productos.service';
import { Category } from '../../interfaces/product.interface';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule, MapaUsuarios],
  templateUrl: './inicio.html',
  styleUrl: './inicio.css',
})
export class InicioCliente implements OnInit {

  categorias: Category[] = [];
  terminoBusqueda: string = '';
  categoriaSeleccionada: string = 'Todas';
  menuAbierto: boolean = false;
  menuLateralAbierto: boolean = false; // Menu lateral cerrado por defecto

  constructor(
    private router: Router,
    private productosService: ProductosService
  ) {}

  ngOnInit() {
    try {
      const saved = localStorage.getItem('menuLateralAbierto');
      if (saved !== null) this.menuLateralAbierto = saved === 'true';
    } catch (e) { }
    this.cargarCategorias();
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

  seleccionarCategoria(categoria: string) {
    this.categoriaSeleccionada = categoria;
    // Navegar a productos con filtro
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

  cerrarSesion() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.router.navigate(['/seleccionar-rol']);
  }

  toggleMenu() {
    this.menuAbierto = !this.menuAbierto;
  }

  cerrarMenu() {
    this.menuAbierto = false;
  }

  toggleMenuLateral() {
    this.menuLateralAbierto = !this.menuLateralAbierto;
    try { localStorage.setItem('menuLateralAbierto', String(this.menuLateralAbierto)); } catch(e){}
  }
}

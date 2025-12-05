import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MapaUsuarios } from '../../mapa/mapa-usuarios';
import { ProductosService } from '../../services/productos.service';
import { Category } from '../../interfaces/product.interface';
import { MenuLateral, MenuItem } from '../../components/menu-lateral/menu-lateral';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule, MapaUsuarios, MenuLateral],
  templateUrl: './inicio.html',
  styleUrl: './inicio.css',
})
export class InicioCliente implements OnInit {

  categorias: Category[] = [];
  terminoBusqueda: string = '';
  categoriaSeleccionada: string = 'Todas';
  menuAbierto: boolean = false;
  menuItems: MenuItem[] = [];

  constructor(
    private router: Router,
    private productosService: ProductosService
  ) {}

  ngOnInit() {
    this.inicializarMenuItems();
    this.cargarCategorias();
  }

  inicializarMenuItems() {
    this.menuItems = [
      { icon: '🛍️', label: 'Productos', route: '/productos/listar' },
      { icon: '👤', label: 'Mi Perfil', route: '/cliente/perfil' },
      { icon: '🛒', label: 'Carrito', route: '/carrito' },
      { icon: '📋', label: 'Pedidos', route: '/cliente/pedidos' },
      { icon: '♥', label: 'Favoritos' },
      { icon: '💬', label: 'Chat' },
      { icon: '⚙️', label: 'Configuración' },
      { icon: '❓', label: 'Ayuda' }
    ];
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
}

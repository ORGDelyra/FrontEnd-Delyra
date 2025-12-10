import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth';
import { MenuItem } from '../menu-lateral/menu-lateral';
import { mapIdRolToString } from '../../utils/rol.utils';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class NavbarComponent implements OnInit {
  isAuthenticated = false;
  usuarioData: any = null;
  rol = '';
  menuAbierto = false;
  menuLateralAbierto = false;
  menuItems: MenuItem[] = [];

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    // Verificar autenticación al cargar
    this.isAuthenticated = this.authService.isAuthenticated();
    if (this.isAuthenticated) {
      const userData = localStorage.getItem('usuarioData') || localStorage.getItem('user');
      if (userData) {
        this.usuarioData = JSON.parse(userData);
        this.rol = this.usuarioData?.rol || mapIdRolToString(this.usuarioData?.id_rol) || '';
      }
    } else {
      this.usuarioData = null;
      this.rol = '';
    }
    // Escuchar cambios en autenticación en tiempo real
    this.authService.isAuthenticated$.subscribe(isAuth => {
      this.isAuthenticated = isAuth;
      if (isAuth) {
        const userData = localStorage.getItem('usuarioData') || localStorage.getItem('user');
        if (userData) {
          this.usuarioData = JSON.parse(userData);
          this.rol = this.usuarioData?.rol || mapIdRolToString(this.usuarioData?.id_rol) || '';
        }
      } else {
        this.usuarioData = null;
        this.rol = '';
        // Redirigir a seleccionar rol cuando cierre sesión
        this.router.navigate(['/bienvenida']);
      }
      this.cargarMenuItems();
    });
  }

  cargarMenuItems() {
    if (!this.isAuthenticated) {
      this.menuItems = [];
      return;
    }

    switch (this.rol) {
      case 'cliente':
        this.menuItems = [
          { icon: '🏠', label: 'Inicio', route: '/cliente/inicio' },
          { icon: '🛍️', label: 'Productos', route: '/productos/listar' },
          { icon: '👤', label: 'Mi Perfil', route: '/cliente/perfil' },
          { icon: '🛒', label: 'Carrito', route: '/carrito/listar' },
          { icon: '📋', label: 'Mis Pedidos', route: '/cliente/pedidos' },
          { icon: '♥', label: 'Favoritos' },
          { icon: '💬', label: 'Chat' },
          { icon: '⚙️', label: 'Configuración' },
          { icon: '❓', label: 'Ayuda' }
        ];
        break;
      case 'vendedor':
        this.menuItems = [
          { icon: '🏠', label: 'Inicio', route: '/vendedor/inicio' },
          { icon: '👤', label: 'Mi Perfil', route: '/vendedor/perfil' },
          { icon: '🏪', label: 'Mi Sucursal', route: '/vendedor/sucursal' },
          { icon: '📦', label: 'Mis Productos', route: '/vendedor/productos' },
          { icon: '📋', label: 'Pedidos', route: '/vendedor/pedidos' }
        ];
        break;
      case 'domiciliario':
        this.menuItems = [
          { icon: '🏠', label: 'Inicio', route: '/domiciliario/inicio' },
          { icon: '📦', label: 'Pedidos Disponibles', route: '/domiciliario/inicio' },
          { icon: '🚚', label: 'Mis Entregas', route: '/domiciliario/pedidos' },
          { icon: '👤', label: 'Mi Perfil', route: '/domiciliario/perfil' },
          { icon: '🚙', label: 'Mi Vehículo', route: '/domiciliario/vehiculo' },
          { icon: '📊', label: 'Estadísticas' },
          { icon: '💬', label: 'Chat' },
          { icon: '⚙️', label: 'Configuración' },
          { icon: '❓', label: 'Ayuda' }
        ];
        break;
      case 'admin':
        this.menuItems = [
          { icon: '🏠', label: 'Inicio', route: '/admin/inicio' },
          { icon: '📊', label: 'Dashboard', route: '/admin/inicio' },
          { icon: '👥', label: 'Usuarios', route: '/admin/usuarios' },
          { icon: '📦', label: 'Productos', route: '/admin/productos' },
          { icon: '📋', label: 'Pedidos', route: '/admin/pedidos' },
          { icon: '🏪', label: 'Sucursales', route: '/admin/sucursales' },
          { icon: '⚙️', label: 'Configuración' }
        ];
        break;
      default:
        this.menuItems = [];
    }
  }

  toggleMenu() {
    this.menuAbierto = !this.menuAbierto;
  }

  toggleMenuLateral() {
    this.menuLateralAbierto = !this.menuLateralAbierto;
  }

  cerrarMenu() {
    this.menuAbierto = false;
  }

  cerrarMenuLateral() {
    this.menuLateralAbierto = false;
  }

  cerrarSesion() {
    this.authService.logout();
    this.menuAbierto = false;
    this.menuLateralAbierto = false;
    // La redirección y actualización del estado se hace automáticamente por el subscribe del ngOnInit
  }

  linkPerfil(): string {
    switch (this.rol) {
      case 'cliente':
        return '/cliente/perfil';
      case 'vendedor':
        return '/vendedor/perfil';
      case 'domiciliario':
        return '/domiciliario/perfil';
      case 'admin':
        return '/admin/inicio';
      default:
        return '/bienvenida';
    }
  }

  linkInicio(): string {
    if (!this.isAuthenticated) {
      return '/bienvenida';
    }
    switch (this.rol) {
      case 'cliente':
        return '/cliente/inicio';
      case 'vendedor':
        return '/vendedor/inicio';
      case 'domiciliario':
        return '/domiciliario/inicio';
      case 'admin':
        return '/admin/inicio';
      default:
        return '/bienvenida';
    }
  }
}

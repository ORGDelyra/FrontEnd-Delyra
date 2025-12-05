import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DomiciliarioService } from '../../services/domiciliario.service';
import { PedidosService } from '../../services/pedidos.service';
import { Cart } from '../../interfaces/cart.interface';
import { MenuLateral, MenuItem } from '../../components/menu-lateral/menu-lateral';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [RouterModule, CommonModule, MenuLateral],
  templateUrl: './inicio.html',
  styleUrl: './inicio.css',
})
export class InicioDomiciliario implements OnInit {

  pedidosDisponibles: Cart[] = [];  // Pedidos que puede tomar
  misPedidos: Cart[] = [];           // Pedidos ya tomados
  cargando: boolean = false;
  cargandoDisponibles: boolean = false;
  menuAbierto: boolean = false;
  vistaActual: 'disponibles' | 'mis-entregas' = 'disponibles'; // Pestaña activa
  menuItems: MenuItem[] = [];

  constructor(
    private router: Router,
    private domiciliarioService: DomiciliarioService,
    private pedidosService: PedidosService
  ) {}

  ngOnInit() {
    this.inicializarMenuItems();
    this.cargarPedidosDisponibles();
    this.cargarMisEntregas();
  }

  inicializarMenuItems() {
    this.menuItems = [
      { icon: '📦', label: 'Pedidos Disponibles', action: () => this.vistaActual = 'disponibles' },
      { icon: '🚚', label: 'Mis Entregas', action: () => this.vistaActual = 'mis-entregas' },
      { icon: '👤', label: 'Mi Perfil', route: '/domiciliario/perfil' },
      { icon: '📊', label: 'Estadísticas' },
      { icon: '💬', label: 'Chat' },
      { icon: '⚙️', label: 'Configuración' },
      { icon: '❓', label: 'Ayuda' }
    ];
  }

  cargarPedidosDisponibles() {
    this.cargandoDisponibles = true;
    console.log('📦 Cargando pedidos disponibles...');

    this.pedidosService.obtenerPedidosDisponibles().subscribe({
      next: (pedidos: Cart[]) => {
        console.log('✅ Pedidos disponibles:', pedidos);
        this.pedidosDisponibles = pedidos || [];
        this.cargandoDisponibles = false;
      },
      error: (err) => {
        console.error('❌ Error al cargar pedidos disponibles:', err);
        this.pedidosDisponibles = [];
        this.cargandoDisponibles = false;
      }
    });
  }

  cargarPedidos() {
    this.cargando = true;
    console.log('📦 Cargando mis entregas...');

    // Cargar mis pedidos (ya tomados por mí)
    this.pedidosService.obtenerMisEntregas().subscribe({
      next: (pedidos: Cart[]) => {
        console.log('✅ Entregas cargadas:', pedidos);
        this.misPedidos = pedidos || [];
        this.cargando = false;
      },
      error: (err) => {
        console.error('❌ Error al cargar entregas:', err);
        this.misPedidos = [];
        this.cargando = false;
      }
    });
  }

  cargarMisEntregas() {
    this.cargarPedidos();
  }

  tomarPedido(pedidoId: number) {
    if (!confirm('¿Deseas tomar este pedido?')) {
      return;
    }

    console.log(`🚀 Tomando pedido ${pedidoId}...`);

    this.pedidosService.tomarPedido(pedidoId).subscribe({
      next: (response) => {
        console.log('✅ Pedido tomado:', response);
        alert('✅ Pedido tomado exitosamente');
        // Recargar ambas listas
        this.cargarPedidosDisponibles();
        this.cargarMisEntregas();
        // Cambiar a la vista de mis entregas
        this.vistaActual = 'mis-entregas';
      },
      error: (err) => {
        console.error('❌ Error al tomar pedido:', err);
        alert(err.error?.mensaje || 'Error al tomar el pedido. Puede que otro domiciliario lo haya tomado primero.');
      }
    });
  }

  cambiarVista(vista: 'disponibles' | 'mis-entregas') {
    this.vistaActual = vista;
    if (vista === 'disponibles') {
      this.cargarPedidosDisponibles();
    } else {
      this.cargarMisEntregas();
    }
  }

  private getUsuarioId(): number | null {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        return user.id || null;
      } catch (e) {
        return null;
      }
    }
    return null;
  }

  irADetalles(pedidoId: number) {
    this.router.navigate(['/domiciliario/pedidos']);
  }

  toggleMenu() {
    this.menuAbierto = !this.menuAbierto;
  }

  cerrarMenu() {
    this.menuAbierto = false;
  }

  cerrarSesion() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.router.navigate(['/seleccionar-rol']);
  }
}

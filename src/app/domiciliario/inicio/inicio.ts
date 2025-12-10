import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DomiciliarioService } from '../../services/domiciliario.service';
import { PedidosService } from '../../services/pedidos.service';
import { MonedaColombianaPipe } from '../../pipes/moneda-colombiana.pipe';
import { Cart } from '../../interfaces/cart.interface';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [RouterModule, CommonModule, MonedaColombianaPipe],
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

  constructor(
    private router: Router,
    private domiciliarioService: DomiciliarioService,
    private pedidosService: PedidosService
  ) {}

  ngOnInit() {
    this.cargarPedidosDisponibles();
    this.cargarMisEntregas();
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
        console.error('📋 Detalles completos del error:', {
          status: err.status,
          statusText: err.statusText,
          error: err.error,
          message: err.message
        });

        let mensaje = 'Error al tomar el pedido.';

        if (err.status === 500) {
          mensaje = err.error?.mensaje || err.error?.error || err.error?.message || 'Error interno del servidor. Verifica que el pedido esté disponible.';
        } else if (err.status === 400) {
          mensaje = err.error?.mensaje || 'El pedido no está disponible o ya fue tomado.';
        } else if (err.status === 403) {
          mensaje = 'No tienes permisos para tomar este pedido.';
        } else if (err.error?.mensaje) {
          mensaje = err.error.mensaje;
        }

        alert('❌ ' + mensaje);
        console.log('💡 Mensaje mostrado al usuario:', mensaje);
        // Recargar la lista de disponibles por si acaso
        this.cargarPedidosDisponibles();
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

  cerrarSesion() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.router.navigate(['/bienvenida']);
  }
}

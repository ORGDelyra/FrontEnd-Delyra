import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PedidosService } from '../../services/pedidos.service';
import { Cart } from '../../interfaces/cart.interface';

@Component({
  selector: 'app-pedidos',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './pedidos.html',
  styleUrl: './pedidos.css',
})
export class PedidosCliente implements OnInit {

  pedidos: Cart[] = [];
  cargando: boolean = false;
  filtroEstado: string = 'todos';
  mensajeError: string = '';
  mensajeExito: string = '';

  constructor(
    private router: Router,
    private pedidosService: PedidosService
  ) {}

  ngOnInit() {
    this.cargarPedidos();
  }

  cargarPedidos() {
    this.cargando = true;
    this.mensajeError = '';

    this.pedidosService.obtenerMisPedidos().subscribe({
      next: (pedidos: Cart[]) => {
        // Filtrar por estado si es necesario
        if (this.filtroEstado === 'todos') {
          this.pedidos = pedidos;
        } else {
          this.pedidos = pedidos.filter(p => p.estado_pedido === this.filtroEstado);
        }
        this.cargando = false;
      },
      error: (err) => {
        console.error("Error al cargar pedidos:", err);

        // Mejorar el mensaje de error
        let mensajeError = 'Error al cargar los pedidos';
        if (err.status === 401) {
          mensajeError = 'Sesión expirada. Por favor, inicia sesión nuevamente.';
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setTimeout(() => this.router.navigate(['/inicio-sesion']), 2000);
        } else if (err.status === 404) {
          // 404 significa que no hay pedidos, no es un error real
          console.log("✅ No hay pedidos aún (404 es normal)");
          this.pedidos = [];
          this.cargando = false;
          return;
        } else if (err.status === 0) {
          mensajeError = 'Error de conexión. Verifica tu conexión a internet o que el servidor esté ejecutándose en http://127.0.0.1:8000';
        } else if (err.error?.message) {
          mensajeError = err.error.message;
        }

        this.mensajeError = mensajeError;
        this.pedidos = [];
        this.cargando = false;
      }
    });
  }

  filtrarPorEstado(estado: string) {
    this.filtroEstado = estado;
    this.cargarPedidos();
  }

  marcarComoRecogido(id: number) {
    if (!confirm('¿Confirmas que ya recogiste este pedido?')) {
      return;
    }

    this.pedidosService.marcarComoRecogido(id).subscribe({
      next: (res: any) => {
        this.mensajeExito = res.mensaje || 'Pedido marcado como recogido';
        this.cargarPedidos();
        setTimeout(() => this.mensajeExito = '', 3000);
      },
      error: (err) => {
        this.mensajeError = err.error?.mensaje || 'Error al marcar como recogido';
        setTimeout(() => this.mensajeError = '', 5000);
      }
    });
  }

  obtenerEstadoColor(estado: string | undefined): string {
    switch (estado) {
      case 'pendiente': return 'bg-gray-900/50 text-gray-300';
      case 'confirmado': return 'bg-blue-900/50 text-blue-300';
      case 'en_preparacion': return 'bg-yellow-900/50 text-yellow-300';
      case 'listo': return 'bg-green-900/50 text-green-300';
      case 'entregado': return 'bg-purple-900/50 text-purple-300';
      case 'recogido': return 'bg-green-900/50 text-green-300';
      default: return 'bg-[#1f2847] text-[#9aa2c7]';
    }
  }

  obtenerEstadoTexto(estado: string | undefined): string {
    const estados: { [key: string]: string } = {
      'pendiente': 'Pendiente',
      'confirmado': 'Confirmado',
      'en_preparacion': 'En Preparación',
      'listo': 'Listo',
      'entregado': 'Entregado',
      'recogido': 'Recogido'
    };
    return estados[estado || 'pendiente'] || estado || 'Desconocido';
  }

  formatearFecha(fecha: string | undefined): string {
    if (!fecha) return 'Fecha no disponible';
    try {
      const date = new Date(fecha);
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return fecha;
    }
  }

  puedeMarcarRecogido(pedido: Cart): boolean {
    return pedido.tipo_entrega === 'recogida' &&
           pedido.estado_pedido === 'listo';
  }
}

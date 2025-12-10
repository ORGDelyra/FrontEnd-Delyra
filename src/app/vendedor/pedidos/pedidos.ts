import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PedidosService } from '../../services/pedidos.service';
import { MonedaColombianaPipe } from '../../pipes/moneda-colombiana.pipe';
import { Cart } from '../../interfaces/cart.interface';

@Component({
  selector: 'app-pedidos',
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule, MonedaColombianaPipe],
  templateUrl: './pedidos.html',
  styleUrl: './pedidos.css',
})
export class PedidosVendedor implements OnInit {

  pedidos: Cart[] = [];
  domiciliarios: any[] = [];
  cargando: boolean = false;
  filtroEstado: string = 'todos';
  mensajeError: string = '';
  mensajeExito: string = '';
  pedidoSeleccionado: number | null = null;
  domiciliarioSeleccionado: number | null = null;

  constructor(
    private router: Router,
    private pedidosService: PedidosService
  ) {}

  ngOnInit() {
    this.cargarPedidos();
    this.cargarDomiciliarios();
  }

  cargarPedidos() {
    this.cargando = true;
    this.mensajeError = '';
    this.pedidosService.obtenerPedidosTienda().subscribe({
      next: (pedidos: Cart[]) => {
        if (this.filtroEstado === 'todos') {
          this.pedidos = pedidos;
        } else {
          this.pedidos = pedidos.filter(p => p.estado_pedido === this.filtroEstado);
        }
        this.cargando = false;
      },
      error: (err) => {
        console.error("Error al cargar pedidos:", err);
        this.mensajeError = err.error?.mensaje || 'Error al cargar los pedidos';
        this.pedidos = [];
        this.cargando = false;
      }
    });
  }

  cargarDomiciliarios() {
    this.pedidosService.obtenerDomiciliarios().subscribe({
      next: (domiciliarios: any[]) => {
        this.domiciliarios = domiciliarios;
      },
      error: (err) => {
        console.error("Error al cargar domiciliarios:", err);
      }
    });
  }

  filtrarPorEstado(estado: string) {
    this.filtroEstado = estado;
    this.cargarPedidos();
  }

  actualizarEstadoPedido(pedidoId: number, nuevoEstado: string) {
    if (!pedidoId) return;

    this.pedidosService.actualizarEstadoPedido(pedidoId, { estado_pedido: nuevoEstado as any }).subscribe({
      next: (res: any) => {
        this.mensajeExito = res.mensaje || `Pedido #${pedidoId} actualizado a ${nuevoEstado}`;
        this.cargarPedidos();
        setTimeout(() => this.mensajeExito = '', 3000);
      },
      error: (err: any) => {
        this.mensajeError = err.error?.mensaje || 'Error al actualizar el pedido';
        setTimeout(() => this.mensajeError = '', 5000);
      }
    });
  }

  abrirModalAsignar(pedidoId: number) {
    this.pedidoSeleccionado = pedidoId;
    this.domiciliarioSeleccionado = null;
  }

  asignarDomiciliario() {
    if (!this.pedidoSeleccionado || !this.domiciliarioSeleccionado) {
      this.mensajeError = 'Selecciona un domiciliario';
      return;
    }

    this.pedidosService.asignarDomiciliario(this.pedidoSeleccionado, {
      id_domiciliario: this.domiciliarioSeleccionado
    }).subscribe({
      next: (res: any) => {
        this.mensajeExito = res.mensaje || 'Domiciliario asignado correctamente';
        this.pedidoSeleccionado = null;
        this.domiciliarioSeleccionado = null;
        this.cargarPedidos();
        setTimeout(() => this.mensajeExito = '', 3000);
      },
      error: (err: any) => {
        this.mensajeError = err.error?.mensaje || 'Error al asignar domiciliario';
        setTimeout(() => this.mensajeError = '', 5000);
      }
    });
  }

  obtenerEstadoColor(estado: string | undefined): string {
    switch (estado) {
      case 'pendiente': return 'bg-gray-100 text-gray-800';
      case 'confirmado': return 'bg-blue-100 text-blue-800';
      case 'en_preparacion': return 'bg-yellow-100 text-yellow-800';
      case 'listo': return 'bg-green-100 text-green-800';
      case 'entregado': return 'bg-green-200 text-green-900';
      case 'recogido': return 'bg-green-200 text-green-900';
      default: return 'bg-gray-100 text-gray-800';
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

  obtenerSiguienteEstado(estado: string | undefined): string | null {
    const flujo: { [key: string]: string } = {
      'pendiente': 'confirmado',
      'confirmado': 'en_preparacion',
      'en_preparacion': 'listo'
    };
    return flujo[estado || ''] || null;
  }

  puedeAsignarDomiciliario(pedido: Cart): boolean {
    return pedido.tipo_entrega === 'domicilio' &&
           !pedido.id_domiciliario &&
           (pedido.estado_pedido === 'confirmado' || pedido.estado_pedido === 'en_preparacion');
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
}

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
export class PedidosDomiciliario implements OnInit {

  pedidos: Cart[] = [];
  cargando: boolean = false;
  mensajeError: string = '';
  mensajeExito: string = '';
  pedidoSeleccionado: number | null = null;
  codigoConfirmacion: string = '';
  comentario: string = '';

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
    console.log('📦 Cargando pedidos del domiciliario...');
    this.pedidosService.obtenerMisEntregas().subscribe({
      next: (pedidos: Cart[]) => {
        console.log('✅ Pedidos cargados:', pedidos);
        console.log('📊 Total de pedidos:', pedidos.length);
        pedidos.forEach((p, i) => {
          console.log(`  ${i + 1}. Pedido ID: ${p.id}, Estado: ${p.estado_pedido}, Productos: ${(p as any).products?.length || 0}`);
        });
        this.pedidos = pedidos;
        this.cargando = false;
      },
      error: (err) => {
        console.error("❌ Error al cargar pedidos:", err);
        console.error('📋 Status:', err.status);
        console.error('💬 Mensaje:', err.error?.mensaje || err.message);
        this.mensajeError = err.error?.mensaje || 'Error al cargar los pedidos';
        this.pedidos = [];
        this.cargando = false;
      }
    });
  }

  abrirModalEntregar(pedidoId: number) {
    this.pedidoSeleccionado = pedidoId;
    this.codigoConfirmacion = '';
    this.comentario = '';
  }

  marcarComoEntregado() {
    if (!this.pedidoSeleccionado) return;

    const data: any = {};
    if (this.codigoConfirmacion) {
      data.codigo_confirmacion = this.codigoConfirmacion;
    }
    if (this.comentario) {
      data.comentario = this.comentario;
    }

    this.pedidosService.marcarComoEntregado(this.pedidoSeleccionado, data).subscribe({
      next: (res: any) => {
        this.mensajeExito = res.mensaje || 'Pedido marcado como entregado';
        this.pedidoSeleccionado = null;
        this.codigoConfirmacion = '';
        this.comentario = '';
        this.cargarPedidos();
        setTimeout(() => this.mensajeExito = '', 3000);
      },
      error: (err: any) => {
        this.mensajeError = err.error?.mensaje || 'Error al marcar como entregado';
        setTimeout(() => this.mensajeError = '', 5000);
      }
    });
  }

  obtenerEstadoColor(estado: string | undefined): string {
    switch (estado) {
      case 'listo': return 'bg-green-100 text-green-800';
      case 'entregado': return 'bg-green-200 text-green-900';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  obtenerEstadoTexto(estado: string | undefined): string {
    const estados: { [key: string]: string } = {
      'listo': 'Listo para Entrega',
      'entregado': 'Entregado'
    };
    return estados[estado || ''] || estado || 'Desconocido';
  }

  puedeMarcarEntregado(pedido: Cart): boolean {
    return pedido.estado_pedido === 'listo';
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

  obtenerNombreCliente(pedido: any): string {
    return pedido?.user?.primer_nombre || pedido?.cliente?.nombre_completo || 'N/A';
  }

  obtenerTelefonoCliente(pedido: any): string {
    return pedido?.user?.telefono || pedido?.cliente?.telefono || 'N/A';
  }

  tieneProductos(pedido: any): boolean {
    return pedido?.products && Array.isArray(pedido.products) && pedido.products.length > 0;
  }

  obtenerProductos(pedido: any): any[] {
    return pedido?.products || [];
  }
}

import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DomiciliarioService } from '../../services/domiciliario.service';
import { Shipment } from '../../interfaces/cart.interface';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './inicio.html',
  styleUrl: './inicio.css',
})
export class InicioDomiciliario implements OnInit {

  pedidosDisponibles: Shipment[] = [];
  misPedidos: Shipment[] = [];
  estadoDispo: string = 'activo';
  cargando: boolean = false;
  menuAbierto: boolean = false;
  menuLateralAbierto: boolean = false;

  constructor(
    private router: Router,
    private domiciliarioService: DomiciliarioService
  ) {}

  ngOnInit() {
    try {
      const saved = localStorage.getItem('menuLateralAbierto');
      if (saved !== null) this.menuLateralAbierto = saved === 'true';
    } catch (e) { }
    this.cargarPedidos();
  }

  cargarPedidos() {
    this.cargando = true;

    // Cargar pedidos disponibles (sin domiciliario asignado)
    this.domiciliarioService.obtenerEnviosDisponibles().subscribe({
      next: (envios: Shipment[]) => {
        this.pedidosDisponibles = envios.filter(e => e.estado === 'espera');
      },
      error: (err) => {
        console.error("Error al cargar pedidos disponibles:", err);
      }
    });

    // Cargar mis pedidos (asignados a mí)
    this.domiciliarioService.obtenerEnvios().subscribe({
      next: (envios: Shipment[]) => {
        // Filtrar solo los que están asignados al domiciliario actual
        const userId = this.getUsuarioId();
        this.misPedidos = envios.filter(e =>
          e.id_servicio && (e.estado === 'en_camino' || e.estado === 'preparando')
        );
        this.cargando = false;
      },
      error: (err) => {
        console.error("Error al cargar mis pedidos:", err);
        this.cargando = false;
      }
    });
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

  aceptarPedido(idEnvio: number) {
    // Usar el método especial de ShipmentController
    this.domiciliarioService.aceptarPedido(idEnvio).subscribe({
      next: () => {
        alert('Pedido aceptado exitosamente');
        this.cargarPedidos();
      },
      error: (err) => {
        console.error("Error al aceptar pedido:", err);
        alert(err.error?.message || 'Error al aceptar el pedido');
      }
    });
  }

  completarPedido(idEnvio: number) {
    // Usar el método especial de ShipmentController
    this.domiciliarioService.completarPedido(idEnvio).subscribe({
      next: () => {
        alert('Pedido completado exitosamente');
        this.cargarPedidos();
      },
      error: (err) => {
        console.error("Error al completar pedido:", err);
        alert(err.error?.message || 'Error al completar el pedido');
      }
    });
  }

  cambiarEstado() {
    const nuevoEstado = this.estadoDispo === 'activo' ? 'inactivo' : 'activo';

    // Obtener el ID del servicio del usuario actual
    const userId = this.getUsuarioId();
    if (!userId) {
      alert('No se pudo obtener la información del usuario');
      return;
    }

    // Obtener el servicio del domiciliario actual
    this.domiciliarioService.obtenerServicios().subscribe({
      next: (servicios: any[]) => {
        const miServicio = servicios.find(s => s.id_usuario === userId);
        if (miServicio && miServicio.id) {
          this.domiciliarioService.actualizarEstadoServicio(miServicio.id, nuevoEstado).subscribe({
            next: () => {
              this.estadoDispo = nuevoEstado;
              alert(`Estado cambiado a: ${nuevoEstado}`);
            },
            error: (err) => {
              console.error("Error al cambiar estado:", err);
              alert('Error al cambiar el estado de disponibilidad');
            }
          });
        } else {
          // Si no tiene servicio, crear uno
          this.domiciliarioService.crearServicio({
            id_usuario: userId,
            estado_dispo: nuevoEstado
          }).subscribe({
            next: () => {
              this.estadoDispo = nuevoEstado;
              alert(`Estado establecido a: ${nuevoEstado}`);
            },
            error: (err) => {
              console.error("Error al crear servicio:", err);
              alert('Error al crear el servicio');
            }
          });
        }
      },
      error: (err) => {
        console.error("Error al obtener servicios:", err);
        alert('Error al obtener información del servicio');
      }
    });
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

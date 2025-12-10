import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../services/admin.service';

@Component({
  selector: 'app-inicio-admin',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './inicio.html',
  styleUrl: './inicio.css',
})
export class InicioAdmin implements OnInit {

  estadisticas: any = null;
  cargando: boolean = false;
  mensajeError: string = '';

  constructor(
    private router: Router,
    private adminService: AdminService
  ) {}

  ngOnInit() {
    this.cargarEstadisticas();
  }

  cargarEstadisticas() {
    this.cargando = true;
    this.mensajeError = '';
    this.adminService.obtenerEstadisticas().subscribe({
      next: (stats: any) => {
        this.estadisticas = stats;
        this.cargando = false;
      },
      error: (err) => {
        console.error("Error al cargar estadísticas:", err);
        this.mensajeError = 'Error al cargar las estadísticas';
        this.cargando = false;
      }
    });
  }

  obtenerNombreRol(idRol: number): string {
    const roles: { [key: number]: string } = {
      1: 'Admin',
      2: 'Cliente',
      3: 'Comerciante',
      4: 'Domiciliario'
    };
    return roles[idRol] || `Rol ${idRol}`;
  }

  obtenerNombreEstado(estado: string): string {
    const estados: { [key: string]: string } = {
      'pendiente': 'Pendiente',
      'confirmado': 'Confirmado',
      'en_preparacion': 'En Preparación',
      'listo': 'Listo',
      'entregado': 'Entregado',
      'recogido': 'Recogido'
    };
    return estados[estado] || estado;
  }

  obtenerUsuariosPorRolArray(): any[] {
    if (!this.estadisticas?.usuariosPorRol) return [];
    return Object.keys(this.estadisticas.usuariosPorRol).map(key => ({
      rol: +key,
      cantidad: this.estadisticas.usuariosPorRol[key],
      nombre: this.obtenerNombreRol(+key)
    }));
  }

  obtenerPedidosPorEstadoArray(): any[] {
    if (!this.estadisticas?.pedidosPorEstado) return [];
    return Object.keys(this.estadisticas.pedidosPorEstado).map(key => ({
      estado: key,
      cantidad: this.estadisticas.pedidosPorEstado[key],
      nombre: this.obtenerNombreEstado(key)
    }));
  }

  cerrarSesion() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.router.navigate(['/bienvenida']);
  }
}


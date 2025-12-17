
import { Component, Input } from '@angular/core';
import { User } from '../../interfaces/user.interface';
import { DatePipe, CommonModule } from '@angular/common';

@Component({
  selector: 'app-perfil-usuario',
  standalone: true,
  imports: [CommonModule, DatePipe],
  template: `
    <div *ngIf="usuario" class="perfil-usuario bg-white rounded-lg shadow-lg p-4 mb-4">
      <h3 class="text-xl font-bold text-purple-700 mb-2">Perfil de Usuario</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
        <div><span class="font-semibold">Nombre:</span> {{ usuario.primer_nombre }} {{ usuario.segundo_nombre }} {{ usuario.primer_apellido }} {{ usuario.segundo_apellido }}</div>
        <div><span class="font-semibold">Correo:</span> {{ usuario.correo }}</div>
        <div><span class="font-semibold">Teléfono:</span> {{ usuario.telefono }}</div>
        <div><span class="font-semibold">Rol:</span> {{ obtenerNombreRol(usuario.id_rol) }}</div>
        <div><span class="font-semibold">Cuenta bancaria:</span> {{ usuario.cuenta_bancaria }}</div>
        <div><span class="font-semibold">Estado:</span> {{ mostrarEstadoCuenta(usuario.estado_cuenta) }}</div>
        <div><span class="font-semibold">Creado:</span> {{ usuario.created_at | date:'short' }}</div>
      </div>
    </div>
  `,
  styleUrls: ['./perfil-usuario.css']
})
export class PerfilUsuarioComponent {
  @Input() usuario!: User;

  obtenerNombreRol(idRol: number): string {
    const roles: { [key: number]: string } = {
      1: 'Admin',
      2: 'Cliente',
      3: 'Comerciante',
      4: 'Domiciliario'
    };
    return roles[idRol] || `Rol ${idRol}`;
  }

  mostrarEstadoCuenta(estado: any): string {
    // Considera true, '1', 1, 'activo', 'Activo' como activo
    if (estado === true || estado === 1 || estado === '1' || (typeof estado === 'string' && estado.toLowerCase() === 'activo')) {
      return 'Activo';
    }
    return 'Inactivo';
  }
}

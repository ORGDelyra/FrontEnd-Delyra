import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin.service';
import { User } from '../../interfaces/user.interface';

@Component({
  selector: 'app-usuarios-admin',
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule],
  templateUrl: './usuarios.html',
  styleUrl: './usuarios.css',
})
export class UsuariosAdmin implements OnInit {

  usuarios: User[] = [];
  roles: any[] = [];
  cargando: boolean = false;
  mensajeError: string = '';
  mensajeExito: string = '';
  mostrarModal: boolean = false;
  modoEdicion: boolean = false;
  usuarioSeleccionado: User | null = null;
  filtroRol: number | null = null;
  terminoBusqueda: string = '';

  // Formulario
  formUsuario = {
    primer_nombre: '',
    segundo_nombre: '',
    primer_apellido: '',
    segundo_apellido: '',
    telefono: '',
    correo: '',
    password: '',
    cuenta_bancaria: '',
    id_rol: 2,
    estado_cuenta: true
  };

  constructor(
    private router: Router,
    private adminService: AdminService
  ) {}

  ngOnInit() {
    this.cargarUsuarios();
    this.cargarRoles();
  }

  cargarUsuarios() {
    this.cargando = true;
    this.mensajeError = '';
    this.adminService.obtenerUsuarios().subscribe({
      next: (usuarios: User[]) => {
        this.usuarios = usuarios;
        this.cargando = false;
      },
      error: (err) => {
        console.error("Error al cargar usuarios:", err);
        this.mensajeError = err.error?.mensaje || 'Error al cargar los usuarios';
        this.cargando = false;
      }
    });
  }

  cargarRoles() {
    this.adminService.obtenerRoles().subscribe({
      next: (roles: any[]) => {
        this.roles = roles;
      },
      error: (err) => {
        console.error("Error al cargar roles:", err);
      }
    });
  }

  abrirModalCrear() {
    this.modoEdicion = false;
    this.usuarioSeleccionado = null;
    this.formUsuario = {
      primer_nombre: '',
      segundo_nombre: '',
      primer_apellido: '',
      segundo_apellido: '',
      telefono: '',
      correo: '',
      password: '',
      cuenta_bancaria: '',
      id_rol: 2,
      estado_cuenta: true
    };
    this.mostrarModal = true;
  }

  abrirModalEditar(usuario: User) {
    this.modoEdicion = true;
    this.usuarioSeleccionado = usuario;
    this.formUsuario = {
      primer_nombre: usuario.primer_nombre,
      segundo_nombre: usuario.segundo_nombre || '',
      primer_apellido: usuario.primer_apellido,
      segundo_apellido: usuario.segundo_apellido || '',
      telefono: usuario.telefono,
      correo: usuario.correo,
      password: '', // No mostrar contraseña
      cuenta_bancaria: usuario.cuenta_bancaria,
      id_rol: usuario.id_rol,
      estado_cuenta: usuario.estado_cuenta ?? true
    };
    this.mostrarModal = true;
  }

  guardarUsuario() {
    if (!this.formUsuario.primer_nombre || !this.formUsuario.primer_apellido || 
        !this.formUsuario.telefono || !this.formUsuario.correo || !this.formUsuario.cuenta_bancaria) {
      this.mensajeError = 'Completa todos los campos requeridos';
      return;
    }

    if (!this.modoEdicion && !this.formUsuario.password) {
      this.mensajeError = 'La contraseña es requerida para nuevos usuarios';
      return;
    }

    this.cargando = true;
    this.mensajeError = '';
    this.mensajeExito = '';

    const data: any = { ...this.formUsuario };
    // Si es edición y no hay nueva contraseña, no enviarla
    if (this.modoEdicion && !data.password) {
      delete data.password;
    }

    if (this.modoEdicion && this.usuarioSeleccionado?.id) {
      this.adminService.actualizarUsuario(this.usuarioSeleccionado.id, data).subscribe({
        next: (res: any) => {
          this.mensajeExito = 'Usuario actualizado exitosamente';
          this.mostrarModal = false;
          this.cargarUsuarios();
          setTimeout(() => this.mensajeExito = '', 3000);
        },
        error: (err) => {
          this.mensajeError = err.error?.mensaje || 'Error al actualizar el usuario';
          this.cargando = false;
        }
      });
    } else {
      this.adminService.crearUsuario(data).subscribe({
        next: (res: any) => {
          this.mensajeExito = 'Usuario creado exitosamente';
          this.mostrarModal = false;
          this.cargarUsuarios();
          setTimeout(() => this.mensajeExito = '', 3000);
        },
        error: (err) => {
          this.mensajeError = err.error?.mensaje || 'Error al crear el usuario';
          this.cargando = false;
        }
      });
    }
  }

  eliminarUsuario(id: number) {
    if (!confirm('¿Estás seguro de eliminar este usuario?')) {
      return;
    }

    this.adminService.eliminarUsuario(id).subscribe({
      next: (res: any) => {
        this.mensajeExito = 'Usuario eliminado exitosamente';
        this.cargarUsuarios();
        setTimeout(() => this.mensajeExito = '', 3000);
      },
      error: (err) => {
        this.mensajeError = err.error?.mensaje || 'Error al eliminar el usuario';
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

  get usuariosFiltrados(): User[] {
    let filtrados = this.usuarios;

    if (this.filtroRol) {
      filtrados = filtrados.filter(u => u.id_rol === this.filtroRol);
    }

    if (this.terminoBusqueda.trim()) {
      const busqueda = this.terminoBusqueda.toLowerCase();
      filtrados = filtrados.filter(u => 
        u.primer_nombre.toLowerCase().includes(busqueda) ||
        u.primer_apellido.toLowerCase().includes(busqueda) ||
        u.correo.toLowerCase().includes(busqueda) ||
        u.telefono.includes(busqueda)
      );
    }

    return filtrados;
  }
}


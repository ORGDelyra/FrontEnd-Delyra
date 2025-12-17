import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin.service';
import { User } from '../../interfaces/user.interface';
import { ChatComponent } from '../../components/chat/chat.component';
import { PerfilUsuarioComponent } from './perfil-usuario';

@Component({
  selector: 'app-chat-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, ChatComponent, PerfilUsuarioComponent],
  templateUrl: './chat-admin.html',
  styleUrl: './chat-admin.css',
})

export class ChatAdmin implements OnInit {
  usuarios: User[] = [];
  usuariosFiltrados: User[] = [];
  usuarioSeleccionado: User | null = null;
  cargando: boolean = false;
  mensajeError: string = '';
  terminoBusqueda: string = '';
  paginaActual: number = 1;
  totalPaginas: number = 1;
  perPage: number = 10;
  mostrarChat: boolean = false;
  chatsRecientes: any[] = [];
  cargandoChatsRecientes: boolean = false;

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.cargarChatsRecientes();
    // No cargar usuarios por defecto
  }

  cargarChatsRecientes() {
    this.cargandoChatsRecientes = true;
    this.adminService.obtenerChatsRecientesSoporte().subscribe({
      next: (chats: any[]) => {
        this.chatsRecientes = chats;
        this.cargandoChatsRecientes = false;
      },
      error: () => {
        this.chatsRecientes = [];
        this.cargandoChatsRecientes = false;
      }
    });
  }


  cargarUsuarios(pagina: number = 1) {
    if (!this.terminoBusqueda.trim()) {
      this.usuarios = [];
      this.usuariosFiltrados = [];
      this.paginaActual = 1;
      this.totalPaginas = 1;
      return;
    }
    this.cargando = true;
    this.adminService.obtenerUsuarios({ busqueda: this.terminoBusqueda, per_page: this.perPage, page: pagina }).subscribe({
      next: (resp: any) => {
        // Si la respuesta es paginada (Laravel), tendrá data, current_page, last_page
        if (resp && resp.data && resp.current_page) {
          this.usuarios = resp.data;
          this.paginaActual = resp.current_page;
          this.totalPaginas = resp.last_page;
        } else {
          this.usuarios = Array.isArray(resp) ? resp : [];
          this.paginaActual = 1;
          this.totalPaginas = 1;
        }
        this.filtrarUsuarios();
        this.cargando = false;
      },
      error: (err) => {
        this.mensajeError = err.error?.mensaje || 'Error al cargar usuarios';
        this.cargando = false;
      }
    });
  }

  filtrarUsuarios() {
    const busqueda = this.terminoBusqueda.trim().toLowerCase();
    if (!busqueda) {
      this.usuariosFiltrados = [];
      return;
    }
    // Si no hay usuarios cargados, cargar desde backend
    if (this.usuarios.length === 0) {
      this.cargarUsuarios();
      return;
    }
    this.usuariosFiltrados = this.usuarios;
  }

  cambiarPagina(delta: number) {
    const nuevaPagina = this.paginaActual + delta;
    if (nuevaPagina >= 1 && nuevaPagina <= this.totalPaginas) {
      this.cargarUsuarios(nuevaPagina);
    }
  }

  seleccionarUsuario(usuario: User) {
    this.usuarioSeleccionado = usuario;
    this.mostrarChat = false;
  }

  seleccionarChatReciente(chat: any) {
    if (chat && chat.usuario) {
      this.usuarioSeleccionado = {
        id: chat.usuario.id,
        primer_nombre: chat.usuario.nombre.split(' ')[0],
        primer_apellido: chat.usuario.nombre.split(' ').slice(1).join(' '),
        correo: chat.usuario.correo,
        // ...otros campos si es necesario
      } as User;
      this.mostrarChat = false;
    }
  }

  mostrarChatUsuario() {
    this.mostrarChat = true;
  }

  ocultarChatUsuario() {
    this.mostrarChat = false;
  }

  nuevoChat() {
    this.usuarioSeleccionado = null;
    this.terminoBusqueda = '';
    this.filtrarUsuarios();
  }
}

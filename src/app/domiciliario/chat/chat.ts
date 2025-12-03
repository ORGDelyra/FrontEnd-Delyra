import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-chat-domiciliario',
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule],
  templateUrl: './chat.html',
  styleUrl: './chat.css',
})
export class ChatDomiciliario implements OnInit {
  mensajes: any[] = [];
  nuevoMensaje: string = '';
  cargando: boolean = false;

  constructor(private router: Router) {}

  ngOnInit() {
    this.cargarMensajes();
  }

  cargarMensajes() {
    // Simulación de carga de mensajes desde el backend
    this.mensajes = [
      { id: 1, usuario: 'Administrador', mensaje: 'Bienvenido al chat', timestamp: new Date() },
      { id: 2, usuario: 'Tú', mensaje: 'Hola, ¿cómo estás?', timestamp: new Date() },
    ];
  }

  enviarMensaje() {
    if (this.nuevoMensaje.trim()) {
      this.mensajes.push({
        id: this.mensajes.length + 1,
        usuario: 'Tú',
        mensaje: this.nuevoMensaje,
        timestamp: new Date(),
      });
      this.nuevoMensaje = '';
    }
  }

  volver() {
    this.router.navigate(['/domiciliario/inicio']);
  }
}

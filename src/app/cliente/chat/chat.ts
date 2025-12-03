import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

interface Message {
  id?: number;
  contenido: string;
  emisor: 'cliente' | 'vendedor';
  timestamp: Date;
  leido: boolean;
}

@Component({
  selector: 'app-chat-cliente',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './chat.html',
  styleUrl: './chat.css',
})
export class ChatCliente implements OnInit {

  sucursalId: number | null = null;
  mensajes: Message[] = [];
  nuevoMensaje: string = '';
  cargando: boolean = false;
  nombreTienda: string = '';

  private api = 'http://127.0.0.1:8000/api';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.sucursalId = +params['id'];
      if (this.sucursalId) {
        this.cargarInfoTienda();
        this.cargarMensajes();
      }
    });
  }

  cargarInfoTienda() {
    this.http.get<any>(`${this.api}/branch/${this.sucursalId}`).subscribe({
      next: (sucursal) => {
        this.nombreTienda = sucursal.nombre_comercio || 'Tienda';
      },
      error: (err) => {
        console.error('Error al cargar info de tienda:', err);
      }
    });
  }

  cargarMensajes() {
    // TODO: Implementar endpoint de chat en el backend
    // Por ahora, mensajes de ejemplo
    this.mensajes = [
      {
        contenido: '¡Hola! Bienvenido a nuestra tienda. ¿En qué puedo ayudarte?',
        emisor: 'vendedor',
        timestamp: new Date(Date.now() - 3600000),
        leido: true
      }
    ];
  }

  enviarMensaje() {
    if (!this.nuevoMensaje.trim()) return;

    const mensaje: Message = {
      contenido: this.nuevoMensaje,
      emisor: 'cliente',
      timestamp: new Date(),
      leido: false
    };

    // TODO: Enviar al backend
    // this.http.post(`${this.api}/chat/send`, { ... }).subscribe(...)

    this.mensajes.push(mensaje);
    this.nuevoMensaje = '';

    // Simular respuesta del vendedor (temporal)
    setTimeout(() => {
      this.mensajes.push({
        contenido: 'Gracias por tu mensaje. Te responderemos pronto.',
        emisor: 'vendedor',
        timestamp: new Date(),
        leido: false
      });
    }, 2000);
  }

  volverATienda() {
    if (this.sucursalId) {
      this.router.navigate(['/tienda', this.sucursalId]);
    }
  }
}

import { Component, OnInit } from '@angular/core';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ComprobanteUploadComponent } from '../../components/comprobante-upload/comprobante-upload';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-chat-domiciliario',
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule, ComprobanteUploadComponent],
  templateUrl: './chat.html',
  styleUrl: './chat.css',
})
export class ChatDomiciliario implements OnInit {
  mensajes: any[] = [];
  nuevoMensaje: string = '';
  cargando: boolean = false;
  idPedido: string = ''; // ID del pedido actual
  comprobanteUrl: string = ''; // URL del comprobante subido

  constructor(
    private router: Router,
    private http: HttpClient,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit() {
    // Obtener idPedido de los route params
    this.activatedRoute.params.subscribe(params => {
      this.idPedido = params['idPedido'] || '';
      console.log('Chat abierto para pedido:', this.idPedido);
    });
    this.cargarMensajes();
  }

  cargarMensajes() {
    // Simulación de carga de mensajes desde el backend
    this.mensajes = [
      { id: 1, usuario: 'Administrador', mensaje: 'Bienvenido al chat', timestamp: new Date() },
      { id: 2, usuario: 'Tú', mensaje: 'Hola, ¿cómo estás?', timestamp: new Date() },
    ];
  }

  onComprobanteUploaded(imageUrl: string) {
    this.comprobanteUrl = imageUrl;
    this.enviarComprobante(imageUrl);
  }

  enviarComprobante(imageUrl: string) {
    if (!this.idPedido) {
      console.error('ID de pedido no especificado');
      return;
    }

    this.cargando = true;
    // Enviar comprobante al backend
    this.http.post(`/api/chat/${this.idPedido}/enviar`, {
      imagen_url: imageUrl
    }).subscribe({
      next: (response: any) => {
        this.mensajes.push({
          id: response.id,
          usuario: 'Tú',
          imagen_url: imageUrl,
          timestamp: new Date(),
        });
        this.comprobanteUrl = '';
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al enviar comprobante:', err);
        this.cargando = false;
      }
    });
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

import { Component, Input, OnInit, Inject, ViewChild, ElementRef, AfterViewInit, OnDestroy, NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { API_CONFIG, getApiUrl } from '../../config/api.config';

export interface ChatMessage {
  id?: number;
  id_remitente: number;
  id_destinatario: number;
  id_pedido: number;
  contenido: string;
  imagen_url?: string;
  tipo_imagen?: string;
  created_at?: string;
  emisor_rol?: string;
}

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: 'chat.component.html',
  styleUrls: ['chat.component.css'],
})
export class ChatComponent implements OnInit, AfterViewInit, OnDestroy {
      private intervaloMensajes: any;
      private visibilidadListener: (() => void) | null = null;
    @ViewChild('scrollMensajes') scrollMensajesRef!: ElementRef<HTMLDivElement>;
  @Input() userId!: number;
  @Input() userRol!: string;
  @Input() idPedido?: number; // Opcional para chat de pedido
  @Input() destinatarioId?: number; // Opcional para chat directo
  @Input() tipoChat: 'soporte' | 'pedido' | 'directo' = 'soporte';

  mensajes: ChatMessage[] = [];
  nuevoMensaje: string = '';
  cargando: boolean = false;
  imagenAdjunta: File | null = null;
  imagenPreview: string | null = null;
  tipoImagen: string = 'otro';
  tiposImagen = [
    { value: 'comprobante', label: 'Comprobante' },
    { value: 'producto', label: 'Producto' },
    { value: 'otro', label: 'Otro' }
  ];

  constructor(@Inject(HttpClient) private http: HttpClient, private ngZone: NgZone) {}

  ngOnInit() {
    this.cargarMensajes();
    // Solo refresca si la pestaña está visible
    this.ngZone.runOutsideAngular(() => {
      this.visibilidadListener = () => {
        if (document.visibilityState === 'visible') {
          this.cargarMensajes();
        }
      };
      document.addEventListener('visibilitychange', this.visibilidadListener);
      this.intervaloMensajes = setInterval(() => {
        if (document.visibilityState === 'visible') {
          this.ngZone.run(() => this.cargarMensajes());
        }
      }, 15000); // 15 segundos
    });
  }
  ngOnDestroy() {
    if (this.intervaloMensajes) {
      clearInterval(this.intervaloMensajes);
    }
    if (this.visibilidadListener) {
      document.removeEventListener('visibilitychange', this.visibilidadListener);
      this.visibilidadListener = null;
    }
  }

  ngAfterViewInit() {
    this.scrollToBottom();
  }

  cargarMensajes() {
    this.cargando = true;
    let url = '';
    if (this.tipoChat === 'pedido' && this.idPedido) {
      url = getApiUrl(`/api/chat/${this.idPedido}`);
    } else if (this.tipoChat === 'directo' && this.destinatarioId) {
      url = getApiUrl(`/api/chat/directo/${this.userId}/${this.destinatarioId}`);
    } else {
      // Chat de soporte por defecto
      url = getApiUrl(`/api/chat/soporte/${this.userId}`);
    }
    this.http.get<ChatMessage[]>(url)
      .subscribe({
        next: (mensajes) => {
          // Si la respuesta no es un array, asigna un array vacío
          this.mensajes = Array.isArray(mensajes) ? mensajes : [];
          this.cargando = false;
          setTimeout(() => this.scrollToBottom(), 100);
        },
        error: () => {
          this.cargando = false;
        }
      });
  }

  onImagenSeleccionada(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.imagenAdjunta = file;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagenPreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  enviarMensaje() {
    if (!this.nuevoMensaje.trim() && !this.imagenAdjunta) return;

    if (this.imagenAdjunta) {
      // Subir imagen primero
      const formData = new FormData();
      formData.append('imagen', this.imagenAdjunta);
      this.http.post(getApiUrl(API_CONFIG.endpoints.upload), formData).subscribe({
        next: (resp: any) => {
          const imagen_url = resp.url || resp.imagen_url;
          this.enviarMensajeConImagen(imagen_url);
        },
        error: () => {
          alert('Error al subir la imagen');
        }
      });
    } else {
      // Solo texto
      const body: any = {
        contenido: this.nuevoMensaje
      };
      let url = '';
      if (this.tipoChat === 'pedido' && this.idPedido) {
        url = getApiUrl(`/api/chat/${this.idPedido}/enviar`);
      } else if (this.tipoChat === 'directo' && this.destinatarioId) {
        url = getApiUrl(`/api/chat/directo/${this.userId}/${this.destinatarioId}/enviar`);
      } else {
        url = getApiUrl(`/api/chat/soporte/${this.userId}/enviar`);
      }
      this.http.post(url, body)
        .subscribe({
          next: (resp: any) => {
            // Si el backend devuelve los mensajes, actualiza; si no, agrega el mensaje localmente
            if (Array.isArray(resp)) {
              this.mensajes = resp;
            } else {
              this.mensajes.push({
                id_remitente: this.userId,
                id_destinatario: this.destinatarioId ?? 0,
                id_pedido: this.idPedido ?? 0,
                contenido: this.nuevoMensaje,
                created_at: new Date().toISOString(),
                emisor_rol: this.userRol
              });
            }
            this.nuevoMensaje = '';
            setTimeout(() => this.scrollToBottom(), 100);
            this.cargarMensajes(); // Refresca mensajes tras enviar
          }
        });
    }
  }

  enviarMensajeConImagen(imagen_url: string) {
    const body: any = {
      contenido: this.nuevoMensaje,
      imagen_url,
      tipo_imagen: this.tipoImagen
    };
    let url = '';
    if (this.tipoChat === 'pedido' && this.idPedido) {
      url = getApiUrl(`/api/chat/${this.idPedido}/enviar`);
    } else if (this.tipoChat === 'directo' && this.destinatarioId) {
      url = getApiUrl(`/api/chat/directo/${this.userId}/${this.destinatarioId}/enviar`);
    } else {
      url = getApiUrl(`/api/chat/soporte/${this.userId}/enviar`);
    }
    this.http.post(url, body)
      .subscribe({
        next: (resp: any) => {
          if (Array.isArray(resp)) {
            this.mensajes = resp;
          } else {
            this.mensajes.push({
              id_remitente: this.userId,
              id_destinatario: this.destinatarioId ?? 0,
              id_pedido: this.idPedido ?? 0,
              contenido: this.nuevoMensaje,
              imagen_url,
              tipo_imagen: this.tipoImagen,
              created_at: new Date().toISOString(),
              emisor_rol: this.userRol
            });
          }
          this.nuevoMensaje = '';
          this.imagenAdjunta = null;
          this.imagenPreview = null;
          this.tipoImagen = 'otro';
          setTimeout(() => this.scrollToBottom(), 100);
          this.cargarMensajes();
        }
      });
  }

  private scrollToBottom() {
    try {
      if (this.scrollMensajesRef && this.scrollMensajesRef.nativeElement) {
        this.scrollMensajesRef.nativeElement.scrollTop = this.scrollMensajesRef.nativeElement.scrollHeight;
      }
    } catch {}
  }
}

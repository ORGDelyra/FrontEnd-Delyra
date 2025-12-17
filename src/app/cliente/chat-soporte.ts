import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatComponent } from '../components/chat/chat.component';
import { AuthService } from '../services/auth';

@Component({
  selector: 'app-chat-soporte',
  standalone: true,
  imports: [CommonModule, ChatComponent],
  template: `
    <div class="max-w-2xl mx-auto py-8">
      <h2 class="text-2xl font-bold mb-4 text-center">Chat con Soporte</h2>
      <app-chat
        [idPedido]="0"
        [userId]="userId"
        [userRol]="'cliente'">
      </app-chat>
    </div>
  `
})
export class ChatSoporteCliente {
  userId: number = 0;
  constructor() {
    const auth = inject(AuthService);
    const user = auth.getUser();
    this.userId = user?.id || user?.id_usuario || 0;
  }
}

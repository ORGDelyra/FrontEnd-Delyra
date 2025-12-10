import { Injectable } from '@angular/core';
import { ToastComponent } from '../components/toast/toast';
import { PushNotifications, Token, PushNotification, ActionPerformed } from '@capacitor/push-notifications';

@Injectable({ providedIn: 'root' })
export class PushNotificationService {
  private toastGetter: (() => ToastComponent) | null = null;

  setToastComponent(getter: () => ToastComponent) {
    this.toastGetter = getter;
  }

  initPush() {
    PushNotifications.requestPermissions().then((result: any) => {
      if (result.receive === 'granted') {
        PushNotifications.register();
      }
    });

    PushNotifications.addListener('registration', (token: Token) => {
      console.log('Push registration success, token: ', token.value);
      // Aquí puedes enviar el token al backend para asociarlo al usuario
    });

    PushNotifications.addListener('registrationError', (error: any) => {
      console.error('Push registration error: ', error);
    });

    PushNotifications.addListener('pushNotificationReceived', (notification: PushNotification) => {
      console.log('Push received: ', notification);
      // Personalización de mensajes según el tipo de evento
      if (notification.data?.tipo === 'nuevo_pedido') {
        this.mostrarToast('🛎️ Nuevo pedido disponible', notification.body ?? '');
      } else if (notification.data?.tipo === 'confirmacion_pedido') {
        this.mostrarToast('✅ Pedido confirmado', notification.body ?? '');
      } else if (notification.data?.tipo === 'cambio_estado') {
        this.mostrarToast('🔄 Estado actualizado', notification.body ?? '');
      } else {
        this.mostrarToast(notification.title || 'Notificación', notification.body ?? '');
      }
    });

    PushNotifications.addListener('pushNotificationActionPerformed', (action: ActionPerformed) => {
      console.log('Push action performed: ', action);
      // Ejemplo: navegar según el tipo de notificación
      if (action.notification.data?.tipo === 'nuevo_pedido') {
        window.location.href = '/domiciliario/inicio';
      } else if (action.notification.data?.tipo === 'confirmacion_pedido') {
        window.location.href = '/cliente/pedidos';
      } else if (action.notification.data?.tipo === 'cambio_estado') {
        window.location.href = '/pedidos';
      }
    });
  }

  mostrarToast(titulo: string, mensaje: string, icon: string = '🔔') {
    if (this.toastGetter) {
      const toast = this.toastGetter();
      if (toast) {
        toast.show(titulo, mensaje, icon);
        return;
      }
    }
    // Fallback por si no está el componente
    alert(`${titulo}\n${mensaje}`);
  }
}

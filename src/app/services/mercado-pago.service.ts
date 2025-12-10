import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../config/api.config';

@Injectable({
  providedIn: 'root'
})
export class MercadoPagoService {

  private api = API_CONFIG.BASE_URL + API_CONFIG.endpoints.mercadoPago;

  // Credenciales de prueba (públicas - se pueden exponer en el frontend)
  public publicKey = 'APP_USR-2a39692b-dfd9-465b-a4b0-4b4955219ecc';

  constructor(private http: HttpClient) {}

  /**
   * Crear preferencia de pago en Mercado Pago
   * La preferencia contiene los detalles del pedido
   * Los montos deben estar en COP (Pesos Colombianos) - valores enteros sin decimales
   *
   * @param datos Datos del pedido con items y cliente
   * @returns Observable con preference_id e init_point para redirigir
   */
  crearPreferenciaPago(datos: {
    pedidoId: number;
    items: Array<{ id: string; title: string; quantity: number; unit_price: number }>;
    total: number;
    cliente: { nombre: string; email: string; telefono: string };
  }): Observable<any> {
    return this.http.post(`${this.api}/crear-preferencia`, datos);
  }

  /**
   * Verificar estado de pago
   */
  verificarPago(preferenciaMercadoPagoId: string): Observable<any> {
    return this.http.get(`${this.api}/verificar/${preferenciaMercadoPagoId}`);
  }

  /**
   * Procesar webhook de Mercado Pago (confirmación de pago)
   */
  procesarWebhookPago(datos: any): Observable<any> {
    return this.http.post(`${this.api}/webhook`, datos);
  }

  /**
   * Obtener la URL del script de Mercado Pago
   */
  cargarScriptMercadoPago(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Verificar si ya está cargado
      if ((window as any).MercadoPago) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://sdk.mercadopago.com/js/v2';
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Error cargando SDK de Mercado Pago'));
      document.body.appendChild(script);
    });
  }
}

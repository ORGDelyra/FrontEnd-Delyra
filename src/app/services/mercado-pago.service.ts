import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MercadoPagoService {

  private api = 'https://backend-delyra-production.up.railway.app/api';
  
  // Credenciales de prueba (públicas - se pueden exponer en el frontend)
  public publicKey = 'APP_USR-2a39692b-dfd9-465b-a4b0-4b4955219ecc';

  constructor(private http: HttpClient) {}

  /**
   * Crear preferencia de pago en Mercado Pago
   * La preferencia contiene los detalles del pedido
   */
  crearPreferenciaPago(datos: {
    pedidoId: number;
    items: Array<{ id: string; title: string; quantity: number; unit_price: number }>;
    total: number;
    cliente: { nombre: string; email: string; telefono: string };
  }): Observable<any> {
    return this.http.post(`${this.api}/mercado-pago/crear-preferencia`, datos);
  }

  /**
   * Verificar estado de pago
   */
  verificarPago(preferenciaMercadoPagoId: string): Observable<any> {
    return this.http.get(`${this.api}/mercado-pago/verificar/${preferenciaMercadoPagoId}`);
  }

  /**
   * Procesar webhook de Mercado Pago (confirmación de pago)
   */
  procesarWebhookPago(datos: any): Observable<any> {
    return this.http.post(`${this.api}/mercado-pago/webhook`, datos);
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

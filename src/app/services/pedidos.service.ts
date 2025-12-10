import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Cart,
  CrearPedidoRequest,
  ActualizarEstadoRequest,
  AsignarDomiciliarioRequest,
  MarcarEntregadoRequest,
  MarcarRecogidoRequest
} from '../interfaces/cart.interface';
import { API_CONFIG } from '../config/api.config';

@Injectable({
  providedIn: 'root'
})
export class PedidosService {

  private api = API_CONFIG.BASE_URL + API_CONFIG.endpoints.auth;

  constructor(private http: HttpClient) {}

  // ========== CLIENTE ==========

  /**
   * Crear un nuevo pedido (recogida o domicilio)
   * POST /api/cart/crear-pedido
   */
  crearPedido(data: CrearPedidoRequest): Observable<any> {
    return this.http.post(`${this.api}/cart/crear-pedido`, data);
  }

  /**
   * Ver mis pedidos (cliente)
   * GET /api/cart/mis-pedidos
   */
  obtenerMisPedidos(): Observable<Cart[]> {
    return this.http.get<Cart[]>(`${this.api}/cart/mis-pedidos`);
  }

  /**
   * Marcar pedido como recogido (cliente)
   * PUT /api/cart/{id}/marcar-recogido
   */
  marcarComoRecogido(id: number, data?: MarcarRecogidoRequest): Observable<any> {
    return this.http.put(`${this.api}/cart/${id}/marcar-recogido`, data || {});
  }

  // ========== VENDEDOR ==========

  /**
   * Ver pedidos de la tienda (vendedor)
   * GET /api/cart/pedidos-tienda
   */
  obtenerPedidosTienda(): Observable<Cart[]> {
    return this.http.get<Cart[]>(`${this.api}/cart/pedidos-tienda`);
  }

  /**
   * Actualizar estado del pedido (vendedor)
   * PUT /api/cart/{id}/estado
   */
  actualizarEstadoPedido(id: number, data: ActualizarEstadoRequest): Observable<any> {
    return this.http.put(`${this.api}/cart/${id}/estado`, data);
  }

  /**
   * Asignar domiciliario a un pedido (vendedor)
   * PUT /api/cart/{id}/asignar-domiciliario
   */
  asignarDomiciliario(id: number, data: AsignarDomiciliarioRequest): Observable<any> {
    return this.http.put(`${this.api}/cart/${id}/asignar-domiciliario`, data);
  }

  // ========== DOMICILIARIO ==========

  /**
   * Ver pedidos DISPONIBLES para tomar (sin domiciliario asignado)
   * GET /api/cart/pedidos-disponibles
   * ✨ NUEVO ENDPOINT - Backend implementado
   */
  obtenerPedidosDisponibles(): Observable<Cart[]> {
    return this.http.get<Cart[]>(`${this.api}/cart/pedidos-disponibles`);
  }

  /**
   * TOMAR un pedido disponible (asignarse a sí mismo)
   * PUT /api/cart/{id}/tomar-pedido
   * ✨ NUEVO ENDPOINT - Backend implementado
   * Cambios automáticos:
   * - id_domiciliario = user.id
   * - estado_pedido = 'en_camino'
   */
  tomarPedido(id: number): Observable<any> {
    return this.http.put(`${this.api}/cart/${id}/tomar-pedido`, {});
  }

  /**
   * Ver mis entregas YA TOMADAS (domiciliario)
   * GET /api/cart/mis-entregas
   */
  obtenerMisEntregas(): Observable<Cart[]> {
    return this.http.get<Cart[]>(`${this.api}/cart/mis-entregas`);
  }

  /**
   * Marcar pedido como entregado (domiciliario)
   * PUT /api/cart/{id}/marcar-entregado
   */
  marcarComoEntregado(id: number, data?: MarcarEntregadoRequest): Observable<any> {
    return this.http.put(`${this.api}/cart/${id}/marcar-entregado`, data || {});
  }

  // ========== MÉTODOS AUXILIARES ==========

  /**
   * Obtener pedido por ID
   */
  obtenerPedidoPorId(id: number): Observable<Cart> {
    return this.http.get<Cart>(`${this.api}/cart/${id}`);
  }

  /**
   * Obtener lista de domiciliarios disponibles
   * GET /api/user?filter[id_rol]=4
   */
  obtenerDomiciliarios(): Observable<any[]> {
    return this.http.get<any[]>(`${this.api}/user?filter[id_rol]=4`);
  }
}

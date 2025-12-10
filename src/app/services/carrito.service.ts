import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Cart, ProductSelect, AddToCartRequest, PaymentTransaction } from '../interfaces/cart.interface';
import { API_CONFIG } from '../config/api.config';

@Injectable({
  providedIn: 'root'
})
export class CarritoService {

  private api = API_CONFIG.BASE_URL + API_CONFIG.endpoints.auth;

  constructor(private http: HttpClient) {}

  // Operaciones con carritos (REST estándar - singular)
  crearCarrito(): Observable<Cart> {
    return this.http.post<Cart>(`${this.api}/cart`, {});
  }

  obtenerCarritoPorId(id: number): Observable<Cart> {
    return this.http.get<Cart>(`${this.api}/cart/${id}`);
  }

  obtenerCarritos(): Observable<Cart[]> {
    return this.http.get<Cart[]>(`${this.api}/cart`);
  }

  actualizarCarrito(id: number, data: any): Observable<Cart> {
    return this.http.put<Cart>(`${this.api}/cart/${id}`, data);
  }

  eliminarCarrito(id: number): Observable<any> {
    return this.http.delete(`${this.api}/cart/${id}`);
  }

  // Ver carrito del usuario actual (método especial de ProductController)
  obtenerCarritoUsuarioActual(): Observable<Cart> {
    return this.http.get<Cart>(`${this.api}/cart/view`);
  }

  // Agregar producto al carrito usando método especial de ProductController
  agregarProductoAlCarrito(idProducto: number, cantidad: number = 1): Observable<any> {
    return this.http.post(`${this.api}/product/${idProducto}/add-to-cart`, { cantidad });
  }

  // Operaciones con productos del carrito (usando CartController)
  agregarProductoACarrito(idCarrito: number, idProducto: number, cantidad: number): Observable<any> {
    return this.http.post(`${this.api}/cart/${idCarrito}/products`, {
      id_producto: idProducto,
      cantidad
    });
  }

  actualizarCantidadProducto(idCarrito: number, idProducto: number, cantidad: number): Observable<any> {
    return this.http.put(`${this.api}/cart/${idCarrito}/products/${idProducto}`, { cantidad });
  }

  eliminarProductoDelCarrito(idCarrito: number, idProducto: number): Observable<any> {
    return this.http.delete(`${this.api}/cart/${idCarrito}/products/${idProducto}`);
  }

  // Procesar compra (checkout) - método especial de ProductController
  procesarCompra(): Observable<any> {
    return this.http.post(`${this.api}/cart/checkout`, {});
  }

  // Operaciones con transacciones de pago
  crearTransaccionPago(data: { id_carrito: number; monto: number; metodo_pago: string }): Observable<PaymentTransaction> {
    return this.http.post<PaymentTransaction>(`${this.api}/transaction`, data);
  }

  crearTransaccionDesdeCarrito(data: { id_carrito: number; monto: number; metodo_pago: string }): Observable<PaymentTransaction> {
    return this.http.post<PaymentTransaction>(`${this.api}/transaction/from-cart`, data);
  }

  obtenerTransaccionPorId(id: number): Observable<PaymentTransaction> {
    return this.http.get<PaymentTransaction>(`${this.api}/transaction/${id}`);
  }

  obtenerTransacciones(): Observable<PaymentTransaction[]> {
    return this.http.get<PaymentTransaction[]>(`${this.api}/transaction`);
  }

  actualizarEstadoTransaccion(id: number, estado: string): Observable<any> {
    return this.http.put(`${this.api}/transaction/${id}`, { estado });
  }
}


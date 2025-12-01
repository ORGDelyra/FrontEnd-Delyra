import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = 'http://127.0.0.1:8000/api/product';

  constructor(private http: HttpClient) {}

  /**
   * Crea un nuevo producto con imagen
   */
  crearProducto(productData: any): Observable<any> {
    return this.http.post(this.apiUrl, productData);
  }

  /**
   * Actualiza un producto existente
   */
  actualizarProducto(id: number, productData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, productData);
  }

  /**
   * Obtiene todos los productos
   */
  obtenerProductos(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  /**
   * Obtiene un producto específico
   */
  obtenerProducto(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  /**
   * Elimina un producto
   */
  eliminarProducto(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  /**
   * Obtiene productos por categoría
   */
  obtenerProductosPorCategoria(idCategoria: number): Observable<any> {
    return this.http.get(`${this.apiUrl}?id_categoria=${idCategoria}`);
  }

  /**
   * Busca productos por nombre
   */
  buscarProductos(query: string): Observable<any> {
    return this.http.get(`${this.apiUrl}?search=${query}`);
  }
}

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Branch, CreateBranchRequest } from '../interfaces/branch.interface';
import { Product, CreateProductRequest, UpdateProductRequest } from '../interfaces/product.interface';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { API_CONFIG } from '../config/api.config';

@Injectable({
  providedIn: 'root'
})
export class VendedorService {

  private api = API_CONFIG.BASE_URL + API_CONFIG.endpoints.auth;

  constructor(private http: HttpClient) {}

  // Obtener headers con token
  private getHeaders() {
    const token = localStorage.getItem('token') ?? '';
    return {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${token}`
      })
    };
  }

  // ---------- Sucursales ----------
  crearSucursal(data: CreateBranchRequest): Observable<any> {
    return this.http.post(`${this.api}/branch`, data, this.getHeaders());
  }

  obtenerSucursales(): Observable<Branch[]> {
    return this.http.get<Branch[]>(`${this.api}/branch`, this.getHeaders());
  }

  obtenerSucursalPorId(id: number): Observable<Branch> {
    return this.http.get<Branch>(`${this.api}/branch/${id}`, this.getHeaders());
  }

  actualizarSucursal(id: number, data: Partial<CreateBranchRequest>): Observable<any> {
    return this.http.put(`${this.api}/branch/${id}`, data, this.getHeaders());
  }

  eliminarSucursal(id: number): Observable<any> {
    return this.http.delete(`${this.api}/branch/${id}`, this.getHeaders());
  }

  // ---------- Productos ----------
  crearProducto(data: CreateProductRequest): Observable<any> {
    return this.http.post(`${this.api}/product`, data, this.getHeaders());
  }

  obtenerProductos(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.api}/product`, this.getHeaders());
  }

  obtenerProductoPorId(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.api}/product/${id}`, this.getHeaders());
  }

  actualizarProducto(id: number, data: UpdateProductRequest): Observable<any> {
    return this.http.put(`${this.api}/product/${id}`, data, this.getHeaders());
  }

  eliminarProducto(id: number): Observable<any> {
    return this.http.delete(`${this.api}/product/${id}`, this.getHeaders());
  }

  // ---------- Categorías ----------
  // Endpoint público - no requiere autenticación
  obtenerCategorias(): Observable<any> {
    console.log('📡 VendedorService: Llamando GET /category');
    return this.http.get<any>(`${this.api}/category`);
  }

  // Crear categoría (requiere autenticación)
  crearCategoria(data: { nombre_categoria: string }): Observable<any> {
    return this.http.post(`${this.api}/category`, data, this.getHeaders());
  }
}

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Branch, CreateBranchRequest } from '../interfaces/branch.interface';
import { Product, CreateProductRequest, UpdateProductRequest } from '../interfaces/product.interface';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class VendedorService {

  private api = 'http://127.0.0.1:8000/api';

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
  obtenerCategorias(): Observable<any[]> {
    return this.http.get<any[]>(`${this.api}/category`, this.getHeaders());
  }
}

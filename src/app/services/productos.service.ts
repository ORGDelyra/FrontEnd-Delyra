import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product, Category } from '../interfaces/product.interface';

@Injectable({
  providedIn: 'root'
})
export class ProductosService {

  private api = 'http://127.0.0.1:8000/api';

  constructor(private http: HttpClient) {}

  // Obtener todos los productos
  obtenerProductos(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.api}/product`);
  }

  // Obtener producto por ID
  obtenerProductoPorId(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.api}/product/${id}`);
  }

  // Obtener productos por categoría
  obtenerProductosPorCategoria(idCategoria: number): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.api}/product?categoria=${idCategoria}`);
  }

  // Obtener todas las categorías
  obtenerCategorias(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.api}/category`);
  }

  // Obtener categoría por ID
  obtenerCategoriaPorId(id: number): Observable<Category> {
    return this.http.get<Category>(`${this.api}/category/${id}`);
  }
}


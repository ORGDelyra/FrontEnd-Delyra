import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product, Category } from '../interfaces/product.interface';

@Injectable({
  providedIn: 'root'
})
export class ProductosService {

  private api = 'https://backend-delyra-production.up.railway.app/api';

  constructor(private http: HttpClient) {}

  // Obtener todos los productos (público - para clientes)
  obtenerProductos(): Observable<Product[]> {
    console.log('📡 ProductosService: Llamando GET /products/public (endpoint público)');
    return this.http.get<Product[]>(`${this.api}/products/public`);
  }

  // Obtener productos de una sucursal específica (para perfil de tienda)
  obtenerProductosPorSucursal(idSucursal: number): Observable<Product[]> {
    console.log(`📡 ProductosService: Productos de sucursal ${idSucursal}`);
    return this.http.get<Product[]>(`${this.api}/products/branch/${idSucursal}`);
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


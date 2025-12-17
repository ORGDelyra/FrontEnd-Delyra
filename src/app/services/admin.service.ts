// ...existing imports...
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../interfaces/user.interface';
import { Branch } from '../interfaces/branch.interface';
import { Product } from '../interfaces/product.interface';
import { Cart } from '../interfaces/cart.interface';
import { API_CONFIG } from '../config/api.config';

@Injectable({
  providedIn: 'root'
})
export class AdminService {

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

  // ========== USUARIOS ==========
  obtenerUsuarios(filtro?: any): Observable<any> {
    let params = '';
    if (filtro && Object.keys(filtro).length > 0) {
      params = '?' + Object.entries(filtro)
        .filter(([k, v]) => v !== undefined && v !== null && v !== '')
        .map(([k, v]) => {
          if (k === 'per_page' || k === 'page') {
            return `${k}=${encodeURIComponent(String(v))}`;
          }
          return `filter[${k}]=${encodeURIComponent(String(v))}`;
        })
        .join('&');
    }
    return this.http.get<any>(`${this.api}/user${params}`, this.getHeaders());
  }

  obtenerUsuarioPorId(id: number): Observable<User> {
    return this.http.get<User>(`${this.api}/user/${id}`, this.getHeaders());
  }

  crearUsuario(data: any): Observable<any> {
    return this.http.post(`${this.api}/user`, data, this.getHeaders());
  }

  actualizarUsuario(id: number, data: Partial<User>): Observable<any> {
    return this.http.put(`${this.api}/user/${id}`, data, this.getHeaders());
  }

  eliminarUsuario(id: number): Observable<any> {
    return this.http.delete(`${this.api}/user/${id}`, this.getHeaders());
  }

  // ========== ROLES ==========
  obtenerRoles(): Observable<any[]> {
    return this.http.get<any[]>(`${this.api}/rol`, this.getHeaders());
  }

  obtenerRolPorId(id: number): Observable<any> {
    return this.http.get<any>(`${this.api}/rol/${id}`, this.getHeaders());
  }

  crearRol(data: any): Observable<any> {
    return this.http.post(`${this.api}/rol`, data, this.getHeaders());
  }

  actualizarRol(id: number, data: any): Observable<any> {
    return this.http.put(`${this.api}/rol/${id}`, data, this.getHeaders());
  }

  eliminarRol(id: number): Observable<any> {
    return this.http.delete(`${this.api}/rol/${id}`, this.getHeaders());
  }

  // ========== CATEGORÍAS ==========
  obtenerCategorias(): Observable<any[]> {
    return this.http.get<any[]>(`${this.api}/category`, this.getHeaders());
  }

  obtenerCategoriaPorId(id: number): Observable<any> {
    return this.http.get<any>(`${this.api}/category/${id}`, this.getHeaders());
  }

  crearCategoria(data: any): Observable<any> {
    return this.http.post(`${this.api}/category`, data, this.getHeaders());
  }

  actualizarCategoria(id: number, data: any): Observable<any> {
    return this.http.put(`${this.api}/category/${id}`, data, this.getHeaders());
  }

  eliminarCategoria(id: number): Observable<any> {
    return this.http.delete(`${this.api}/category/${id}`, this.getHeaders());
  }

  // ========== SUCURSALES ==========
  obtenerTodasLasSucursales(): Observable<Branch[]> {
    return this.http.get<Branch[]>(`${this.api}/branch`, this.getHeaders());
  }

  // ========== PRODUCTOS ==========
  obtenerTodosLosProductos(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.api}/product`, this.getHeaders());
  }

  // ========== PEDIDOS ==========
  obtenerTodosLosPedidos(): Observable<Cart[]> {
    return this.http.get<Cart[]>(`${this.api}/cart`, this.getHeaders());
  }

  // ========== ESTADÍSTICAS ==========
  obtenerEstadisticas(): Observable<any> {
    // Este endpoint debería crearse en el backend
    // Por ahora retornamos datos calculados desde el frontend
    return new Observable(observer => {
      Promise.all([
        this.obtenerUsuarios().toPromise(),
        this.obtenerTodosLosPedidos().toPromise(),
        this.obtenerTodosLosProductos().toPromise(),
        this.obtenerTodasLasSucursales().toPromise()
      ]).then(([usuarios, pedidos, productos, sucursales]) => {
        const stats = {
          totalUsuarios: usuarios?.length || 0,
          totalPedidos: pedidos?.length || 0,
          totalProductos: productos?.length || 0,
          totalSucursales: sucursales?.length || 0,
          usuariosPorRol: this.contarUsuariosPorRol(usuarios || []),
          pedidosPorEstado: this.contarPedidosPorEstado(pedidos || [])
        };
        observer.next(stats);
        observer.complete();
      }).catch(err => {
        observer.error(err);
      });
    });
  }

  private contarUsuariosPorRol(usuarios: User[]): any {
    const conteo: any = {};
    usuarios.forEach(user => {
      const rol = user.id_rol;
      conteo[rol] = (conteo[rol] || 0) + 1;
    });
    return conteo;
  }

  private contarPedidosPorEstado(pedidos: Cart[]): any {
    const conteo: any = {};
    pedidos.forEach(pedido => {
      const estado = pedido.estado_pedido || 'sin_estado';
      conteo[estado] = (conteo[estado] || 0) + 1;
    });
    return conteo;
  }
  obtenerChatsRecientesSoporte(): Observable<any[]> {
    return this.http.get<any[]>(`${API_CONFIG.BASE_URL}/chat/soporte/recientes`, this.getHeaders());
  }
}


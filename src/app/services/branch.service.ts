import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../config/api.config';

@Injectable({
  providedIn: 'root'
})
export class BranchService {
  private apiUrl = API_CONFIG.BASE_URL + API_CONFIG.endpoints.branch;

  constructor(private http: HttpClient) {}

  /**
   * Crea una nueva sucursal con logo y NIT
   */
  crearSucursal(branchData: any): Observable<any> {
    return this.http.post(this.apiUrl, branchData);
  }

  /**
   * Actualiza una sucursal existente
   */
  actualizarSucursal(id: number, branchData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, branchData);
  }

  /**
   * Obtiene todas las sucursales
   */
  obtenerSucursales(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  /**
   * Obtiene una sucursal específica
   */
  obtenerSucursal(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  /**
   * Elimina una sucursal
   */
  eliminarSucursal(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  /**
   * Obtiene sucursales por comercio
   */
  obtenerSucursalesPorComercio(idComercio: number): Observable<any> {
    return this.http.get(`${this.apiUrl}?id_commerce=${idComercio}`);
  }

  /**
   * Busca sucursales por ubicación (lat/lng)
   */
  buscarPorUbicacion(latitud: number, longitud: number, radio: number = 5): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/nearby?lat=${latitud}&lng=${longitud}&radius=${radio}`
    );
  }
}

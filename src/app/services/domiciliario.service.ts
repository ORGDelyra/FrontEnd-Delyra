import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Vehicle, CreateVehicleRequest } from '../interfaces/vehicle.interface';
import { Domicilio, CreateDomicilioRequest } from '../interfaces/domicilio.interface';
import { Shipment } from '../interfaces/cart.interface';

@Injectable({
  providedIn: 'root'
})
export class DomiciliarioService {

  private api = 'http://127.0.0.1:8000/api';

  constructor(private http: HttpClient) {}

  // Operaciones con vehículos
  crearVehiculo(data: CreateVehicleRequest): Observable<any> {
    return this.http.post(`${this.api}/vehicle`, data);
  }

  /*createDomicilioServi(data: CreateDomicilioRequest): Observable<any> {
    return this.http.post(`${this.api}/domicilio`, data);
  }*/

  obtenerVehiculos(): Observable<Vehicle[]> {
    return this.http.get<Vehicle[]>(`${this.api}/vehicle`);
  }

  obtenerVehiculoPorId(id: number): Observable<Vehicle> {
    return this.http.get<Vehicle>(`${this.api}/vehicle/${id}`);
  }

  actualizarVehiculo(id: number, data: Partial<CreateVehicleRequest>): Observable<any> {
    return this.http.put(`${this.api}/vehicle/${id}`, data);
  }

  eliminarVehiculo(id: number): Observable<any> {
    return this.http.delete(`${this.api}/vehicle/${id}`);
  }

  // Operaciones con servicios (Service - para domiciliarios)
  crearServicio(data: { id_usuario: number; estado_dispo?: string }): Observable<any> {
    return this.http.post(`${this.api}/service`, data);
  }

  obtenerServicios(): Observable<any[]> {
    return this.http.get<any[]>(`${this.api}/service`);
  }

  obtenerServiciosDisponibles(): Observable<any[]> {
    return this.http.get<any[]>(`${this.api}/service/disponibles`);
  }

  obtenerServicioPorId(id: number): Observable<any> {
    return this.http.get<any>(`${this.api}/service/${id}`);
  }

  actualizarEstadoServicio(id: number, estado: string): Observable<any> {
    return this.http.put(`${this.api}/service/${id}/estado`, { estado_dispo: estado });
  }

  actualizarServicio(id: number, data: any): Observable<any> {
    return this.http.put(`${this.api}/service/${id}`, data);
  }

  // Operaciones con envíos (shipments) - corregido a minúscula
  obtenerEnvios(): Observable<Shipment[]> {
    return this.http.get<Shipment[]>(`${this.api}/shipment`);
  }

  obtenerEnviosDisponibles(): Observable<Shipment[]> {
    return this.http.get<Shipment[]>(`${this.api}/shipment/disponibles`);
  }

  obtenerEnvioPorId(id: number): Observable<Shipment> {
    return this.http.get<Shipment>(`${this.api}/shipment/${id}`);
  }

  aceptarPedido(idEnvio: number): Observable<any> {
    return this.http.put(`${this.api}/shipment/${idEnvio}/aceptar`, {});
  }

  completarPedido(idEnvio: number): Observable<any> {
    return this.http.put(`${this.api}/shipment/${idEnvio}/completar`, {});
  }

  actualizarEstadoEnvio(id: number, estado: string): Observable<any> {
    return this.http.put(`${this.api}/shipment/${id}/estado`, { estado });
  }
}


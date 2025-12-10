import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_CONFIG } from '../config/api.config';

@Injectable({
  providedIn: 'root'
})
export class RegistroService {

  private api = API_CONFIG.BASE_URL + API_CONFIG.endpoints.auth;

  constructor(private http: HttpClient) {}

  registrarUsuario(data: any) {
    return this.http.post(`${this.api}/registro`, data);
  }
}

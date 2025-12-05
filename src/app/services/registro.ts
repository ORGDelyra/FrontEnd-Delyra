import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class RegistroService {

  private api = 'https://backend-delyra-production.up.railway.app/api';

  constructor(private http: HttpClient) {}

  registrarUsuario(data: any) {
    return this.http.post(`${this.api}/registro`, data);
  }
}

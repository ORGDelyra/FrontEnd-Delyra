import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://127.0.0.1:8000/api/user';

  constructor(private http: HttpClient) {}

  /**
   * Obtiene el perfil del usuario autenticado
   */
  obtenerPerfil(): Observable<any> {
    return this.http.get(`${this.apiUrl}/profile`);
  }

  /**
   * Actualiza la foto de perfil del usuario
   */
  actualizarFotoPerfil(profileUrl: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/profile-image`, { profile_url: profileUrl });
  }

  /**
   * Actualiza datos del perfil del usuario
   */
  actualizarPerfil(datos: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/profile`, datos);
  }

  /**
   * Obtiene un usuario específico
   */
  obtenerUsuario(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  /**
   * Elimina la cuenta del usuario
   */
  eliminarCuenta(): Observable<any> {
    return this.http.delete(`${this.apiUrl}/profile`);
  }

  /**
   * Obtiene todos los usuarios (solo para administrador)
   */
  obtenerUsuarios(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  /**
   * Cambia la contraseña del usuario
   */
  cambiarPassword(passwordActual: string, passwordNueva: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/change-password`, {
      current_password: passwordActual,
      new_password: passwordNueva,
      new_password_confirmation: passwordNueva
    });
  }
}

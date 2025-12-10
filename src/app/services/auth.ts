import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { API_CONFIG } from '../config/api.config';
import { mapIdRolToString } from '../utils/rol.utils';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = API_CONFIG.BASE_URL + API_CONFIG.endpoints.auth;
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasToken());
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(private http: HttpClient) {
    // Verificar si hay token almacenado al inicializar el servicio
    this.checkAuthStatus();
  }

  private hasToken(): boolean {
    const token = localStorage.getItem('token');
    return !!token;
  }

  private checkAuthStatus() {
    const hasToken = this.hasToken();
    this.isAuthenticatedSubject.next(hasToken);
  }

  register(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/registro`, data);
  }

  login(data: any): Observable<any> {
    console.log("\n[🔑 AuthService.login] Iniciando login con:", data.correo);

    return this.http.post(`${this.apiUrl}/inicio/sesion`, data).pipe(
      tap((res: any) => {
        console.log("[🔑 AuthService.login] ✅ Respuesta recibida:", res);

        // Guardar token - intentar ambas formas comunes
        if (res.token) {
          localStorage.setItem('token', res.token);
          console.log(`[🔑 AuthService.login] ✅ Token guardado (res.token): "${res.token.substring(0, 30)}..."`);
        } else if (res.access_token) {
          localStorage.setItem('token', res.access_token);
          console.log(`[🔑 AuthService.login] ✅ Token guardado (res.access_token): "${res.access_token.substring(0, 30)}..."`);
        } else if (res.data?.token) {
          localStorage.setItem('token', res.data.token);
          console.log(`[🔑 AuthService.login] ✅ Token guardado (res.data.token): "${res.data.token.substring(0, 30)}..."`);
        } else {
          console.warn("[🔑 AuthService.login] ⚠️ No se encontró token en la respuesta. Propiedades:", Object.keys(res));
        }

        // Guardar usuario
        const usuario = res.usuario || res.user || res.data?.user;
        if (usuario) {
          // Agregar el rol string basado en id_rol
          const usuarioConRol = {
            ...usuario,
            rol: mapIdRolToString(usuario.id_rol || usuario.rol_id)
          };
          localStorage.setItem('user', JSON.stringify(usuarioConRol));
          localStorage.setItem('usuarioData', JSON.stringify(usuarioConRol)); // También guardar en usuarioData para compatibilidad
          console.log("[🔑 AuthService.login] ✅ Usuario guardado:", usuario.email || usuario.correo || 'sin email');
          console.log("[🔑 AuthService.login] 📊 Datos del usuario:", usuario);
        } else {
          console.warn("[🔑 AuthService.login] ⚠️ No se encontró usuario en la respuesta. Propiedades disponibles:", Object.keys(res));
          // Intentar guardar lo que sea que haya en usuario aunque sea vacío
          if (res.usuario !== undefined) {
            localStorage.setItem('user', JSON.stringify(res.usuario));
            console.log("[🔑 AuthService.login] ✅ Usuario guardado (aunque vacío)");
          }
        }

        // Actualizar estado de autenticación
        this.checkAuthStatus();

        // Verificación final
        const tokenFinal = localStorage.getItem('token');
        console.log(`[🔑 AuthService.login] Verificación final - Token: ${tokenFinal ? "✅ Existe" : "❌ No existe"}\n`);
      })
    );
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('usuarioData');
    this.isAuthenticatedSubject.next(false);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getUser(): any {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  isAuthenticated(): boolean {
    return this.hasToken();
  }
}

import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // NO agregar headers de autorización a Cloudinary
    if (req.url.includes('cloudinary.com')) {
      return next.handle(req);
    }

    // Obtener el token del localStorage
    const token = localStorage.getItem('token');

    console.log(`[🔐 AuthInterceptor] Request a: ${req.url}`);
    console.log(`  Token: ${token ? `✅ "${token.substring(0, 20)}..."` : "❌ No existe"}`);

    // Si hay token, agregarlo al header de Authorization
    if (token) {
      const clonedRequest = req.clone({
        setHeaders: { 
          Authorization: `Bearer ${token}`
        }
      });
      console.log(`  ✅ Header Authorization agregado`);
      return next.handle(clonedRequest);
    }

    // Si no hay token, enviar la petición sin modificar
    console.log(`  ⚠️ Sin token, enviando sin Authorization header`);
    return next.handle(req);
  }
}


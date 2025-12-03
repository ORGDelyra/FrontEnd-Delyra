import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpResponse } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

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

      // Agregar tap para ver la respuesta
      return next.handle(clonedRequest).pipe(
        tap(event => {
          if (event instanceof HttpResponse && req.url.includes('/category')) {
            console.log('📦 [AuthInterceptor] Respuesta de /category:', event.body);
            console.log('📊 [AuthInterceptor] Status:', event.status);
            console.log('📋 [AuthInterceptor] Headers:', event.headers);
          }
        })
      );
    }

    // Si no hay token, enviar la petición sin modificar
    console.log(`  ⚠️ Sin token, enviando sin Authorization header`);
    return next.handle(req);
  }
}


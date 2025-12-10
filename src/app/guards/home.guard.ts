import { Injectable, inject } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth';
import { mapIdRolToString } from '../utils/rol.utils';

@Injectable({
  providedIn: 'root'
})
export class HomeGuard implements CanActivate {

  private authService = inject(AuthService);
  private router = inject(Router);

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    // 1. Verifica si el usuario está autenticado
    if (this.authService.isAuthenticated()) {

      // 2. Si SÍ está autenticado, obtén su rol
      const userData = localStorage.getItem('usuarioData') || localStorage.getItem('user');
      if (userData) {
        const usuario = JSON.parse(userData);
        const rol = usuario?.rol || mapIdRolToString(usuario?.id_rol);

        // 3. Redirige inmediatamente al usuario a su panel de control específico
        switch (rol) {
          case 'cliente':
            return this.router.createUrlTree(['/cliente/inicio']);
          case 'vendedor':
            return this.router.createUrlTree(['/vendedor/inicio']);
          case 'domiciliario':
            return this.router.createUrlTree(['/domiciliario/inicio']);
          case 'admin':
            return this.router.createUrlTree(['/admin/inicio']);
          default:
            return this.router.createUrlTree(['/bienvenida']);
        }
      }
    }

    // 4. Si NO está autenticado, permite el acceso (irá a la ruta pública solicitada)
    return true;
  }
}

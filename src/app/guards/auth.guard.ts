import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    const isAdminRoute = state.url.startsWith('/admin');

    console.log(`\n[AuthGuard] Acceso a: ${state.url}`);
    console.log(`  Token: ${token ? ("[OK] " + token.substring(0, 20) + "...") : "No existe"}`);
    console.log(`  User: ${user ? "Existe (" + (JSON.parse(user)?.rol || "?") + ")" : "No existe"}`);
    console.log(`  Admin Route: ${isAdminRoute}`);

    // Evitar redirecciones infinitas
    if (state.url === '/inicio-sesion' || state.url === '/bienvenida' || state.url === '/seleccionar-registro') {
      console.log(`  Ruta de autenticación permitida sin token\n`);
      return true;
    }

    // Requerir token
    if (!token) {
      console.warn(`  BLOQUEADO: No hay token, redirigiendo a /inicio-sesion\n`);
      this.router.navigate(['/inicio-sesion'], {
        queryParams: { returnUrl: state.url }
      });
      return false;
    }

    // Para rutas admin, verificar que el usuario tenga rol admin
    if (isAdminRoute && user) {
      try {
        const userData = JSON.parse(user);
        if (userData.rol && userData.rol.toLowerCase() === 'admin') {
          console.log(`  PERMITIDO: Token válido y usuario es ADMIN\n`);
          return true;
        } else {
          console.warn(`  BLOQUEADO: Token válido pero usuario NO es ADMIN (rol: ${userData.rol})\n`);
          this.router.navigate(['/']);
          return false;
        }
      } catch (e) {
        console.error(`  ERROR: No se puede parsear user data\n`, e);
        return false;
      }
    }

    // Para rutas no-admin, solo requiere token
    if (token) {
      console.log(`  PERMITIDO: Token válido\n`);
      return true;
    }

    return false;
  }
}

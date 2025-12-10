import { Component } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from './components/navbar/navbar';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, NavbarComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected title = 'FrontendDelyra';
  protected mostrarNavbar = false;

  // Rutas donde NO debe aparecer el navbar (públicas/autenticación)
  private rutasSinNavbar = [
    '/bienvenida',
    '/inicio-sesion',
    '/seleccionar-registro',
    '/cliente/registro',
    '/vendedor/registro',
    '/domiciliario/registro',
    '/admin/registro'
  ];

  constructor(private router: Router) {
    // Escuchar cambios de ruta para mostrar/ocultar navbar
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.actualizarVisibilidadNavbar(event.urlAfterRedirects);
    });
  }

  private actualizarVisibilidadNavbar(url: string): void {
    // Ocultar navbar si la URL está en la lista de rutas sin navbar
    this.mostrarNavbar = !this.rutasSinNavbar.some(ruta => url.startsWith(ruta));
  }
}

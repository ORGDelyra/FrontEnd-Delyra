import { Component, OnInit, ViewChild } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from './components/navbar/navbar';
import { MantenimientoComponent } from './components/mantenimiento/mantenimiento';
import { MantenimientoService } from './services/mantenimiento.service';
import { PushNotificationService } from './services/push-notification.service';
import { ToastComponent } from './components/toast/toast';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, NavbarComponent, MantenimientoComponent, ToastComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  @ViewChild('toast') toast!: ToastComponent;
  protected title = 'FrontendDelyra';
  protected mostrarNavbar = false;
  protected enMantenimiento = false;

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

  constructor(
    private router: Router,
    private mantenimientoService: MantenimientoService,
    private pushService: PushNotificationService
  ) {
    // Escuchar cambios de ruta para mostrar/ocultar navbar
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.actualizarVisibilidadNavbar(event.urlAfterRedirects);
    });
  }

  ngOnInit() {
    // Inicializar notificaciones push y conectar el toast visual
    this.pushService.setToastComponent(() => this.toast);
    this.pushService.initPush();
    // Escuchar cambios en el estado de mantenimiento
    this.mantenimientoService.enMantenimiento$.subscribe(enMant => {
      this.enMantenimiento = enMant;
    });
  }

  private actualizarVisibilidadNavbar(url: string): void {
    // Ocultar navbar si la URL está en la lista de rutas sin navbar
    this.mostrarNavbar = !this.rutasSinNavbar.some(ruta => url.startsWith(ruta));
  }
}

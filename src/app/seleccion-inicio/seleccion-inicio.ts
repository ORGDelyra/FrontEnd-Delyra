import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-seleccion-inicio',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './seleccion-inicio.html',
  styleUrl: './seleccion-inicio.css',
})
export class SeleccionInicio {
  constructor(private router: Router) {}

  // Todos los roles usan el mismo componente de inicio de sesión
  // El componente redirige automáticamente según el rol del usuario
  iniciarSesion() {
    this.router.navigate(['/inicio-sesion']);
  }

  volver() {
    this.router.navigate(['/seleccionar-rol']);
  }
}

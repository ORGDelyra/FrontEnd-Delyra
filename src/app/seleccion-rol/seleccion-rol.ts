import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-seleccion-rol',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './seleccion-rol.html',
  styleUrl: './seleccion-rol.css',
})
export class SeleccionRol {
  constructor(private router: Router) {}

  irARegistro() {
    this.router.navigate(['/seleccionar-registro']);
  }

  irAInicio() {
    this.router.navigate(['/seleccionar-inicio']);
  }
}

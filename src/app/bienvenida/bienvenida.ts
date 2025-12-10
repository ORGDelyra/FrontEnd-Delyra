import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-bienvenida',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './bienvenida.html',
  styleUrl: './bienvenida.css',
})
export class Bienvenida {
  constructor(private router: Router) {}

  irAProductos() {
    this.router.navigate(['/productos/listar']);
  }

  irARegistro() {
    this.router.navigate(['/cliente/registro']);
  }

  irAInicio() {
    this.router.navigate(['/inicio-sesion']);
  }
}

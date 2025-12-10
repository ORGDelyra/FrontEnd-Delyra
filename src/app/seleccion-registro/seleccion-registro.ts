import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-seleccion-registro',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './seleccion-registro.html',
  styleUrl: './seleccion-registro.css',
})
export class SeleccionRegistro {
  constructor(private router: Router) {}

  registrarCliente() {
    this.router.navigate(['/cliente/registro']);
  }

  registrarVendedor() {
    this.router.navigate(['/vendedor/registro']);
  }

  registrarDomiciliario() {
    this.router.navigate(['/domiciliario/registro']);
  }

  volver() {
    this.router.navigate(['/bienvenida']);
  }
}


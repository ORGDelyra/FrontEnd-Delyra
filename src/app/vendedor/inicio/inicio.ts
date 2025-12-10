import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MonedaColombianaPipe } from '../../pipes/moneda-colombiana.pipe';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [RouterModule, CommonModule, MonedaColombianaPipe],
  templateUrl: './inicio.html',
  styleUrl: './inicio.css',
})
export class InicioVendedor implements OnInit {

  estadisticas = {
    pedidosHoy: 0,
    ventasMes: 0,
    productos: 0,
    pedidosPendientes: 0
  };

  constructor(private router: Router) {}

  ngOnInit() {
    // Cargar estadísticas desde el backend (TODO: implementar)
  }

  cerrarSesion() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.router.navigate(['/bienvenida']);
  }
}

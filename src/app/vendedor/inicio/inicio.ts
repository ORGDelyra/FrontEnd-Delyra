import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule, NgIf } from '@angular/common';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [RouterModule, CommonModule, NgIf],
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
  menuAbierto: boolean = false;
  menuLateralAbierto: boolean = false;

  constructor(private router: Router) {}

  ngOnInit() {
    // Cargar estadísticas desde el backend (TODO: implementar)
    try {
      const saved = localStorage.getItem('menuLateralAbierto');
      if (saved !== null) this.menuLateralAbierto = saved === 'true';
    } catch (e) { }
  }

  cerrarSesion() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.router.navigate(['/seleccionar-rol']);
  }

  toggleMenu() {
    this.menuAbierto = !this.menuAbierto;
  }

  cerrarMenu() {
    this.menuAbierto = false;
  }

  toggleMenuLateral() {
    this.menuLateralAbierto = !this.menuLateralAbierto;
    try {
      localStorage.setItem('menuLateralAbierto', String(this.menuLateralAbierto));
    } catch (e) { }
  }
}

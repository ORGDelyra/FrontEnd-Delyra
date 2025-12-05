import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

export interface MenuItem {
  icon: string;
  label: string;
  route?: string;
  action?: () => void;
}

@Component({
  selector: 'app-menu-lateral',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './menu-lateral.html',
  styleUrl: './menu-lateral.css'
})
export class MenuLateral {
  @Input() menuItems: MenuItem[] = [];
  @Input() onLogout?: () => void;
  menuAbierto: boolean = false;

  toggleMenu() {
    this.menuAbierto = !this.menuAbierto;
  }

  cerrarMenu() {
    this.menuAbierto = false;
  }

  clickItem(item: MenuItem) {
    if (item.action) {
      item.action();
    }
    this.cerrarMenu();
  }

  cerrarSesion() {
    if (this.onLogout) {
      this.onLogout();
    }
    this.cerrarMenu();
  }
}

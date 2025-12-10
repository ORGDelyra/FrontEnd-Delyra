import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MantenimientoService {
  
  // Cambiar a true para activar el modo de mantenimiento
  private enMantenimiento = new BehaviorSubject<boolean>(false);
  public enMantenimiento$ = this.enMantenimiento.asObservable();

  constructor() {}

  activarMantenimiento() {
    this.enMantenimiento.next(true);
  }

  desactivarMantenimiento() {
    this.enMantenimiento.next(false);
  }

  estaEnMantenimiento(): boolean {
    return this.enMantenimiento.getValue();
  }
}

import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { JobOffer } from '../../interfaces/job-offer.interface';

@Component({
  selector: 'app-formulario-oferta-negocio',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './formulario-oferta-negocio.html',
  styleUrls: ['./formulario-oferta-negocio.css'],
})
export class FormularioOfertaNegocioComponent {
  @Input() oferta: Partial<JobOffer> = {};
  @Output() guardar = new EventEmitter<Partial<JobOffer>>();
  @Output() cancelar = new EventEmitter<void>();

  estados = [ 'activa', 'inactiva' ];

  onSubmit() {
    this.guardar.emit(this.oferta);
  }
}

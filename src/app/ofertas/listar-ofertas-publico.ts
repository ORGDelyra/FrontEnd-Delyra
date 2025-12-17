import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { JobOfferService } from '../services/job-offer.service';
import { JobOffer } from '../interfaces/job-offer.interface';

@Component({
  selector: 'app-listar-ofertas-publico',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './listar-ofertas-publico.html',
  styleUrls: ['./listar-ofertas-publico.css'],
})
export class ListarOfertasPublicoComponent implements OnInit {
  ofertas: JobOffer[] = [];
  cargando = false;
  error = '';
  termino = '';

  constructor(private jobOfferService: JobOfferService) {}

  ngOnInit() {
    this.cargarOfertas();
  }

  cargarOfertas() {
    this.cargando = true;
    this.jobOfferService.getAll().subscribe({
      next: (ofertas) => {
        this.ofertas = ofertas;
        this.cargando = false;
      },
      error: () => {
        this.error = 'Error al cargar ofertas';
        this.cargando = false;
      }
    });
  }

  get ofertasFiltradas() {
    if (!this.termino.trim()) return this.ofertas;
    const t = this.termino.toLowerCase();
    return this.ofertas.filter(o =>
      o.titulo.toLowerCase().includes(t) ||
      o.descripcion.toLowerCase().includes(t) ||
      o.tipo_puesto.toLowerCase().includes(t)
    );
  }
}

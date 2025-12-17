import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JobOfferService } from '../../services/job-offer.service';
import { JobOffer } from '../../interfaces/job-offer.interface';
import { FormularioOfertaNegocioComponent } from './formulario-oferta-negocio';

@Component({
  selector: 'app-listar-ofertas-negocio',
  standalone: true,
  imports: [CommonModule, FormularioOfertaNegocioComponent],
  templateUrl: './listar-ofertas-negocio.html',
  styleUrls: ['./listar-ofertas-negocio.css'],
})
export class ListarOfertasNegocioComponent implements OnInit {
  ofertas: JobOffer[] = [];
  cargando = false;
  error = '';
  exito = '';
  mostrarFormulario = false;
  editando: JobOffer | null = null;
  mensajeTimeout: any;

  constructor(private jobOfferService: JobOfferService) {}

  ngOnInit() {
    this.cargarOfertas();
  }

  cargarOfertas() {
    this.cargando = true;
    this.limpiarMensajes();
    // Aquí deberías obtener el ID del negocio autenticado
    const negocioId = 1; // TODO: reemplazar por el real
    this.jobOfferService.getByBusiness(negocioId).subscribe({
      next: (ofertas) => {
        this.ofertas = ofertas;
        this.cargando = false;
      },
      error: (err) => {
        this.error = 'Error al cargar ofertas';
        this.cargando = false;
        this.temporizarMensaje();
      }
    });
  }

  nuevaOferta() {
    this.editando = null;
    this.mostrarFormulario = true;
  }

  editarOferta(oferta: JobOffer) {
    this.editando = { ...oferta };
    this.mostrarFormulario = true;
  }

  guardarOferta(oferta: Partial<JobOffer>) {
    const negocioId = 1; // TODO: reemplazar por el real
    this.limpiarMensajes();
    if (this.editando && this.editando.id) {
      this.jobOfferService.update(this.editando.id, oferta).subscribe({
        next: () => {
          this.mostrarFormulario = false;
          this.exito = 'Oferta actualizada correctamente';
          this.cargarOfertas();
          this.temporizarMensaje();
        },
        error: () => {
          this.error = 'Error al actualizar la oferta';
          this.temporizarMensaje();
        }
      });
    } else {
      this.jobOfferService.create({ ...oferta, negocio_id: negocioId }).subscribe({
        next: () => {
          this.mostrarFormulario = false;
          this.exito = 'Oferta creada correctamente';
          this.cargarOfertas();
          this.temporizarMensaje();
        },
        error: () => {
          this.error = 'Error al crear la oferta';
          this.temporizarMensaje();
        }
      });
    }
  }

  cancelarEdicion() {
    this.mostrarFormulario = false;
    this.editando = null;
  }

  eliminarOferta(oferta: JobOffer) {
    if (confirm('¿Seguro que deseas eliminar esta oferta?')) {
      this.limpiarMensajes();
      this.jobOfferService.delete(oferta.id).subscribe({
        next: () => {
          this.exito = 'Oferta eliminada correctamente';
          this.cargarOfertas();
          this.temporizarMensaje();
        },
        error: () => {
          this.error = 'Error al eliminar la oferta';
          this.temporizarMensaje();
        }
      });
    }
  }

  limpiarMensajes() {
    this.error = '';
    this.exito = '';
    if (this.mensajeTimeout) {
      clearTimeout(this.mensajeTimeout);
    }
  }

  temporizarMensaje() {
    if (this.mensajeTimeout) {
      clearTimeout(this.mensajeTimeout);
    }
    this.mensajeTimeout = setTimeout(() => {
      this.error = '';
      this.exito = '';
    }, 3500);
  }
}

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { DomiciliarioService } from '../../services/domiciliario.service';
import { CommonModule } from '@angular/common';
import { Vehicle } from '../../interfaces/vehicle.interface';

@Component({
  selector: 'app-vehiculo',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
  templateUrl: './vehiculo.html',
  styleUrl: './vehiculo.css',
})
export class VehiculoDomiciliario implements OnInit {

  form: FormGroup;
  mensajeError: string = '';
  mensajeExito: string = '';
  cargando: boolean = false;
  vehiculo: Vehicle | null = null;
  modoEdicion: boolean = false;

  constructor(
    private fb: FormBuilder,
    private domiciliarioService: DomiciliarioService,
    private router: Router
  ) {
    this.form = this.fb.group({
      placa: ['', Validators.required],
      tipo_vehiculo: ['', Validators.required],
      seguro_vig: ['', Validators.required],
      run_vig: ['', Validators.required],
    });
  }

  ngOnInit() {
    // Intentar obtener el vehículo del usuario actual
    this.cargarVehiculo();
  }

  cargarVehiculo() {
    this.cargando = true;
    // Obtener todos los vehículos del usuario (asumiendo que el backend filtra por usuario logueado)
    this.domiciliarioService.obtenerVehiculos().subscribe({
      next: (vehiculos: Vehicle[]) => {
        if (vehiculos && vehiculos.length > 0) {
          // Si hay vehículos, cargar el primero (o el del usuario)
          this.vehiculo = vehiculos[0];
          this.modoEdicion = true;
          this.cargarDatosEnFormulario(this.vehiculo);
        } else {
          this.modoEdicion = false;
        }
        this.cargando = false;
      },
      error: (err: any) => {
        console.error("Error al cargar vehículo:", err);
        // Si no hay vehículo, permitir crearlo
        this.modoEdicion = false;
        this.cargando = false;
      }
    });
  }

  cargarDatosEnFormulario(vehiculo: Vehicle) {
    // Convertir fechas de formato DATE a formato para input date
    const seguroVig = vehiculo.seguro_vig ? this.convertirFechaParaInput(vehiculo.seguro_vig) : '';
    const runVig = vehiculo.run_vig ? this.convertirFechaParaInput(vehiculo.run_vig) : '';
    
    this.form.patchValue({
      placa: vehiculo.placa,
      tipo_vehiculo: vehiculo.tipo_vehiculo,
      seguro_vig: seguroVig,
      run_vig: runVig,
    });
  }

  convertirFechaParaInput(fecha: string): string {
    // Convertir formato DATE (YYYY-MM-DD) a formato para input date
    if (!fecha) return '';
    return fecha.split('T')[0];
  }

  guardarVehiculo() {
    if (this.form.invalid) {
      this.marcarCamposInvalidos();
      this.mensajeError = 'Por favor completa todos los campos requeridos';
      return;
    }

    this.cargando = true;
    this.mensajeError = '';
    this.mensajeExito = '';

    const data = {
      placa: this.form.value.placa,
      tipo_vehiculo: this.form.value.tipo_vehiculo,
      seguro_vig: this.formatearFecha(this.form.value.seguro_vig),
      run_vig: this.formatearFecha(this.form.value.run_vig),
    };

    if (this.modoEdicion && this.vehiculo?.id) {
      // Actualizar vehículo existente
      this.domiciliarioService.actualizarVehiculo(this.vehiculo.id, data).subscribe({
        next: (res: any) => {
          console.log("Vehículo actualizado exitosamente", res);
          this.mensajeExito = 'Vehículo actualizado correctamente';
          this.cargando = false;
          // Recargar datos
          setTimeout(() => {
            this.cargarVehiculo();
            this.mensajeExito = '';
          }, 2000);
        },
        error: (err: any) => {
          console.error("Error al actualizar vehículo:", err);
          this.mensajeError = err.error?.message || 'Error al actualizar el vehículo. Por favor intenta de nuevo.';
          this.cargando = false;
        }
      });
    } else {
      // Crear nuevo vehículo (el id_usuario se toma del usuario logueado en el backend)
      this.domiciliarioService.crearVehiculo(data).subscribe({
        next: (res: any) => {
          console.log("Vehículo creado exitosamente", res);
          this.mensajeExito = 'Vehículo creado correctamente';
          this.cargando = false;
          // Recargar datos
          setTimeout(() => {
            this.cargarVehiculo();
            this.mensajeExito = '';
          }, 2000);
        },
        error: (err: any) => {
          console.error("Error al crear vehículo:", err);
          this.mensajeError = err.error?.message || 'Error al crear el vehículo. Por favor intenta de nuevo.';
          this.cargando = false;
        }
      });
    }
  }

  private formatearFecha(fecha: string): string {
    // Formatear fecha de input date a formato YYYY-MM-DD
    if (!fecha) return '';
    const date = new Date(fecha);
    return date.toISOString().split('T')[0];
  }

  private marcarCamposInvalidos() {
    Object.keys(this.form.controls).forEach(key => {
      const control = this.form.get(key);
      if (control && control.invalid) {
        control.markAsTouched();
      }
    });
  }

  get f() { return this.form.controls; }
}

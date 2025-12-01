import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RegistroService } from '../../services/registro';
import { ImageUploadService } from '../../services/image-upload.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './registro.html',
  styleUrl: './registro.css'
})
export class RegistroDomiciliario {

  formUsuario: FormGroup;
  formVehiculo: FormGroup;
  pasoActual: number = 1;
  mensajeError: string = '';
  cargando: boolean = false;

  // Propiedades para imagen de perfil
  fotoPerfil: string | null = null;
  cargandoFoto: boolean = false;

  constructor(
    private fb: FormBuilder,
    private registroService: RegistroService,
    private imageUploadService: ImageUploadService,
    private router: Router
  ) {

    this.formUsuario = this.fb.group({
      primer_nombre: ['', [Validators.required, Validators.maxLength(50)]],
      segundo_nombre: ['', Validators.maxLength(50)],
      primer_apellido: ['', [Validators.required, Validators.maxLength(50)]],
      segundo_apellido: ['', Validators.maxLength(50)],
      telefono: ['', [Validators.required, Validators.pattern(/^\d{10}$/), Validators.maxLength(10)]],
      correo: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      cuenta_bancaria: ['', [Validators.required, Validators.maxLength(30)]],
    });

    this.formVehiculo = this.fb.group({
      placa: ['', [Validators.required, Validators.maxLength(20)]],
      tipo_vehiculo: ['', Validators.required],
      seguro_vig: ['', Validators.required],
      run_vig: ['', Validators.required]
    });
  }

  /**
   * Maneja la selección de foto de perfil
   */
  async onFotoPerfilSelect(event: any): Promise<void> {
    const file = event.target.files[0];
    if (!file) return;

    // Validar imagen
    const validation = await this.imageUploadService.validateImage(file, 2, 100, 100);
    if (!validation.valid) {
      this.mensajeError = 'Error en imagen: ' + validation.error;
      return;
    }

    this.cargandoFoto = true;
    this.imageUploadService.uploadImage(file).subscribe({
      next: (response) => {
        this.fotoPerfil = response.secure_url;
        this.cargandoFoto = false;
        console.log('Foto de perfil cargada:', this.fotoPerfil);
      },
      error: (error) => {
        this.mensajeError = 'Error al subir foto de perfil';
        this.cargandoFoto = false;
        console.error('Error:', error);
      }
    });
  }

  siguientePaso() {
    if (this.formUsuario.invalid) {
      this.marcarCamposInvalidos(this.formUsuario);
      this.mensajeError = 'Completa todos los datos personales';
      return;
    }
    this.pasoActual = 2;
  }

  completarRegistro() {
    if (this.formVehiculo.invalid) {
      this.marcarCamposInvalidos(this.formVehiculo);
      this.mensajeError = 'Completa los datos del vehículo';
      return;
    }

    this.cargando = true;
    this.mensajeError = '';

    const payload = {
      ...this.formUsuario.value,
      id_rol: 4, // Domiciliario (entrega pedidos)
      ...this.formVehiculo.value,
      seguro_vig: this.formatDate(this.formVehiculo.value.seguro_vig),
      run_vig: this.formatDate(this.formVehiculo.value.run_vig),
      profile_url: this.fotoPerfil || null  // Agregar URL de foto de perfil
    };

    console.log("Datos enviados a la API:", payload);

    this.registroService.registrarUsuario(payload).subscribe({
      next: (res: any) => {
        console.log("Registro completo", res);
        this.cargando = false;
        this.router.navigate(['/domiciliario/inicio-sesion']);
      },
      error: (err: any) => {
        console.error("Error al registrar domiciliario:", err);
        this.mensajeError = err.error?.message || 'Error al registrar. Intenta de nuevo.';
        this.cargando = false;
      }
    });
  }

  pasoAnterior() {
    this.pasoActual = 1;
  }

  private formatDate(date: string): string {
    return new Date(date).toISOString().split("T")[0];
  }

  private marcarCamposInvalidos(form: FormGroup) {
    Object.keys(form.controls).forEach(key => {
      const control = form.get(key);
      control?.markAsTouched();
    });
  }

  get fUsuario() { return this.formUsuario.controls; }
  get fVehiculo() { return this.formVehiculo.controls; }
}


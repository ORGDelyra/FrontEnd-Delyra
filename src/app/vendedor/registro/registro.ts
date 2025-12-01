import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { RegistroService } from '../../services/registro';
import { VendedorService } from '../../services/vendedor.service';
import { ImageUploadService } from '../../services/image-upload.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './registro.html',
  styleUrl: './registro.css',
})
export class RegistroVendedor {

  formUsuario: FormGroup;
  formSucursal: FormGroup;
  pasoActual: number = 1; // 1 = datos usuario, 2 = datos sucursal
  mensajeError: string = '';
  cargando: boolean = false;
  idUsuarioCreado: number | null = null;

  // Propiedades para imágenes
  fotoPerfil: string | null = null;
  cargandoFotoPerfil: boolean = false;

  logoComercio: string | null = null;
  cargandoLogo: boolean = false;

  imagenNIT: string | null = null;
  cargandoNIT: boolean = false;

  constructor(
    private fb: FormBuilder,
    private registroService: RegistroService,
    private vendedorService: VendedorService,
    private imageUploadService: ImageUploadService,
    private router: Router
  ) {
    // Formulario de datos del usuario
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

    // Formulario de datos de la sucursal
    this.formSucursal = this.fb.group({
      nombre_sucursal: ['', [Validators.required, Validators.maxLength(50)]],
      nit: ['', Validators.required],
      latitud: ['', Validators.required],
      longitud: ['', Validators.required],
      direccion: ['', Validators.required]
    });
  }

  /**
   * Maneja la selección de foto de perfil
   */
  async onFotoPerfilSelect(event: any): Promise<void> {
    const file = event.target.files[0];
    if (!file) return;

    const validation = await this.imageUploadService.validateImage(file, 2, 100, 100);
    if (!validation.valid) {
      this.mensajeError = 'Error en foto de perfil: ' + validation.error;
      return;
    }

    this.cargandoFotoPerfil = true;
    this.imageUploadService.uploadImage(file).subscribe({
      next: (response) => {
        this.fotoPerfil = response.secure_url;
        this.cargandoFotoPerfil = false;
        console.log('Foto de perfil cargada:', this.fotoPerfil);
      },
      error: (error) => {
        this.mensajeError = 'Error al subir foto de perfil';
        this.cargandoFotoPerfil = false;
      }
    });
  }

  /**
   * Maneja la selección de logo del comercio
   */
  async onLogoComercioSelect(event: any): Promise<void> {
    const file = event.target.files[0];
    if (!file) return;

    const validation = await this.imageUploadService.validateImage(file, 2, 100, 100);
    if (!validation.valid) {
      this.mensajeError = 'Error en logo: ' + validation.error;
      return;
    }

    this.cargandoLogo = true;
    this.imageUploadService.uploadImage(file).subscribe({
      next: (response) => {
        this.logoComercio = response.secure_url;
        this.cargandoLogo = false;
        console.log('Logo cargado:', this.logoComercio);
      },
      error: (error) => {
        this.mensajeError = 'Error al subir logo';
        this.cargandoLogo = false;
      }
    });
  }

  /**
   * Maneja la selección de imagen del NIT
   */
  async onImagenNITSelect(event: any): Promise<void> {
    const file = event.target.files[0];
    if (!file) return;

    const validation = await this.imageUploadService.validateDocument(file, 5);
    if (!validation.valid) {
      this.mensajeError = 'Error en NIT: ' + validation.error;
      return;
    }

    this.cargandoNIT = true;
    this.imageUploadService.uploadImage(file).subscribe({
      next: (response) => {
        this.imagenNIT = response.secure_url;
        this.cargandoNIT = false;
        console.log('NIT cargado:', this.imagenNIT);
      },
      error: (error) => {
        this.mensajeError = 'Error al subir NIT';
        this.cargandoNIT = false;
      }
    });
  }

  // Validar y avanzar al siguiente paso (crear usuario)
  siguientePaso() {
    if (this.formUsuario.invalid) {
      this.marcarCamposInvalidos(this.formUsuario);
      this.mensajeError = 'Por favor completa todos los campos requeridos';
      return;
    }

    this.cargando = true;
    this.mensajeError = '';

    const dataUsuario = {
      id_rol: 3, // Comerciante/Sucursal (vende productos)
      ...this.formUsuario.value,
      profile_url: this.fotoPerfil || null  // Agregar foto de perfil
    };

    // Registrar el usuario
    this.registroService.registrarUsuario(dataUsuario).subscribe({
      next: (res: any) => {
        console.log("Usuario vendedor registrado exitosamente", res);
        this.idUsuarioCreado = res.usuario?.id || null;

        if (res.token) {
          localStorage.setItem('token', res.token);
        }

        this.pasoActual = 2; // Avanzar al paso de sucursal
        this.cargando = false;
      },
      error: (err: any) => {
        console.error("Error al registrar usuario:", err);
        this.mensajeError = err.error?.message || 'Error al registrar usuario. Por favor intenta de nuevo.';
        this.cargando = false;
      }
    });
  }

  // Completar registro creando la sucursal
  completarRegistro() {
    if (this.formSucursal.invalid || !this.imagenNIT) {
      this.marcarCamposInvalidos(this.formSucursal);
      this.mensajeError = 'Por favor completa todos los campos requeridos y carga el NIT';
      return;
    }

    if (!this.idUsuarioCreado) {
      this.mensajeError = 'Error: No se pudo obtener el ID del usuario. Por favor inicia el proceso nuevamente.';
      return;
    }

    this.cargando = true;
    this.mensajeError = '';

    const dataSucursal = {
      ...this.formSucursal.value,
      img_nit: this.imagenNIT,
      logo_url: this.logoComercio || null  // Logo es opcional
    };

    // Crear la sucursal
    this.vendedorService.crearSucursal(dataSucursal).subscribe({
      next: (res: any) => {
        console.log("Sucursal creada exitosamente", res);
        this.cargando = false;
        this.router.navigate(['/vendedor/inicio-sesion']);
      },
      error: (err: any) => {
        console.error("Error al crear sucursal:", err);
        this.mensajeError = err.error?.message || 'Error al crear la sucursal. Por favor intenta de nuevo.';
        this.cargando = false;
      }
    });
  }

  // Volver al paso anterior
  pasoAnterior() {
    this.pasoActual = 1;
    this.mensajeError = '';
  }

  // Marcar campos inválidos para mejor UX
  private marcarCamposInvalidos(form: FormGroup) {
    Object.keys(form.controls).forEach(key => {
      const control = form.get(key);
      if (control && control.invalid) {
        control.markAsTouched();
      }
    });
  }

  // Helpers para acceder a los controles del formulario
  get fUsuario() { return this.formUsuario.controls; }
  get fSucursal() { return this.formSucursal.controls; }
}


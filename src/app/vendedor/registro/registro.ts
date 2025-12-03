import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
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

  // Control de visibilidad de contraseña
  mostrarPassword: boolean = false;

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
      latitud: ['', [this.validarLatitudQuilichao]],
      longitud: ['', [this.validarLongitudQuilichao]],
      direccion: ['']
    });
  }

  /**
   * Validador personalizado para latitud de Santander de Quilichao
   * Rango válido: 2.95 a 3.08
   */
  validarLatitudQuilichao(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null; // Campo opcional
    const lat = parseFloat(control.value);
    if (isNaN(lat)) return { latitudInvalida: 'Latitud debe ser un número válido' };
    if (lat < 2.95 || lat > 3.08) {
      return { fueraDeQuilichao: 'La latitud debe estar dentro de Santander de Quilichao (2.95 a 3.08)' };
    }
    return null;
  }

  /**
   * Validador personalizado para longitud de Santander de Quilichao
   * Rango válido: -76.58 a -76.38
   */
  validarLongitudQuilichao(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null; // Campo opcional
    const lng = parseFloat(control.value);
    if (isNaN(lng)) return { longitudInvalida: 'Longitud debe ser un número válido' };
    if (lng < -76.58 || lng > -76.38) {
      return { fueraDeQuilichao: 'La longitud debe estar dentro de Santander de Quilichao (-76.58 a -76.38)' };
    }
    return null;
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
    try {
      const response = await this.imageUploadService.uploadImage(file, 'perfil');
      this.fotoPerfil = response.secure_url;
      this.cargandoFotoPerfil = false;
      console.log('Foto de perfil cargada:', this.fotoPerfil);
    } catch (error: any) {
      this.mensajeError = 'Error al subir foto de perfil: ' + (error?.message || '');
      this.cargandoFotoPerfil = false;
    }
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
    try {
      const response = await this.imageUploadService.uploadImage(file, 'perfil');
      this.logoComercio = response.secure_url;
      this.cargandoLogo = false;
      console.log('Logo cargado:', this.logoComercio);
    } catch (error: any) {
      this.mensajeError = 'Error al subir logo: ' + (error?.message || '');
      this.cargandoLogo = false;
    }
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
    try {
      const response = await this.imageUploadService.uploadImage(file, 'comprobante');
      this.imagenNIT = response.secure_url;
      this.cargandoNIT = false;
      console.log('NIT cargado:', this.imagenNIT);
    } catch (error: any) {
      this.mensajeError = 'Error al subir NIT: ' + (error?.message || '');
      this.cargandoNIT = false;
    }
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
    if (this.formSucursal.invalid) {
      this.marcarCamposInvalidos(this.formSucursal);

      // Mostrar errores específicos de validación de coordenadas
      const latControl = this.formSucursal.get('latitud');
      const lngControl = this.formSucursal.get('longitud');

      if (latControl?.errors?.['fueraDeQuilichao']) {
        this.mensajeError = latControl.errors['fueraDeQuilichao'];
        return;
      }
      if (lngControl?.errors?.['fueraDeQuilichao']) {
        this.mensajeError = lngControl.errors['fueraDeQuilichao'];
        return;
      }

      this.mensajeError = 'Por favor completa todos los campos requeridos correctamente';
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
      img_nit: this.imagenNIT || null,  // NIT es opcional
      logo_comercio: this.logoComercio || null  // Cambiar de logo_url a logo_comercio
    };

    console.log('Datos a enviar al backend:', dataSucursal);

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

  // Alternar visibilidad de contraseña
  togglePassword() {
    this.mostrarPassword = !this.mostrarPassword;
  }

  // Helpers para acceder a los controles del formulario
  get fUsuario() { return this.formUsuario.controls; }
  get fSucursal() { return this.formSucursal.controls; }
}


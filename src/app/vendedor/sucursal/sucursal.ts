import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { VendedorService } from '../../services/vendedor.service';
import { ImageUploadService } from '../../services/image-upload.service';
import { CommonModule } from '@angular/common';
import { Branch } from '../../interfaces/branch.interface';

@Component({
  selector: 'app-sucursal',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
  templateUrl: './sucursal.html',
  styleUrl: './sucursal.css',
})
export class SucursalVendedor implements OnInit {

  form: FormGroup;
  mensajeError: string = '';
  mensajeExito: string = '';
  cargando: boolean = false;
  sucursal: Branch | null = null;
  modoEdicion: boolean = false;
  logoComercio: string = '';
  cargandoLogo: boolean = false;

  constructor(
    private fb: FormBuilder,
    private vendedorService: VendedorService,
    private imageUploadService: ImageUploadService,
    private router: Router
  ) {
    this.form = this.fb.group({
      nombre_sucursal: ['', [Validators.required, Validators.maxLength(50)]],
      nit: ['', Validators.required],
      img_nit: ['', Validators.required],
      latitud: ['', Validators.required],
      longitud: ['', Validators.required],
      direccion: ['', Validators.required],
    });
  }

  ngOnInit() {
    // Intentar obtener la sucursal del usuario actual
    this.cargarSucursal();
  }

  cargarSucursal() {
    this.cargando = true;
    // Obtener todas las sucursales del usuario (asumiendo que el backend filtra por usuario logueado)
    this.vendedorService.obtenerSucursales().subscribe({
      next: (sucursales: Branch[]) => {
        if (sucursales && sucursales.length > 0) {
          // Si hay sucursales, cargar la primera (o la del usuario)
          this.sucursal = sucursales[0];
          this.modoEdicion = true;
          this.cargarDatosEnFormulario(this.sucursal);
        } else {
          this.modoEdicion = false;
        }
        this.cargando = false;
      },
      error: (err: any) => {
        console.error("Error al cargar sucursal:", err);
        // Si no hay sucursal, permitir crearla
        this.modoEdicion = false;
        this.cargando = false;
      }
    });
  }

  cargarDatosEnFormulario(sucursal: Branch) {
    this.form.patchValue({
      nombre_sucursal: sucursal.nombre_sucursal,
      nit: sucursal.nit,
      img_nit: sucursal.img_nit,
      latitud: sucursal.latitud || '',
      longitud: sucursal.longitud || '',
      direccion: sucursal.direccion || '',
    });
    this.logoComercio = sucursal.logo_comercio || '';
  }

  guardarSucursal() {
    if (this.form.invalid) {
      this.marcarCamposInvalidos();
      this.mensajeError = 'Por favor completa todos los campos requeridos';
      return;
    }

    this.cargando = true;
    this.mensajeError = '';
    this.mensajeExito = '';

    const data = this.form.value;

    if (this.modoEdicion && this.sucursal?.id) {
      // Actualizar sucursal existente
      this.vendedorService.actualizarSucursal(this.sucursal.id, data).subscribe({
        next: (res: any) => {
          console.log("Sucursal actualizada exitosamente", res);
          this.mensajeExito = 'Sucursal actualizada correctamente';
          this.cargando = false;
          // Recargar datos
          setTimeout(() => {
            this.cargarSucursal();
            this.mensajeExito = '';
          }, 2000);
        },
        error: (err: any) => {
          console.error("Error al actualizar sucursal:", err);
          this.mensajeError = err.error?.message || 'Error al actualizar la sucursal. Por favor intenta de nuevo.';
          this.cargando = false;
        }
      });
    } else {
      // Crear nueva sucursal (el id_usuario se toma del usuario logueado en el backend)
      this.vendedorService.crearSucursal(data).subscribe({
        next: (res: any) => {
          console.log("Sucursal creada exitosamente", res);
          this.mensajeExito = 'Sucursal creada correctamente';
          this.cargando = false;
          // Recargar datos
          setTimeout(() => {
            this.cargarSucursal();
            this.mensajeExito = '';
          }, 2000);
        },
        error: (err: any) => {
          console.error("Error al crear sucursal:", err);
          this.mensajeError = err.error?.message || 'Error al crear la sucursal. Por favor intenta de nuevo.';
          this.cargando = false;
        }
      });
    }
  }

  private marcarCamposInvalidos() {
    Object.keys(this.form.controls).forEach(key => {
      const control = this.form.get(key);
      if (control && control.invalid) {
        control.markAsTouched();
      }
    });
  }

  async onLogoSeleccionado(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    this.cargandoLogo = true;
    const validacion = await this.imageUploadService.validateImage(file, 5, 100, 100);

    if (!validacion.valid) {
      this.mensajeError = validacion.error || 'Error en validación';
      this.cargandoLogo = false;
      return;
    }

    try {
      const response = await this.imageUploadService.uploadImage(file, 'productos');
      this.logoComercio = response.secure_url;
      if (this.sucursal) {
        this.sucursal.logo_comercio = response.secure_url;
      }
      this.mensajeExito = 'Logo del comercio actualizado';
      this.cargandoLogo = false;
      setTimeout(() => this.mensajeExito = '', 3000);
    } catch (err: any) {
      this.mensajeError = 'Error al subir el logo: ' + (err?.message || '');
      this.cargandoLogo = false;
    }
  }

  get f() { return this.form.controls; }
}

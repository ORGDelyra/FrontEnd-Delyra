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
  notificacion: { tipo: 'error' | 'exito' | 'warning'; mensaje: string } | null = null;
  modoEdicion: boolean = false;
  editandoActivamente: boolean = false;
  logoComercio: string = '';
  imagenNIT: string = '';
  cargandoLogo: boolean = false;
  cargandoNIT: boolean = false;

  constructor(
    private fb: FormBuilder,
    private vendedorService: VendedorService,
    private imageUploadService: ImageUploadService,
    private router: Router
  ) {
    this.form = this.fb.group({
      nombre_sucursal: ['', [Validators.required, Validators.maxLength(50)]],
      nit: ['', Validators.required],
      img_nit: [''],  // Hacer img_nit opcional
      latitud: [''],
      longitud: [''],
      direccion: [''],
    });
  }

  ngOnInit() {
    // Intentar obtener la sucursal del usuario actual
    this.cargarSucursal();
  }

  mostrarNotificacion(tipo: 'error' | 'exito' | 'warning', mensaje: string) {
    this.notificacion = { tipo, mensaje };
    setTimeout(() => {
      this.notificacion = null;
    }, 5000);
  }

  obtenerMensajeError(err: any): string {
    if (err.status === 403) {
      let mensaje = '🔒 No tienes permisos para realizar esta acción.';
      
      // Si hay información de debug, mostrarla
      if (err.error?.debug) {
        const debug = err.error.debug;
        mensaje += ` (Usuario: ${debug.usuario_autenticado}, Dueño: ${debug.dueno_sucursal})`;
      }
      
      return mensaje;
    } else if (err.status === 401) {
      return '🔐 Tu sesión ha expirado. Por favor inicia sesión nuevamente.';
    } else if (err.status === 404) {
      return '❌ Sucursal no encontrada.';
    } else if (err.status === 422) {
      return '⚠️ Datos inválidos: ' + (err.error?.mensaje || 'Verifica los campos');
    } else if (err.error?.mensaje) {
      return err.error.mensaje;
    } else if (err.error?.message) {
      return err.error.message;
    } else if (err.message) {
      return err.message;
    }
    return 'Error desconocido. Intenta de nuevo.';
  }

  cargarSucursal() {
    this.cargando = true;
    
    // Obtener usuario actual para verificar propiedad
    const userStr = localStorage.getItem('user');
    const usuarioActual = userStr ? JSON.parse(userStr) : null;
    
    console.log('👤 Usuario actual:', usuarioActual);
    
    // Obtener todas las sucursales del usuario (el backend DEBE filtrar por usuario logueado)
    this.vendedorService.obtenerSucursales().subscribe({
      next: (sucursales: Branch[]) => {
        console.log('🏪 Sucursales recibidas:', sucursales);
        
        // Filtrar solo sucursales que pertenecen al usuario actual (seguridad adicional)
        const sucursalesDelUsuario = sucursales.filter(s => 
          s.id_usuario === usuarioActual?.id
        );
        
        console.log('✅ Sucursales filtradas del usuario:', sucursalesDelUsuario);
        
        if (sucursalesDelUsuario && sucursalesDelUsuario.length > 0) {
          // Si hay sucursales, cargar la primera en modo lectura
          this.sucursal = sucursalesDelUsuario[0];
          this.modoEdicion = true; // Tiene sucursal
          this.editandoActivamente = false; // Pero no está editando
          this.cargarDatosEnFormulario(this.sucursal);
          console.log('📋 Sucursal cargada:', this.sucursal);
        } else {
          // No tiene sucursal, permitir crear
          console.log('⚠️ No hay sucursales para este usuario. Permitiendo crear.');
          this.modoEdicion = false;
          this.editandoActivamente = true; // Activar formulario para crear
        }
        this.cargando = false;
      },
      error: (err: any) => {
        console.error("❌ Error al cargar sucursal:", err);
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
      img_nit: sucursal.img_nit || '',
      latitud: sucursal.latitud || '',
      longitud: sucursal.longitud || '',
      direccion: sucursal.direccion || '',
    });
    this.logoComercio = sucursal.logo_comercio || '';
    this.imagenNIT = sucursal.img_nit || '';
  }

  activarEdicion() {
    this.editandoActivamente = true;
  }

  cancelarEdicion() {
    this.editandoActivamente = false;
    // Recargar los datos originales
    if (this.sucursal) {
      this.cargarDatosEnFormulario(this.sucursal);
    }
  }

  guardarSucursal() {
    if (this.form.invalid) {
      this.marcarCamposInvalidos();
      this.mostrarNotificacion('warning', 'Por favor completa los campos requeridos (Nombre y NIT)');
      return;
    }

    this.cargando = true;

    // Incluir las imágenes actuales en los datos a guardar
    const data = {
      ...this.form.value,
      logo_comercio: this.logoComercio || null,
      img_nit: this.imagenNIT || null
    };

    console.log('💾 Guardando sucursal con datos:', data);

    if (this.modoEdicion && this.sucursal?.id) {
      // Actualizar sucursal existente
      this.vendedorService.actualizarSucursal(this.sucursal.id, data).subscribe({
        next: (res: any) => {
          console.log("Sucursal actualizada exitosamente", res);
          this.mostrarNotificacion('exito', 'Sucursal actualizada correctamente');
          this.editandoActivamente = false;
          this.cargando = false;
          // Recargar datos
          setTimeout(() => {
            this.cargarSucursal();
          }, 2000);
        },
        error: (err: any) => {
          console.error("Error al actualizar sucursal:", err);
          const mensajeError = this.obtenerMensajeError(err);
          this.mostrarNotificacion('error', mensajeError);
          this.cargando = false;
        }
      });
    } else {
      // Crear nueva sucursal (el id_usuario se toma del usuario logueado en el backend)
      this.vendedorService.crearSucursal(data).subscribe({
        next: (res: any) => {
          console.log("Sucursal creada exitosamente", res);
          this.mostrarNotificacion('exito', 'Sucursal creada correctamente');
          this.editandoActivamente = false;
          this.cargando = false;
          // Recargar datos
          setTimeout(() => {
            this.cargarSucursal();
          }, 2000);
        },
        error: (err: any) => {
          console.error("Error al crear sucursal:", err);
          const mensajeError = this.obtenerMensajeError(err);
          this.mostrarNotificacion('error', mensajeError);
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
      this.mostrarNotificacion('error', validacion.error || 'Error en validación de imagen');
      this.cargandoLogo = false;
      return;
    }

    try {
      console.log('📸 Subiendo logo del comercio...');
      const response = await this.imageUploadService.uploadImage(file, 'perfil');
      console.log('✅ Logo subido a Cloudinary:', response.secure_url);

      this.logoComercio = response.secure_url;

      // Si existe sucursal, actualizar en el backend inmediatamente
      if (this.sucursal?.id) {
        console.log('💾 Guardando logo en el backend...');
        console.log('📋 Sucursal ID:', this.sucursal.id);
        console.log('🔑 Usuario actual:', localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!).id : 'desconocido');
        
        this.vendedorService.actualizarSucursal(this.sucursal.id, {
          logo_comercio: response.secure_url
        }).subscribe({
          next: (res) => {
            console.log('✅ Logo guardado en backend');
            this.sucursal!.logo_comercio = response.secure_url;
            this.logoComercio = response.secure_url; // Asegurar que se actualice también esta propiedad
            this.mostrarNotificacion('exito', 'Logo del comercio actualizado correctamente');
          },
          error: (err) => {
            console.error('❌ Error al guardar logo en backend:', err);
            const mensajeError = this.obtenerMensajeError(err);
            this.mostrarNotificacion('error', mensajeError);
            
            // Si es error de permisos, sugerir verificar sesión
            if (err.status === 403) {
              setTimeout(() => {
                this.mostrarNotificacion('warning', 'Intenta cerrar sesión y volver a entrar');
              }, 5500);
            }
          }
        });
      } else {
        this.mostrarNotificacion('exito', 'Logo actualizado (se guardará al crear/actualizar la sucursal)');
      }

      this.cargandoLogo = false;
    } catch (err: any) {
      console.error('❌ Error al subir logo:', err);
      this.mostrarNotificacion('error', 'Error al subir el logo: ' + (err?.message || 'Error desconocido'));
      this.cargandoLogo = false;
    }
  }

  async onImagenNITSeleccionada(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    this.cargandoNIT = true;

    const validacion = await this.imageUploadService.validateDocument(file, 5);

    if (!validacion.valid) {
      this.mostrarNotificacion('error', validacion.error || 'Error en validación del documento');
      this.cargandoNIT = false;
      return;
    }

    try {
      console.log('📄 Subiendo imagen del NIT...');
      const response = await this.imageUploadService.uploadImage(file, 'comprobante');
      console.log('✅ NIT subido a Cloudinary:', response.secure_url);

      this.imagenNIT = response.secure_url;
      this.form.patchValue({ img_nit: response.secure_url });

      // Si existe sucursal, actualizar en el backend inmediatamente
      if (this.sucursal?.id) {
        console.log('💾 Guardando NIT en el backend...');
        console.log('📋 Sucursal ID:', this.sucursal.id);
        console.log('🔑 Usuario actual:', localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!).id : 'desconocido');
        
        this.vendedorService.actualizarSucursal(this.sucursal.id, {
          img_nit: response.secure_url
        }).subscribe({
          next: (res) => {
            console.log('✅ NIT guardado en backend');
            this.sucursal!.img_nit = response.secure_url;
            this.mostrarNotificacion('exito', 'Imagen del NIT actualizada correctamente');
          },
          error: (err) => {
            console.error('❌ Error al guardar NIT en backend:', err);
            const mensajeError = this.obtenerMensajeError(err);
            this.mostrarNotificacion('error', mensajeError);
            
            // Si es error de permisos, sugerir verificar sesión
            if (err.status === 403) {
              setTimeout(() => {
                this.mostrarNotificacion('warning', 'Intenta cerrar sesión y volver a entrar');
              }, 5500);
            }
          }
        });
      } else {
        this.mostrarNotificacion('exito', 'NIT actualizado (se guardará al crear/actualizar la sucursal)');
      }

      this.cargandoNIT = false;
    } catch (err: any) {
      console.error('❌ Error al subir NIT:', err);
      this.mostrarNotificacion('error', 'Error al subir la imagen del NIT: ' + (err?.message || 'Error desconocido'));
      this.cargandoNIT = false;
    }
  }

  get f() { return this.form.controls; }
}

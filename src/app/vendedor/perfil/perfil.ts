import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule, NgIf } from '@angular/common';
import { ImageUploadService } from '../../services/image-upload.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterModule, NgIf],
  templateUrl: './perfil.html',
  styleUrl: './perfil.css',
})
export class PerfilVendedor implements OnInit {
    getImagenPerfil(user: any): string {
      const img = user?.images?.find((i: any) => i.type === 'profile');
      return img ? img.url : '';
    }
  imagenPerfil: string = '';

  form: FormGroup;
  mensajeExito: string = '';
  mensajeError: string = '';
  cargando: boolean = false;
  usuario: any = null;
  modoEdicion: boolean = false;
  fotoPerfil: string = '';
  cargandoFoto: boolean = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private imageUploadService: ImageUploadService,
    private userService: UserService
  ) {
    this.form = this.fb.group({
      primer_nombre: ['', Validators.required],
      segundo_nombre: [''],
      primer_apellido: ['', Validators.required],
      segundo_apellido: [''],
      telefono: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      correo: ['', [Validators.required, Validators.email]],
      cuenta_bancaria: ['', Validators.required],
    });
  }

  ngOnInit() {
    this.cargarPerfil();
  }

  cargarPerfil() {
    this.userService.getPerfilUsuario().subscribe(
      res => {
        this.usuario = res.usuario || res.user || res;
        this.cargarDatos();
        // Buscar imagen de perfil en images, luego en profile_url y foto_perfil
        this.imagenPerfil = (this.usuario.images?.find((img: any) => img.type === 'profile')?.url)
          || this.usuario.profile_url
          || this.usuario.foto_perfil
          || '';
        localStorage.setItem('user', JSON.stringify(this.usuario));
        this.desactivarFormulario();
      },
      err => {
        console.error('Error al consultar perfil:', err);
        this.mensajeError = 'No se pudo cargar el perfil';
      }
    );
  }

  toggleModoEdicion() {
    this.modoEdicion = !this.modoEdicion;
    if (this.modoEdicion) {
      this.activarFormulario();
      this.mensajeExito = '';
    } else {
      this.desactivarFormulario();
      this.cargarDatos();
      this.mensajeError = '';
    }
  }

  desactivarFormulario() {
    Object.keys(this.form.controls).forEach(key => {
      this.form.get(key)?.disable();
    });
  }

  activarFormulario() {
    Object.keys(this.form.controls).forEach(key => {
      this.form.get(key)?.enable();
    });
  }

  async onFotoSeleccionada(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    this.cargandoFoto = true;
    this.mensajeError = '';

    try {
      const validacion = await this.imageUploadService.validateImage(file, 5, 100, 100);
      if (!validacion.valid) {
        this.mensajeError = validacion.error || 'Error al validar imagen';
        this.cargandoFoto = false;
        return;
      }

      const response = await this.imageUploadService.uploadImage(file, 'perfil');
      this.fotoPerfil = response.secure_url;
      // Guardar en el backend
      this.userService.actualizarFotoPerfil(response.secure_url).subscribe({
        next: () => {
          this.mensajeExito = 'Foto de perfil actualizada';
          this.cargandoFoto = false;
          // Refrescar perfil para mostrar la imagen actualizada
          this.cargarPerfil();
          setTimeout(() => this.mensajeExito = '', 3000);
        },
        error: (err) => {
          this.mensajeError = 'Error al guardar la foto en el backend';
          this.cargandoFoto = false;
        }
      });
    } catch (e: any) {
      this.mensajeError = 'Error al subir la imagen' + (e?.message ? ': ' + e.message : '');
      this.cargandoFoto = false;
    }
  }

  cargarDatos() {
    if (this.usuario) {
      this.form.patchValue({
        primer_nombre: this.usuario.primer_nombre || '',
        segundo_nombre: this.usuario.segundo_nombre || '',
        primer_apellido: this.usuario.primer_apellido || '',
        segundo_apellido: this.usuario.segundo_apellido || '',
        telefono: this.usuario.telefono || '',
        correo: this.usuario.correo || '',
        cuenta_bancaria: this.usuario.cuenta_bancaria || '',
      });
    }
  }

  guardarPerfil() {
    if (this.form.invalid) {
      this.mensajeError = 'Por favor completa todos los campos requeridos';
      return;
    }
    this.cargando = true;
    const datos = this.form.getRawValue();
    // Solo enviar campos modificados
    const datosModificados: any = {};
    Object.keys(datos).forEach(key => {
      if (datos[key] !== this.usuario[key]) {
        datosModificados[key] = datos[key];
      }
    });
    if (Object.keys(datosModificados).length === 0) {
      this.mensajeError = 'No hay cambios para guardar';
      this.cargando = false;
      return;
    }
    // Llamar al servicio y guardar el usuario actualizado
    this.userService.actualizarPerfil(datosModificados).subscribe({
      next: (response: any) => {
        this.mensajeExito = 'Perfil actualizado correctamente';
        this.mensajeError = '';
        this.cargando = false;
        this.modoEdicion = false;
        // Refrescar perfil para mostrar datos actualizados
        this.cargarPerfil();
        setTimeout(() => this.mensajeExito = '', 3000);
      },
      error: (error: any) => {
        this.mensajeError = error.error?.mensaje || 'Error al actualizar el perfil';
        this.cargando = false;
      }
    });
  }

  get f() { return this.form.controls; }
}

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule, NgIf } from '@angular/common';
import { ImageUploadService } from '../../services/image-upload.service';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterModule, NgIf],
  templateUrl: './perfil.html',
  styleUrl: './perfil.css',
})
export class PerfilVendedor implements OnInit {

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
    private imageUploadService: ImageUploadService
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
    const userStr = localStorage.getItem('user');
    if (userStr) {
      this.usuario = JSON.parse(userStr);
      this.cargarDatos();
      // Buscar profile_url en diferentes propiedades
      this.fotoPerfil = this.usuario.profile_url || this.usuario.foto_perfil || '';
      console.log('👤 Usuario cargado:', this.usuario);
      console.log('📸 Foto de perfil:', this.fotoPerfil);
    }
    this.desactivarFormulario();
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

      console.log('📸 Subiendo foto de perfil a Cloudinary...');
      const response = await this.imageUploadService.uploadImage(file, 'perfil');
      console.log('✅ Foto subida exitosamente:', response.secure_url);

      // Actualizar la URL de la foto localmente
      this.fotoPerfil = response.secure_url;

      // Actualizar el objeto usuario en memoria y localStorage
      if (this.usuario) {
        this.usuario.profile_url = response.secure_url;
        localStorage.setItem('user', JSON.stringify(this.usuario));
      }

      this.mensajeExito = '✅ Foto de perfil actualizada correctamente';
      this.cargandoFoto = false;

      // Limpiar mensaje después de 3 segundos
      setTimeout(() => this.mensajeExito = '', 3000);

    } catch (e: any) {
      console.error('❌ Error al subir foto:', e);
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
    setTimeout(() => {
      this.mensajeExito = 'Perfil actualizado correctamente';
      this.mensajeError = '';
      this.cargando = false;
      this.modoEdicion = false;
      this.desactivarFormulario();
      setTimeout(() => this.mensajeExito = '', 3000);
    }, 1000);
  }

  get f() { return this.form.controls; }
}

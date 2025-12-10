import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ImageUploadService } from '../../services/image-upload.service';
import { UserService } from '../../services/user.service';
import { ProfileUploadComponent } from '../../components/profile-upload/profile-upload';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterModule, ProfileUploadComponent],
  templateUrl: './perfil.html',
  styleUrl: './perfil.css',
})
export class PerfilCliente implements OnInit {

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
    const userStr = localStorage.getItem('user');
    if (userStr) {
      this.usuario = JSON.parse(userStr);
      this.cargarDatos();
      this.fotoPerfil = this.usuario.profile_url || this.usuario.foto_perfil || '';
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

  onProfileImageUploaded(imageUrl: string) {
    this.cargandoFoto = true;
    this.fotoPerfil = imageUrl;
    
    // Guardar en el backend
    this.userService.actualizarFotoPerfil(imageUrl).subscribe({
      next: (response) => {
        console.log('✅ Foto de perfil guardada en el backend:', response);
        
        // Actualizar localStorage
        if (this.usuario) {
          this.usuario.profile_url = imageUrl;
          localStorage.setItem('user', JSON.stringify(this.usuario));
        }
        
        this.mensajeExito = '✅ Foto de perfil actualizada correctamente';
        this.cargandoFoto = false;
        setTimeout(() => this.mensajeExito = '', 3000);
      },
      error: (error) => {
        console.error('❌ Error al guardar foto en backend:', error);
        this.mensajeError = 'Error al guardar la foto de perfil';
        this.cargandoFoto = false;
        setTimeout(() => this.mensajeError = '', 3000);
      }
    });
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
        next: (backendResponse) => {
          console.log('✅ Foto guardada en backend:', backendResponse);
          
          // Actualizar localStorage
          this.usuario.profile_url = response.secure_url;
          localStorage.setItem('user', JSON.stringify(this.usuario));
          
          this.mensajeExito = '✅ Foto de perfil actualizada correctamente';
          this.cargandoFoto = false;
          setTimeout(() => this.mensajeExito = '', 3000);
        },
        error: (error) => {
          console.error('❌ Error al guardar en backend:', error);
          this.mensajeError = 'Error al guardar la foto de perfil';
          this.cargandoFoto = false;
          setTimeout(() => this.mensajeError = '', 3000);
        }
      });
      
    } catch (e: any) {
      this.mensajeError = 'Error al validar la imagen' + (e?.message ? ': ' + e.message : '');
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

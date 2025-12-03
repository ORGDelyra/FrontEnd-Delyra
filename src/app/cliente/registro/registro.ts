import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RegistroService } from '../../services/registro';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
  templateUrl: './registro.html',
  styleUrl: './registro.css'
})
export class RegistroCliente {

  form: FormGroup;
  mensajeError: string = '';
  mensajeExito: string = '';
  cargando: boolean = false;
  mostrarPassword: boolean = false;

  constructor(
    private fb: FormBuilder,
    private registroService: RegistroService,
    private router: Router
  ) {
    this.form = this.fb.group({
      primer_nombre: ['', [Validators.required, Validators.maxLength(50)]],
      segundo_nombre: ['', Validators.maxLength(50)],
      primer_apellido: ['', [Validators.required, Validators.maxLength(50)]],
      segundo_apellido: ['', Validators.maxLength(50)],
      telefono: ['', [Validators.required, Validators.maxLength(10)]],
      correo: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      cuenta_bancaria: ['', [Validators.required, Validators.maxLength(30)]],
    });
  }

  registrar() {
    if (this.form.invalid) {
      this.marcarCamposInvalidos();
      this.mensajeError = 'Por favor completa todos los campos requeridos correctamente';
      return;
    }

    this.cargando = true;
    this.mensajeError = '';
    this.mensajeExito = '';

    const data = {
      id_rol: 2, // Cliente (compra productos)
      ...this.form.value
    };

    this.registroService.registrarUsuario(data).subscribe({
      next: (res: any) => {
        console.log("Registro exitoso", res);
        this.mensajeExito = res.mensaje || 'Registro exitoso. Redirigiendo...';
        this.cargando = false;
        // Guardar token si viene en la respuesta
        if (res.token) {
          localStorage.setItem('token', res.token);
        }
        if (res.usuario) {
          localStorage.setItem('user', JSON.stringify(res.usuario));
        }
        // Redirigir después de 2 segundos
        setTimeout(() => {
          this.router.navigate(['/inicio-sesion']);
        }, 2000);
      },
      error: (err: any) => {
        console.error("Error en registro:", err);
        this.mensajeError = err.error?.mensaje || err.error?.message || 'Error al registrar. Por favor intenta de nuevo.';
        this.cargando = false;
      }
    });
  }

  private marcarCamposInvalidos() {
    Object.keys(this.form.controls).forEach(key => {
      const control = this.form.get(key);
      if (control && control.invalid) {
        control.markAsTouched();
      }
    });
  }

  togglePassword() {
    this.mostrarPassword = !this.mostrarPassword;
  }

  get f() { return this.form.controls; }
}

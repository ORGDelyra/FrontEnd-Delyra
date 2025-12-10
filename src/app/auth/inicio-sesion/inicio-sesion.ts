import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-inicio-sesion',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
  templateUrl: './inicio-sesion.html',
  styleUrl: './inicio-sesion.css',
})
export class InicioSesion {

  form: FormGroup;
  mensajeError: string = '';
  cargando: boolean = false;
  mostrarPassword: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.form = this.fb.group({
      correo: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  iniciarSesion() {
    if (this.form.invalid) {
      this.marcarCamposInvalidos();
      this.mensajeError = 'Por favor completa todos los campos correctamente';
      return;
    }

    this.cargando = true;
    this.mensajeError = '';

    const data = {
      correo: this.form.value.correo,
      password: this.form.value.password
    };

    this.authService.login(data).subscribe({
      next: (res: any) => {
        console.log("[InicioSesion] Respuesta del backend:", res);

        // Esperar un pequeño delay para asegurar que el token se guardó
        setTimeout(() => {
          const tokenGuardado = localStorage.getItem('token');
          const userGuardado = localStorage.getItem('user');
          console.log("[InicioSesion] Token verificado post-guardado: ✅ Existe");
          console.log("[InicioSesion] User guardado:", userGuardado ? "✅ Existe" : "❌ No existe");

          this.cargando = false;

          // Extraer el rol del usuario
          const usuario = res.usuario || res.user || res.data?.user;
          let idRol = usuario?.id_rol || usuario?.rol_id || 2; // Default a cliente (2)

          // Si no hay rol pero tenemos usuario, intentar obtenerlo del JSON guardado
          if (!idRol && userGuardado) {
            try {
              const userData = JSON.parse(userGuardado);
              idRol = userData?.id_rol || userData?.rol_id || 2;
            } catch (e) {
              console.warn("[InicioSesion] No se pudo parsear usuario guardado");
            }
          }

          console.log("[InicioSesion] Rol detectado:", idRol, "Usuario datos:", usuario);
          this.redirigirSegunRol(idRol);
        }, 200); // Esperar 200ms para asegurar que localStorage se escribió
      },
      error: (err: any) => {
        console.error("[InicioSesion] Error al iniciar sesión:", err);

        let mensaje = 'Correo o contraseña incorrectos. Por favor intenta de nuevo.';

        if (err.status === 0) {
          mensaje = 'No se puede conectar al servidor. Verifica que el backend esté corriendo en http://127.0.0.1:8000';
        } else if (err.error?.mensaje) {
          mensaje = err.error.mensaje;
        } else if (err.error?.message) {
          mensaje = err.error.message;
        }

        this.mensajeError = mensaje;
        this.cargando = false;
      }
    });
  }

  private redirigirSegunRol(idRol: number | undefined) {
    // id_rol: 1 = Admin, 2 = Cliente, 3 = Comerciante/Vendedor, 4 = Domiciliario
    switch (idRol) {
      case 1:
        // Admin
        this.router.navigate(['/admin/inicio']);
        break;
      case 2:
        // Cliente
        this.router.navigate(['/cliente/inicio']);
        break;
      case 3:
        // Comerciante/Vendedor
        this.router.navigate(['/vendedor/inicio']);
        break;
      case 4:
        // Domiciliario
        this.router.navigate(['/domiciliario/inicio']);
        break;
      default:
        // Si no hay rol, volver a selección
        this.router.navigate(['/bienvenida']);
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

  togglePassword() {
    this.mostrarPassword = !this.mostrarPassword;
  }

  get f() { return this.form.controls; }
}


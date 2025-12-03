import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { VendedorService } from '../../services/vendedor.service';
import { Category } from '../../interfaces/product.interface';

@Component({
  selector: 'app-productos-editar',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
  templateUrl: './productos-editar.html',
  styleUrl: './productos-editar.css',
})
export class EditarProductoVendedor implements OnInit {

  form: FormGroup;
  categorias: Category[] = [];
  mensajeError: string = '';
  cargando: boolean = false;
  productoId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private vendedorService: VendedorService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.form = this.fb.group({
      nombre: ['', Validators.required],
      descripcion: [''],
      precio: ['', [Validators.required, Validators.min(0)]],
      cantidad: ['', [Validators.required, Validators.min(0)]],
      id_categoria: ['', Validators.required],
    });
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.productoId = +params['id'];
      this.cargarCategorias();
      this.cargarProducto();
    });
  }

  cargarCategorias() {
    console.log('🔄 Cargando categorías para edición...');
    this.vendedorService.obtenerCategorias().subscribe({
      next: (response: any) => {
        const cats = Array.isArray(response) ? response : (response?.data || []);
        this.categorias = cats || [];
        console.log(`✅ ${this.categorias.length} categorías cargadas`);
      },
      error: (err) => {
        console.error("❌ Error al cargar categorías:", err);
        this.categorias = [];
      }
    });
  }

  cargarProducto() {
    if (this.productoId) {
      console.log('📦 Cargando producto ID:', this.productoId);
      this.cargando = true;
      this.vendedorService.obtenerProductoPorId(this.productoId).subscribe({
        next: (prod) => {
          console.log('✅ Producto cargado:', prod);
          this.form.patchValue({
            nombre: prod.nombre,
            descripcion: prod.descripcion || '',
            precio: prod.precio,
            cantidad: prod.cantidad,
            id_categoria: prod.id_categoria,
          });
          this.cargando = false;
        },
        error: (err) => {
          console.error('❌ Error al cargar producto:', err);
          console.error('📋 Status:', err.status);
          console.error('💬 Mensaje:', err.error);
          this.mensajeError = 'Error al cargar producto';
          this.cargando = false;
        }
      });
    }
  }

  actualizarProducto() {
    if (this.form.invalid || !this.productoId) {
      this.mensajeError = 'Por favor completa todos los campos requeridos';
      this.marcarCamposInvalidos();
      return;
    }

    this.cargando = true;
    this.mensajeError = '';

    const datosActualizar = this.form.value;

    console.log('📝 Actualizando producto ID:', this.productoId);
    console.log('📦 Datos a enviar:', datosActualizar);
    console.log('🔑 Token en localStorage:', localStorage.getItem('token') ? 'Presente' : 'Ausente');

    this.vendedorService.actualizarProducto(this.productoId, datosActualizar).subscribe({
      next: (response) => {
        console.log('✅ Producto actualizado exitosamente:', response);
        this.router.navigate(['/vendedor/productos']);
      },
      error: (err) => {
        console.error('❌ Error al actualizar producto:', err);
        console.error('📋 Status:', err.status);
        console.error('💬 Mensaje:', err.error?.message);
        console.error('📦 Error completo:', err.error);

        // Mensaje de error específico
        if (err.error?.message?.includes('fillable')) {
          this.mensajeError = '⚠️ Error de configuración en el backend. El modelo Product necesita tener los campos actualizables en $fillable';
        } else {
          this.mensajeError = err.error?.message || 'Error al actualizar producto';
        }

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

  get f() { return this.form.controls; }
}

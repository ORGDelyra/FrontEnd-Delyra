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
    this.vendedorService.obtenerCategorias().subscribe({
      next: (cats: Category[]) => {
        this.categorias = cats;
      },
      error: (err) => console.error("Error al cargar categorías:", err)
    });
  }

  cargarProducto() {
    if (this.productoId) {
      this.cargando = true;
      this.vendedorService.obtenerProductoPorId(this.productoId).subscribe({
        next: (prod) => {
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
          this.mensajeError = 'Error al cargar producto';
          this.cargando = false;
        }
      });
    }
  }

  actualizarProducto() {
    if (this.form.invalid || !this.productoId) {
      this.mensajeError = 'Por favor completa todos los campos requeridos';
      return;
    }

    this.cargando = true;
    this.vendedorService.actualizarProducto(this.productoId, this.form.value).subscribe({
      next: () => {
        this.router.navigate(['/vendedor/productos']);
      },
      error: (err) => {
        this.mensajeError = err.error?.message || 'Error al actualizar producto';
        this.cargando = false;
      }
    });
  }

  get f() { return this.form.controls; }
}

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { VendedorService } from '../../services/vendedor.service';
import { Category } from '../../interfaces/product.interface';
import { ProductUploadComponent } from '../../components/product-upload/product-upload';

@Component({
  selector: 'app-productos-crear',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterModule, ProductUploadComponent],
  templateUrl: './productos-crear.html',
  styleUrl: './productos-crear.css',
})
export class CrearProductoVendedor implements OnInit {

  form: FormGroup;
  categorias: Category[] = [];
  mensajeError: string = '';
  cargando: boolean = false;
  imagenesProduto: string[] = []; // URLs de las imágenes del producto

  constructor(
    private fb: FormBuilder,
    private vendedorService: VendedorService,
    private router: Router
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
    this.cargarCategorias();
  }

  cargarCategorias() {
    this.vendedorService.obtenerCategorias().subscribe({
      next: (cats: Category[]) => {
        this.categorias = cats;
      },
      error: (err) => console.error("Error al cargar categorías:", err)
    });
  }

  onProductImagesUploaded(imageUrls: string[]) {
    this.imagenesProduto = imageUrls;
    console.log('Imágenes del producto:', imageUrls);
  }

  crearProducto() {
    if (this.form.invalid) {
      this.mensajeError = 'Por favor completa todos los campos requeridos';
      return;
    }

    this.cargando = true;
    this.vendedorService.crearProducto(this.form.value).subscribe({
      next: () => {
        this.router.navigate(['/vendedor/productos']);
      },
      error: (err) => {
        this.mensajeError = err.error?.message || 'Error al crear producto';
        this.cargando = false;
      }
    });
  }

  get f() { return this.form.controls; }
}

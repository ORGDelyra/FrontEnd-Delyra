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
  sucursalId: number | null = null; // ID de la sucursal del vendedor

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
    console.log('📋 Componente CrearProducto iniciado');
    console.log('🔑 Token disponible:', localStorage.getItem('token') ? 'SÍ' : 'NO');
    this.cargarCategorias();
    this.cargarSucursal();
  }

  cargarSucursal() {
    console.log('🏪 Cargando sucursal del vendedor...');
    this.vendedorService.obtenerSucursales().subscribe({
      next: (sucursales) => {
        if (sucursales && sucursales.length > 0) {
          // Tomar la primera sucursal del vendedor
          this.sucursalId = sucursales[0].id ?? null;
          console.log('✅ Sucursal cargada. ID:', this.sucursalId);
        } else {
          console.warn('⚠️ El vendedor no tiene sucursales registradas');
          this.mensajeError = 'Debes crear una sucursal antes de agregar productos';
        }
      },
      error: (err) => {
        console.error('❌ Error al cargar sucursal:', err);
        this.mensajeError = 'Error al cargar información de la sucursal';
      }
    });
  }

  cargarCategorias() {
    console.log('🔄 Intentando cargar categorías...');
    console.log('🌐 URL del endpoint:', 'http://127.0.0.1:8000/api/category');

    this.vendedorService.obtenerCategorias().subscribe({
      next: (response: any) => {
        console.log('✅ Respuesta recibida del backend:', response);
        console.log('📊 Tipo de dato recibido:', typeof response);
        console.log('📦 Es array?:', Array.isArray(response));

        // La respuesta puede ser directamente un array o estar dentro de un objeto
        const cats = Array.isArray(response) ? response : (response?.data || []);

        console.log('📋 Categorías procesadas:', cats);

        // Manejar caso cuando la API devuelve null o undefined
        this.categorias = cats || [];

        if (!cats || cats.length === 0) {
          console.error('❌ No hay categorías disponibles');
          this.mensajeError = 'No hay categorías disponibles. Por favor contacta al administrador.';
        } else {
          console.log(`✨ ${cats.length} categorías cargadas correctamente:`, cats.map((c: any) => c.nombre_categoria));
          this.mensajeError = ''; // Limpiar cualquier error previo
        }
      },
      error: (err) => {
        console.error("❌ Error al cargar categorías:", err);
        console.error("📋 Status:", err.status);
        console.error("💬 Mensaje:", err.message);
        console.error("📦 Error completo:", err.error);
        this.categorias = []; // Inicializar como array vacío en caso de error
        this.mensajeError = `Error ${err.status}: No se pudieron cargar las categorías. ${err.error?.message || ''}`;
      }
    });
  }

  onProductImagesUploaded(imageUrls: string[]) {
    this.imagenesProduto = imageUrls;
    console.log('📸 Imágenes del producto cargadas:', imageUrls);
  }

  crearProducto() {
    if (this.form.invalid) {
      this.mensajeError = 'Por favor completa todos los campos requeridos';
      this.marcarCamposInvalidos();
      return;
    }

    // Validar que hay al menos una imagen
    if (this.imagenesProduto.length === 0) {
      this.mensajeError = 'Por favor carga al menos una imagen del producto';
      return;
    }

    // Validar que el vendedor tenga una sucursal
    if (!this.sucursalId) {
      this.mensajeError = 'Debes crear una sucursal antes de agregar productos';
      return;
    }

    this.cargando = true;
    this.mensajeError = '';

    // Preparar datos del producto con imágenes y sucursal
    const datosProducto = {
      ...this.form.value,
      imagenes: this.imagenesProduto,  // Agregar URLs de las imágenes
      id_sucursal: this.sucursalId      // Agregar ID de la sucursal
    };

    console.log('📦 Datos del producto a enviar:', datosProducto);
    console.log('🏷️ ID Categoría seleccionada:', datosProducto.id_categoria);
    console.log('🏪 ID Sucursal:', datosProducto.id_sucursal);
    console.log('📸 Imágenes:', datosProducto.imagenes);

    this.vendedorService.crearProducto(datosProducto).subscribe({
      next: (response: any) => {
        console.log('✅ Producto creado exitosamente:', response);
        this.cargando = false;
        this.router.navigate(['/vendedor/productos']);
      },
      error: (err: any) => {
        console.error('❌ Error al crear producto:', err);
        console.error('📋 Status:', err.status);
        console.error('💬 Mensaje:', err.error?.message);
        console.error('📦 Error completo:', err.error);

        // Mostrar mensaje de error específico
        if (err.error?.message?.includes('fillable')) {
          this.mensajeError = '⚠️ Error de configuración en el backend. Necesitas agregar "id_categoria" al array $fillable en el modelo Product.php';
        } else {
          this.mensajeError = err.error?.message || 'Error al crear producto';
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

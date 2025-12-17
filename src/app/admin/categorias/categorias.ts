import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin.service';

@Component({
  selector: 'app-categorias-admin',
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule],
  templateUrl: './categorias.html',
  styleUrl: './categorias.css',
})
export class CategoriasAdmin implements OnInit {

  categorias: any[] = [];
  cargando: boolean = false;
  mensajeError: string = '';
  mensajeExito: string = '';
  mostrarModal: boolean = false;
  modoEdicion: boolean = false;
  categoriaSeleccionada: any = null;
  terminoBusqueda: string = '';

  // Formulario
  formCategoria = {
    nombre_categoria: '',
    descripcion: ''
  };

  constructor(
    private router: Router,
    private adminService: AdminService
  ) {}

  ngOnInit() {
    this.cargarCategorias();
  }

  cargarCategorias() {
    this.cargando = true;
    this.mensajeError = '';
    this.adminService.obtenerCategorias().subscribe({
      next: (categorias: any[]) => {
        this.categorias = categorias;
        this.cargando = false;
      },
      error: (err) => {
        console.error("Error al cargar categorías:", err);
        this.mensajeError = err.error?.mensaje || 'Error al cargar las categorías';
        this.cargando = false;
      }
    });
  }

  abrirModalCrear() {
    this.modoEdicion = false;
    this.categoriaSeleccionada = null;
    this.formCategoria = {
      nombre_categoria: '',
      descripcion: ''
    };
    this.mostrarModal = true;
  }

  abrirModalEditar(categoria: any) {
    this.modoEdicion = true;
    this.categoriaSeleccionada = categoria;
    this.formCategoria = {
      nombre_categoria: categoria.nombre_categoria || '',
      descripcion: categoria.descripcion || ''
    };
    this.mostrarModal = true;
  }

  guardarCategoria() {
    if (!this.formCategoria.nombre_categoria.trim()) {
      this.mensajeError = 'El nombre es requerido';
      return;
    }

    this.cargando = true;
    this.mensajeError = '';
    this.mensajeExito = '';

    if (this.modoEdicion && this.categoriaSeleccionada?.id) {
      this.adminService.actualizarCategoria(this.categoriaSeleccionada.id, this.formCategoria).subscribe({
        next: (res: any) => {
          this.mensajeExito = 'Categoría actualizada exitosamente';
          this.mostrarModal = false;
          this.cargarCategorias();
          setTimeout(() => this.mensajeExito = '', 3000);
        },
        error: (err) => {
          this.mensajeError = err.error?.mensaje || 'Error al actualizar la categoría';
          this.cargando = false;
        }
      });
    } else {
      this.adminService.crearCategoria(this.formCategoria).subscribe({
        next: (res: any) => {
          this.mensajeExito = 'Categoría creada exitosamente';
          this.mostrarModal = false;
          this.cargarCategorias();
          setTimeout(() => this.mensajeExito = '', 3000);
        },
        error: (err) => {
          this.mensajeError = err.error?.mensaje || 'Error al crear la categoría';
          this.cargando = false;
        }
      });
    }
  }

  eliminarCategoria(id: number) {
    if (!confirm('¿Estás seguro de eliminar esta categoría?')) {
      return;
    }

    this.adminService.eliminarCategoria(id).subscribe({
      next: (res: any) => {
        this.mensajeExito = 'Categoría eliminada exitosamente';
        this.cargarCategorias();
        setTimeout(() => this.mensajeExito = '', 3000);
      },
      error: (err) => {
        this.mensajeError = err.error?.mensaje || 'Error al eliminar la categoría';
      }
    });
  }

  get categoriasFiltradas(): any[] {
    if (!this.terminoBusqueda.trim()) {
      return this.categorias;
    }
    const busqueda = this.terminoBusqueda.toLowerCase();
    return this.categorias.filter(c =>
      c.nombre_categoria?.toLowerCase().includes(busqueda) ||
      c.descripcion?.toLowerCase().includes(busqueda)
    );
  }
}


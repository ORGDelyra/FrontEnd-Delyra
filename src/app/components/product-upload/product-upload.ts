import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageUploadService } from '../../services/image-upload.service';

@Component({
  selector: 'app-product-upload',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-upload.html',
  styleUrl: './product-upload.css'
})
export class ProductUploadComponent {
  @Output() imageUploaded = new EventEmitter<string>();
  @Output() multipleImagesUploaded = new EventEmitter<string[]>();

  selectedFiles: File[] = [];
  previewUrls: string[] = [];
  uploading: boolean = false;
  uploadProgress: number = 0;
  error: string | null = null;

  constructor(private cloudinaryService: ImageUploadService) {
    this.cloudinaryService.uploadProgress$.subscribe(({ loaded, total }) => {
      this.uploadProgress = Math.round((loaded / total) * 100);
    });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const files = input.files;

    if (!files) return;

    this.selectedFiles = Array.from(files);
    this.previewUrls = [];
    this.error = null;

    // Validar todos los archivos
    for (const file of this.selectedFiles) {
      if (!file.type.startsWith('image/')) {
        this.error = 'Solo se aceptan imágenes';
        this.selectedFiles = [];
        return;
      }
      if (file.size > 50 * 1024 * 1024) {
        this.error = 'Máximo 50MB por imagen';
        this.selectedFiles = [];
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        this.previewUrls.push(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  async uploadProducts() {
    if (this.selectedFiles.length === 0) {
      this.error = 'Selecciona al menos una imagen';
      return;
    }

    this.uploading = true;
    this.error = null;

    try {
      const results = await this.cloudinaryService.uploadImages(
        this.selectedFiles,
        'producto',
        'delyra/productos'
      );

      const urls = results.map(r => r.secure_url);
      this.multipleImagesUploaded.emit(urls);
      this.uploading = false;
      this.selectedFiles = [];
      this.previewUrls = [];

    } catch (err) {
      this.error = `Error: ${err instanceof Error ? err.message : 'Desconocido'}`;
      this.uploading = false;
    }
  }

  clear() {
    this.selectedFiles = [];
    this.previewUrls = [];
    this.uploadProgress = 0;
  }

  removePreview(index: number) {
    this.selectedFiles.splice(index, 1);
    this.previewUrls.splice(index, 1);
  }
}

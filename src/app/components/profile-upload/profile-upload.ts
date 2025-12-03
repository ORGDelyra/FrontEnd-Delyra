import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageUploadService } from '../../services/image-upload.service';

@Component({
  selector: 'app-profile-upload',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile-upload.html',
  styleUrl: './profile-upload.css'
})
export class ProfileUploadComponent {
  @Output() imageUploaded = new EventEmitter<string>();

  selectedFile: File | null = null;
  previewUrl: string | null = null;
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
    const file = input.files?.[0];

    if (!file) return;
    if (!file.type.startsWith('image/')) {
      this.error = 'Solo se aceptan imágenes';
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      this.error = 'Máximo 50MB';
      return;
    }

    this.selectedFile = file;
    this.error = null;

    const reader = new FileReader();
    reader.onload = (e) => {
      this.previewUrl = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }

  async uploadProfile() {
    if (!this.selectedFile) {
      this.error = 'Selecciona un archivo';
      return;
    }

    this.uploading = true;
    this.error = null;

    try {
      const result = await this.cloudinaryService.uploadImage(
        this.selectedFile,
        'perfil',
        'delyra/perfiles'
      );

      this.imageUploaded.emit(result.secure_url);
      this.uploading = false;
      this.selectedFile = null;
      this.previewUrl = null;

    } catch (err) {
      this.error = `Error: ${err instanceof Error ? err.message : 'Desconocido'}`;
      this.uploading = false;
    }
  }

  clear() {
    this.selectedFile = null;
    this.previewUrl = null;
    this.uploadProgress = 0;
  }
}

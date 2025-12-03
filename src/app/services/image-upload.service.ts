import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';

export type UploadType = 'perfil' | 'comprobante' | 'producto';

@Injectable({
  providedIn: 'root'
})
export class ImageUploadService {
  private cloudName = 'dtpg4uivr';
  // URL del backend que manejará la autenticación con Cloudinary
  private backendUploadUrl = '/api/upload';

  uploadProgress$ = new Subject<{ loaded: number; total: number }>();

  constructor(private http: HttpClient) {}

  /**
   * Sube un archivo a través del backend (que lo envía a Cloudinary)
   * @param file Archivo a subir
   * @param type Tipo: 'perfil' | 'comprobante' | 'producto'
   * @param folder Carpeta en Cloudinary (opcional)
   */
  uploadImage(
    file: File,
    type: UploadType = 'perfil',
    folder?: string
  ): Promise<{ secure_url: string; public_id: string }> {
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);

      if (folder) {
        formData.append('folder', folder);
      }

      console.log(`[Upload] Enviando ${file.name} (tipo: ${type}) al backend...`);

      const xhr = new XMLHttpRequest();

      // Track progress
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          this.uploadProgress$.next({ loaded: e.loaded, total: e.total });
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          try {
            const response = JSON.parse(xhr.responseText);
            console.log(`[Upload SUCCESS]`, response);
            resolve({
              secure_url: response.secure_url || response.url,
              public_id: response.public_id || response.id
            });
          } catch (e) {
            reject(new Error('Invalid response from backend'));
          }
        } else {
          try {
            const errorMsg = xhr.responseText ? JSON.parse(xhr.responseText) : { error: { message: `HTTP ${xhr.status}` } };
            console.error('Upload error:', errorMsg);
            reject(new Error(`Upload error: ${errorMsg.error?.message || errorMsg.message || xhr.status}`));
          } catch (e) {
            console.error('Upload error (raw):', xhr.responseText);
            reject(new Error(`Upload error: HTTP ${xhr.status}`));
          }
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Network error uploading file'));
      });

      xhr.addEventListener('abort', () => {
        reject(new Error('Upload cancelled'));
      });

      xhr.open('POST', this.backendUploadUrl);
      xhr.send(formData);
    });
  }

  /**
   * Sube múltiples archivos del mismo tipo
   */
  uploadImages(
    files: File[],
    type: UploadType = 'perfil',
    folder?: string
  ): Promise<Array<{ secure_url: string; public_id: string }>> {
    const uploads = files.map(file => this.uploadImage(file, type, folder));
    return Promise.all(uploads);
  }

  /**
   * Valida imagen antes de subir
   * @param file: Archivo a validar
   * @param maxSizeMB: Tamaño máximo en MB
   * @param minWidth: Ancho mínimo en pixeles
   * @param minHeight: Alto mínimo en pixeles
   * @returns Promise con { valid: boolean, error?: string }
   */
  validateImage(
    file: File,
    maxSizeMB: number = 5,
    minWidth: number = 100,
    minHeight: number = 100
  ): Promise<{ valid: boolean; error?: string }> {
    return new Promise((resolve) => {
      // Validar tipo de archivo
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        resolve({ valid: false, error: 'Solo se permiten JPG, PNG o WEBP' });
        return;
      }

      // Validar tamaño
      const maxSizeBytes = maxSizeMB * 1024 * 1024;
      if (file.size > maxSizeBytes) {
        resolve({ valid: false, error: `Archivo muy grande. Máximo ${maxSizeMB}MB` });
        return;
      }

      // Validar dimensiones
      const img = new Image();
      img.onload = () => {
        if (img.width < minWidth || img.height < minHeight) {
          resolve({ valid: false, error: `Resolución mínima: ${minWidth}x${minHeight}px` });
        } else {
          resolve({ valid: true });
        }
      };
      img.onerror = () => {
        resolve({ valid: false, error: 'No se puede leer la imagen' });
      };
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Valida documento (PDF, JPG, PNG)
   * @param file: Archivo a validar
   * @param maxSizeMB: Tamaño máximo en MB
   * @returns Promise con { valid: boolean, error?: string }
   */
  validateDocument(file: File, maxSizeMB: number = 5): Promise<{ valid: boolean; error?: string }> {
    return new Promise((resolve) => {
      const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        resolve({ valid: false, error: 'Solo se permiten JPG, PNG o PDF' });
        return;
      }

      const maxSizeBytes = maxSizeMB * 1024 * 1024;
      if (file.size > maxSizeBytes) {
        resolve({ valid: false, error: `Archivo muy grande. Máximo ${maxSizeMB}MB` });
        return;
      }

      resolve({ valid: true });
    });
  }

  /**
   * Obtén la URL segura de Cloudinary desde la respuesta
   */
  getSecureUrl(cloudinaryResponse: any): string {
    return cloudinaryResponse.secure_url;
  }

  /**
   * Crea una URL de transformación para Cloudinary
   * Útil para redimensionar o comprimir imágenes
   */
  getTransformedUrl(
    secureUrl: string,
    width?: number,
    height?: number,
    quality?: number
  ): string {
    if (!width && !height && !quality) return secureUrl;

    const baseUrl = secureUrl.replace('/upload/', '/upload/');
    const transformations = [];

    if (width || height) {
      transformations.push(`c_scale,w_${width || 'auto'},h_${height || 'auto'}`);
    }

    if (quality) {
      transformations.push(`q_${quality}`);
    }

    if (transformations.length === 0) return secureUrl;

    return baseUrl.replace(
      '/upload/',
      `/upload/${transformations.join(',')}/`
    );
  }
}

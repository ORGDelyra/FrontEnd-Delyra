import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ImageUploadService {
  private cloudinaryUrl = 'https://api.cloudinary.com/v1_1/dtpg4uivr/image/upload';

  // Upload Presets configurados en Cloudinary
  private uploadPresets = {
    productos: 'imegenes_productos',
    perfil: 'perfil_usuarios',
    comprobante: 'imegenes_comprobante_pago'
  };

  constructor(private http: HttpClient) {}

  /**
   * Sube una imagen directamente a Cloudinary (Unsigned Upload)
   * @param file: Archivo seleccionado del input type="file"
   * @param presetType: Tipo de preset ('productos', 'perfil', 'comprobante')
   * @returns Observable con la respuesta de Cloudinary (contiene secure_url)
   */
  uploadImage(file: File, presetType: 'productos' | 'perfil' | 'comprobante' = 'perfil'): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', this.uploadPresets[presetType]);

    return this.http.post(this.cloudinaryUrl, formData);
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

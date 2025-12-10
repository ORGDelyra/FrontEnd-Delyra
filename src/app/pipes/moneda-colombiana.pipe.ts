import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'monedaColombia',
  standalone: true
})
export class MonedaColombianaPipe implements PipeTransform {
  transform(valor: number | string | null | undefined): string {
    if (valor === null || valor === undefined) {
      return '$0';
    }

    const numerico = typeof valor === 'string' ? parseFloat(valor) : valor;

    if (isNaN(numerico)) {
      return '$0';
    }

    // Formatear con separador de miles (puntos) y sin decimales
    // Ejemplo: 1500000 -> $1.500.000
    const formateado = new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(numerico);

    return formateado;
  }
}

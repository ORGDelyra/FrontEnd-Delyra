/**
 * Utilidades para mapeo de roles
 */

/**
 * Convierte un id_rol numérico a su representación en string
 * @param idRol - ID numérico del rol (1=admin, 2=cliente, 3=vendedor, 4=domiciliario)
 * @returns String del rol o 'cliente' por defecto
 */
export function mapIdRolToString(idRol: number | undefined): string {
  switch (idRol) {
    case 1:
      return 'admin';
    case 2:
      return 'cliente';
    case 3:
      return 'vendedor';
    case 4:
      return 'domiciliario';
    default:
      return 'cliente'; // Default a cliente
  }
}

/**
 * Convierte un string de rol a su ID numérico
 * @param rol - String del rol
 * @returns ID numérico del rol
 */
export function mapRolToId(rol: string): number {
  switch (rol) {
    case 'admin':
      return 1;
    case 'cliente':
      return 2;
    case 'vendedor':
      return 3;
    case 'domiciliario':
      return 4;
    default:
      return 2; // Default a cliente
  }
}

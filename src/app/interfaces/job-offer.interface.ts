export interface JobOffer {
  id: number;
  titulo: string;
  descripcion: string;
  requisitos?: string;
  tipo_puesto: string;
  salario?: number;
  estado: 'activa' | 'inactiva';
  fecha_publicacion: string; // ISO string
  negocio_id: number;
  created_at?: string;
  updated_at?: string;
}

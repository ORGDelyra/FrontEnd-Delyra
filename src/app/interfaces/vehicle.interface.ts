// Interface para la tabla vehicles
export interface Vehicle {
  id?: number;
  id_usuario: number;
  placa: string;
  tipo_vehiculo: string;
  seguro_vig: string; // Fecha en formato DATE
  run_vig: string; // Fecha en formato DATE
  created_at?: string;
  updated_at?: string;
}

// Interface para crear vehículo
export interface CreateVehicleRequest {
  placa: string;
  tipo_vehiculo: string;
  seguro_vig: string; // Formato: YYYY-MM-DD
  run_vig: string; // Formato: YYYY-MM-DD
}


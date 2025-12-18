export interface Bodega {
  id?: number;
  nombre: string;
  direccion: string;
  capacidad: number;
  estado: 'ACTIVO' | 'INACTIVO';
  fechaCreacion?: string;
  fechaActualizacion?: string;
}

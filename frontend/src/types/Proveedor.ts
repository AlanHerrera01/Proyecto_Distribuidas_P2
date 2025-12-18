export interface Proveedor {
  id?: number;
  nombre: string;
  nitRuc: string;
  contacto: string;
  email: string;
  telefono: string;
  direccion: string;
  estado: 'ACTIVO' | 'INACTIVO';
  observaciones?: string;
  fechaCreacion?: string;
  fechaActualizacion?: string;
}

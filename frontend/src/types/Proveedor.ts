export interface Proveedor {
  id?: number;
  nombre: string;
  nitRuc: string;
  contacto: string;
  email: string;
  telefono: string;
  direccion: string;
  estado: 'ACTIVO' | 'INACTIVO';
  fechaCreacion?: string;
  fechaActualizacion?: string;
}

export interface Producto {
  id?: number;
  nombre: string;
  sku: string;
  descripcion: string;
  precio: number;
  categoria: string;
  estado: 'ACTIVO' | 'INACTIVO';
  fechaCreacion?: string;
  fechaActualizacion?: string;
}

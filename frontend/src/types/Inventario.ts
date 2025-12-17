export interface Bodega {
  id?: number;
  nombre: string;
  direccion: string;
  capacidad: number;
  estado: 'ACTIVO' | 'INACTIVO';
  fechaCreacion?: string;
  fechaActualizacion?: string;
}

export interface Inventario {
  id?: number;
  productoId: number;
  bodegaId: number;
  cantidad: number;
  cantidadMinima: number;
  fechaCreacion?: string;
  fechaActualizacion?: string;
  
  // Campos adicionales para mostrar información relacionada
  producto?: {
    nombre: string;
    sku: string;
  };
  bodega?: {
    nombre: string;
  };
}

export type EstadoOrden = 'PENDIENTE' | 'EN_PROCESO' | 'COMPLETADA' | 'CANCELADA';

export interface DetalleOrden {
  id?: number;
  productoId: number;
  nombreProducto: string;
  cantidad: number;
  precioUnitario: number;
  descuento: number;
  subtotal: number;
}

export interface OrdenCompra {
  id?: number;
  proveedorId: number;
  numeroFactura: string;
  fechaEmision: string;
  fechaEntrega?: string;
  subtotal: number;
  iva: number;
  total: number;
  estado: EstadoOrden;
  observaciones?: string;
  fechaCreacion?: string;
  fechaActualizacion?: string;
  detalles?: DetalleOrden[];
  
  // Campos adicionales para mostrar información relacionada
  proveedor?: {
    nombre: string;
    nitRuc: string;
  };
}

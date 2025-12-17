import axios from 'axios';
import { OrdenCompra, DetalleOrden, EstadoOrden } from '../types';

const API_BASE_URL = 'http://localhost:8084/api/ordenes-compra';

export const ordenCompraService = {
  // === SERVICIOS DE ÓRDENES DE COMPRA ===

  // Obtener todas las órdenes
  getAll: async (): Promise<OrdenCompra[]> => {
    const response = await axios.get(`${API_BASE_URL}`);
    return response.data;
  },

  // Obtener orden por ID
  getById: async (id: number): Promise<OrdenCompra> => {
    const response = await axios.get(`${API_BASE_URL}/${id}`);
    return response.data;
  },

  // Crear nueva orden
  create: async (orden: Omit<OrdenCompra, 'id'>): Promise<OrdenCompra> => {
    const response = await axios.post(`${API_BASE_URL}`, orden);
    return response.data;
  },

  // Actualizar orden
  update: async (id: number, orden: Partial<OrdenCompra>): Promise<OrdenCompra> => {
    const response = await axios.put(`${API_BASE_URL}/${id}`, orden);
    return response.data;
  },

  // Eliminar orden
  delete: async (id: number): Promise<void> => {
    await axios.delete(`${API_BASE_URL}/${id}`);
  },

  // Buscar órdenes por estado
  findByEstado: async (estado: EstadoOrden): Promise<OrdenCompra[]> => {
    const response = await axios.get(`${API_BASE_URL}/estado/${estado}`);
    return response.data;
  },

  // Buscar órdenes por proveedor
  findByProveedor: async (proveedorId: number): Promise<OrdenCompra[]> => {
    const response = await axios.get(`${API_BASE_URL}/proveedor/${proveedorId}`);
    return response.data;
  },

  // Buscar órdenes por rango de fechas
  findByRangoFechas: async (fechaInicio: string, fechaFin: string): Promise<OrdenCompra[]> => {
    const response = await axios.get(`${API_BASE_URL}/rango-fechas`, {
      params: { fechaInicio, fechaFin }
    });
    return response.data;
  },

  // Buscar órdenes por número de factura
  findByNumeroFactura: async (numeroFactura: string): Promise<OrdenCompra[]> => {
    const response = await axios.get(`${API_BASE_URL}/factura`, {
      params: { numeroFactura }
    });
    return response.data;
  },

  // Cambiar estado de orden
  cambiarEstado: async (id: number, nuevoEstado: EstadoOrden): Promise<OrdenCompra> => {
    const response = await axios.put(`${API_BASE_URL}/${id}/estado`, null, {
      params: { nuevoEstado }
    });
    return response.data;
  },

  // Obtener órdenes pendientes
  getPendientes: async (): Promise<OrdenCompra[]> => {
    const response = await axios.get(`${API_BASE_URL}/pendientes`);
    return response.data;
  },

  // Obtener órdenes en proceso
  getEnProceso: async (): Promise<OrdenCompra[]> => {
    const response = await axios.get(`${API_BASE_URL}/en-proceso`);
    return response.data;
  },

  // Obtener órdenes completadas
  getCompletadas: async (): Promise<OrdenCompra[]> => {
    const response = await axios.get(`${API_BASE_URL}/completadas`);
    return response.data;
  },

  // Obtener órdenes canceladas
  getCanceladas: async (): Promise<OrdenCompra[]> => {
    const response = await axios.get(`${API_BASE_URL}/canceladas`);
    return response.data;
  },

  // === SERVICIOS DE DETALLES DE ORDEN ===

  // Agregar detalle a orden
  agregarDetalle: async (ordenId: number, detalle: Omit<DetalleOrden, 'id'>): Promise<DetalleOrden> => {
    const response = await axios.post(`${API_BASE_URL}/${ordenId}/detalles`, detalle);
    return response.data;
  },

  // Actualizar detalle de orden
  actualizarDetalle: async (ordenId: number, detalleId: number, detalle: Partial<DetalleOrden>): Promise<DetalleOrden> => {
    const response = await axios.put(`${API_BASE_URL}/${ordenId}/detalles/${detalleId}`, detalle);
    return response.data;
  },

  // Eliminar detalle de orden
  eliminarDetalle: async (ordenId: number, detalleId: number): Promise<void> => {
    await axios.delete(`${API_BASE_URL}/${ordenId}/detalles/${detalleId}`);
  },

  // === SERVICIOS DE ESTADÍSTICAS ===

  // Contar órdenes por estado
  contarPorEstado: async (estado: EstadoOrden): Promise<number> => {
    const response = await axios.get(`${API_BASE_URL}/estadisticas/contar-por-estado`, {
      params: { estado }
    });
    return response.data;
  },

  // Obtener total de compras por proveedor
  getTotalPorProveedor: async (proveedorId: number): Promise<number> => {
    const response = await axios.get(`${API_BASE_URL}/estadisticas/total-por-proveedor/${proveedorId}`);
    return response.data;
  },

  // Obtener total de compras por rango de fechas
  getTotalPorRangoFechas: async (fechaInicio: string, fechaFin: string): Promise<number> => {
    const response = await axios.get(`${API_BASE_URL}/estadisticas/total-por-rango-fechas`, {
      params: { fechaInicio, fechaFin }
    });
    return response.data;
  },

  // Obtener resumen de órdenes
  getResumen: async (): Promise<any> => {
    const response = await axios.get(`${API_BASE_URL}/resumen`);
    return response.data;
  },

  // === SERVICIOS DE VALIDACIÓN ===

  // Verificar si existe orden con número de factura
  existeConNumeroFactura: async (numeroFactura: string): Promise<boolean> => {
    const response = await axios.get(`${API_BASE_URL}/validar/numero-factura`, {
      params: { numeroFactura }
    });
    return response.data;
  },

  // Verificar si se puede cambiar estado
  puedeCambiarEstado: async (id: number, nuevoEstado: EstadoOrden): Promise<boolean> => {
    const response = await axios.get(`${API_BASE_URL}/${id}/validar/cambio-estado`, {
      params: { nuevoEstado }
    });
    return response.data;
  }
};

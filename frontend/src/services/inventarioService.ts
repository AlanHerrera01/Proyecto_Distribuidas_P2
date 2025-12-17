import axios from 'axios';
import { Inventario, Bodega } from '../types';

const INVENTARIO_API_URL = 'http://localhost:8083/api/inventario';
const BODEGA_API_URL = 'http://localhost:8083/api/bodegas';

export const inventarioService = {
  // === SERVICIOS DE INVENTARIO ===
  
  // Obtener todo el inventario
  getAll: async (): Promise<Inventario[]> => {
    const response = await axios.get(`${INVENTARIO_API_URL}`);
    return response.data;
  },

  // Obtener inventario por ID
  getById: async (id: number): Promise<Inventario> => {
    const response = await axios.get(`${INVENTARIO_API_URL}/${id}`);
    return response.data;
  },

  // Crear nuevo registro de inventario
  create: async (inventario: Omit<Inventario, 'id'>): Promise<Inventario> => {
    const response = await axios.post(`${INVENTARIO_API_URL}`, inventario);
    return response.data;
  },

  // Actualizar inventario
  update: async (id: number, inventario: Partial<Inventario>): Promise<Inventario> => {
    const response = await axios.put(`${INVENTARIO_API_URL}/${id}`, inventario);
    return response.data;
  },

  // Eliminar inventario
  delete: async (id: number): Promise<void> => {
    await axios.delete(`${INVENTARIO_API_URL}/${id}`);
  },

  // Buscar inventario por producto
  findByProducto: async (productoId: number): Promise<Inventario[]> => {
    const response = await axios.get(`${INVENTARIO_API_URL}/producto/${productoId}`);
    return response.data;
  },

  // Buscar inventario por bodega
  findByBodega: async (bodegaId: number): Promise<Inventario[]> => {
    const response = await axios.get(`${INVENTARIO_API_URL}/bodega/${bodegaId}`);
    return response.data;
  },

  // Obtener stock crítico
  getStockCritico: async (): Promise<Inventario[]> => {
    const response = await axios.get(`${INVENTARIO_API_URL}/stock-critico`);
    return response.data;
  },

  // Actualizar cantidad
  actualizarCantidad: async (id: number, cantidad: number): Promise<Inventario> => {
    const response = await axios.put(`${INVENTARIO_API_URL}/${id}/cantidad`, null, {
      params: { cantidad }
    });
    return response.data;
  },

  // === SERVICIOS DE BODEGAS ===

  // Obtener todas las bodegas
  getAllBodegas: async (): Promise<Bodega[]> => {
    const response = await axios.get(`${BODEGA_API_URL}`);
    return response.data;
  },

  // Obtener bodega por ID
  getBodegaById: async (id: number): Promise<Bodega> => {
    const response = await axios.get(`${BODEGA_API_URL}/${id}`);
    return response.data;
  },

  // Crear nueva bodega
  createBodega: async (bodega: Omit<Bodega, 'id'>): Promise<Bodega> => {
    const response = await axios.post(`${BODEGA_API_URL}`, bodega);
    return response.data;
  },

  // Actualizar bodega
  updateBodega: async (id: number, bodega: Partial<Bodega>): Promise<Bodega> => {
    const response = await axios.put(`${BODEGA_API_URL}/${id}`, bodega);
    return response.data;
  },

  // Eliminar bodega
  deleteBodega: async (id: number): Promise<void> => {
    await axios.delete(`${BODEGA_API_URL}/${id}`);
  },

  // Buscar bodegas por estado
  findBodegasByEstado: async (estado: string): Promise<Bodega[]> => {
    const response = await axios.get(`${BODEGA_API_URL}/estado/${estado}`);
    return response.data;
  },

  // Buscar bodegas por nombre
  findBodegasByNombre: async (nombre: string): Promise<Bodega[]> => {
    const response = await axios.get(`${BODEGA_API_URL}/nombre`, {
      params: { nombre }
    });
    return response.data;
  },

  // Cambiar estado de bodega
  cambiarEstadoBodega: async (id: number, estado: string): Promise<Bodega> => {
    const response = await axios.put(`${BODEGA_API_URL}/${id}/estado`, null, {
      params: { estado }
    });
    return response.data;
  }
};

import axios from 'axios';
import { Bodega } from '../types';

const API_BASE_URL = `${process.env.REACT_APP_BODEGAS_API_URL || 'http://localhost:8085/api'}/bodegas`;

export const bodegaService = {
  // Obtener todas las bodegas
  getAll: async (): Promise<Bodega[]> => {
    const response = await axios.get(`${API_BASE_URL}`);
    return response.data;
  },

  // Obtener una bodega por ID
  getById: async (id: number): Promise<Bodega> => {
    const response = await axios.get(`${API_BASE_URL}/${id}`);
    return response.data;
  },

  // Crear una nueva bodega
  create: async (bodega: Omit<Bodega, 'id'>): Promise<Bodega> => {
    const response = await axios.post(`${API_BASE_URL}`, bodega);
    return response.data;
  },

  // Actualizar una bodega existente
  update: async (id: number, bodega: Partial<Bodega>): Promise<Bodega> => {
    const response = await axios.put(`${API_BASE_URL}/${id}`, bodega);
    return response.data;
  },

  // Eliminar una bodega
  delete: async (id: number): Promise<void> => {
    await axios.delete(`${API_BASE_URL}/${id}`);
  },

  // Buscar bodegas por estado
  findByEstado: async (estado: string): Promise<Bodega[]> => {
    const response = await axios.get(`${API_BASE_URL}/estado/${estado}`);
    return response.data;
  },

  // Buscar bodegas por nombre
  findByNombre: async (nombre: string): Promise<Bodega[]> => {
    const response = await axios.get(`${API_BASE_URL}/nombre`, {
      params: { nombre }
    });
    return response.data;
  },

  // Cambiar estado de una bodega
  cambiarEstado: async (id: number, estado: string): Promise<Bodega> => {
    const response = await axios.put(`${API_BASE_URL}/${id}/estado`, null, {
      params: { estado }
    });
    return response.data;
  }
};

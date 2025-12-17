import axios from 'axios';
import { Proveedor } from '../types';

const API_BASE_URL = 'http://localhost:8082/api/proveedores';

export const proveedorService = {
  // Obtener todos los proveedores
  getAll: async (): Promise<Proveedor[]> => {
    const response = await axios.get(`${API_BASE_URL}`);
    return response.data;
  },

  // Obtener un proveedor por ID
  getById: async (id: number): Promise<Proveedor> => {
    const response = await axios.get(`${API_BASE_URL}/${id}`);
    return response.data;
  },

  // Crear un nuevo proveedor
  create: async (proveedor: Omit<Proveedor, 'id'>): Promise<Proveedor> => {
    const response = await axios.post(`${API_BASE_URL}`, proveedor);
    return response.data;
  },

  // Actualizar un proveedor existente
  update: async (id: number, proveedor: Partial<Proveedor>): Promise<Proveedor> => {
    const response = await axios.put(`${API_BASE_URL}/${id}`, proveedor);
    return response.data;
  },

  // Eliminar un proveedor
  delete: async (id: number): Promise<void> => {
    await axios.delete(`${API_BASE_URL}/${id}`);
  },

  // Buscar proveedores por NIT/RUC
  findByNitRuc: async (nitRuc: string): Promise<Proveedor[]> => {
    const response = await axios.get(`${API_BASE_URL}/nit/${nitRuc}`);
    return response.data;
  },

  // Buscar proveedores por email
  findByEmail: async (email: string): Promise<Proveedor[]> => {
    const response = await axios.get(`${API_BASE_URL}/email/${email}`);
    return response.data;
  },

  // Buscar proveedores por estado
  findByEstado: async (estado: string): Promise<Proveedor[]> => {
    const response = await axios.get(`${API_BASE_URL}/estado/${estado}`);
    return response.data;
  },

  // Buscar proveedores por nombre
  findByNombre: async (nombre: string): Promise<Proveedor[]> => {
    const response = await axios.get(`${API_BASE_URL}/nombre`, {
      params: { nombre }
    });
    return response.data;
  },

  // Cambiar estado de un proveedor
  cambiarEstado: async (id: number, estado: string): Promise<Proveedor> => {
    const response = await axios.put(`${API_BASE_URL}/${id}/estado`, null, {
      params: { estado }
    });
    return response.data;
  }
};

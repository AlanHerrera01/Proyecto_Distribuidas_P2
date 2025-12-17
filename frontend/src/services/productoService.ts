import axios from 'axios';
import { Producto } from '../types';

const API_BASE_URL = 'http://localhost:8081/api/productos';

export const productoService = {
  // Obtener todos los productos
  getAll: async (): Promise<Producto[]> => {
    const response = await axios.get(`${API_BASE_URL}`);
    return response.data;
  },

  // Obtener un producto por ID
  getById: async (id: number): Promise<Producto> => {
    const response = await axios.get(`${API_BASE_URL}/${id}`);
    return response.data;
  },

  // Crear un nuevo producto
  create: async (producto: Omit<Producto, 'id'>): Promise<Producto> => {
    const response = await axios.post(`${API_BASE_URL}`, producto);
    return response.data;
  },

  // Actualizar un producto existente
  update: async (id: number, producto: Partial<Producto>): Promise<Producto> => {
    const response = await axios.put(`${API_BASE_URL}/${id}`, producto);
    return response.data;
  },

  // Eliminar un producto
  delete: async (id: number): Promise<void> => {
    await axios.delete(`${API_BASE_URL}/${id}`);
  },

  // Buscar productos por SKU
  findBySku: async (sku: string): Promise<Producto[]> => {
    const response = await axios.get(`${API_BASE_URL}/sku/${sku}`);
    return response.data;
  },

  // Buscar productos por categoría
  findByCategoria: async (categoria: string): Promise<Producto[]> => {
    const response = await axios.get(`${API_BASE_URL}/categoria/${categoria}`);
    return response.data;
  },

  // Buscar productos por estado
  findByEstado: async (estado: string): Promise<Producto[]> => {
    const response = await axios.get(`${API_BASE_URL}/estado/${estado}`);
    return response.data;
  },

  // Buscar productos por nombre
  findByNombre: async (nombre: string): Promise<Producto[]> => {
    const response = await axios.get(`${API_BASE_URL}/nombre`, {
      params: { nombre }
    });
    return response.data;
  },

  // Cambiar estado de un producto
  cambiarEstado: async (id: number, estado: string): Promise<Producto> => {
    const response = await axios.put(`${API_BASE_URL}/${id}/estado`, null, {
      params: { estado }
    });
    return response.data;
  }
};

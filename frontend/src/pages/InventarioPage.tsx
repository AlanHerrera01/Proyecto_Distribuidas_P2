import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Paper,
  Chip,
  Alert,
  Snackbar,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import { productoService } from '../services';
import { Producto } from '../types';
import {
  DataGrid,
  GridColDef,
  GridActionsCellItem,
} from '@mui/x-data-grid';
import {
  Add,
  Edit,
  Delete,
  Warning,
} from '@mui/icons-material';
import { Inventario, Bodega } from '../types';
import { inventarioService } from '../services';

const InventarioPage: React.FC = () => {
  const [inventarios, setInventarios] = useState<Inventario[]>([]);
  const [bodegas, setBodegas] = useState<Bodega[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingInventario, setEditingInventario] = useState<Inventario | null>(null);
  const [formData, setFormData] = useState<Partial<Inventario>>({
    productoId: undefined,
    bodegaId: undefined,
    cantidad: undefined,
    cantidadMinima: 10,
  });
  const [productoSku, setProductoSku] = useState<string>('');
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // Optimizar carga de inventario con useCallback
  const loadInventarios = useCallback(async () => {
    try {
      console.log('Cargando inventarios desde:', `${process.env.REACT_APP_INVENTARIO_API_URL || 'http://localhost:8082/api'}/inventario`);
      const data = await inventarioService.getAll();
      console.log('Datos recibidos del backend:', data);
      // Asegurar que los datos sean un array
      const inventariosArray = Array.isArray(data) ? data : [];
      console.log('Array de inventarios procesado:', inventariosArray);
      setInventarios(inventariosArray);
    } catch (error) {
      console.error('Error loading inventarios:', error);
      setInventarios([]); // Establecer array vacío en caso de error
      showSnackbar('Error al cargar inventario', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadBodegas = useCallback(async () => {
    try {
      const data = await inventarioService.getAllBodegas();
      console.log('Bodegas cargadas:', data);
      setBodegas(data);
    } catch (error) {
      console.error('Error loading bodegas:', error);
    }
  }, []);

  useEffect(() => {
    loadInventarios();
    loadBodegas();
    // Cargar productos para el selector de SKU
    const fetchProductos = async () => {
      try {
        const data = await productoService.getAll();
        console.log('Productos cargados:', data);
        setProductos(data);
      } catch (error) {
        console.error('Error loading productos:', error);
      }
    };
    fetchProductos();
  }, [loadInventarios, loadBodegas]);

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'warning') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleOpenDialog = () => {
    setFormData({
      productoId: undefined,
      bodegaId: undefined,
      cantidad: 0,
      cantidadMinima: 10,
    });
    setProductoSku('');
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingInventario(null);
    setFormData({});
    setProductoSku('');
  };

  const handleEdit = (inventario: Inventario) => {
    setEditingInventario(inventario);
    setFormData({
      productoId: inventario.productoId,
      bodegaId: inventario.bodegaId,
      cantidad: inventario.cantidad,
      cantidadMinima: inventario.cantidadMinima,
    });
    // Buscar el producto por ID para obtener el SKU
    const producto = productos.find(p => p.id === inventario.productoId);
    setProductoSku(producto?.sku || '');
    setOpenDialog(true);
  };

  const handleDelete = async (inventario: Inventario) => {
    if (!window.confirm('¿Está seguro de que desea eliminar este registro de inventario?')) {
      return;
    }

    try {
      await inventarioService.delete(inventario.id!);
      showSnackbar('Inventario eliminado exitosamente', 'success');
      loadInventarios();
    } catch (error: any) {
      console.error('Error deleting inventario:', error);
      showSnackbar('Error al eliminar inventario', 'error');
    }
  };

  const handleSave = async () => {
    // Validar campos requeridos
    if (!productoSku || !formData.bodegaId) {
      showSnackbar('SKU de Producto y Bodega son obligatorios', 'error');
      return;
    }

    // Buscar el producto por SKU
    const productoSeleccionado = productos.find(p => p.sku === productoSku);
    if (!productoSeleccionado) {
      showSnackbar('Producto no encontrado para el SKU seleccionado', 'error');
      return;
    }

    if (formData.cantidad === undefined || formData.cantidad < 0) {
      showSnackbar('La cantidad debe ser mayor o igual a 0', 'error');
      return;
    }

    try {
      const inventarioData = {
        productoId: productoSeleccionado.id,
        bodegaId: formData.bodegaId,
        cantidad: formData.cantidad,
        cantidadMinima: formData.cantidadMinima || 10,
      };

      if (editingInventario) {
        // Editar inventario existente
        await inventarioService.update(editingInventario.id!, inventarioData);
        showSnackbar('Inventario actualizado exitosamente', 'success');
      } else {
        // Crear nuevo inventario
        await inventarioService.create(inventarioData as Omit<Inventario, 'id'>);
        showSnackbar('Inventario creado exitosamente', 'success');
      }
      
      handleCloseDialog();
      
      // Esperar un momento y recargar
      setTimeout(async () => {
        await loadInventarios();
      }, 500);
      
    } catch (error: any) {
      console.error('Error completo al crear inventario:', error);
      let message = 'Error al guardar inventario';
      if (error.response) {
        console.error('Error response:', error.response.data);
        if (error.response.status === 409) {
          message = 'Ya existe un registro de inventario para este producto y bodega.';
        } else if (error.response.status === 404) {
          message = 'Producto o Bodega no encontrados.';
        } else if (error.response.status === 400) {
          message = error.response.data?.message || 'Datos inválidos.';
        } else if (error.response.data) {
          message = error.response.data.message || error.response.data;
        }
      } else if (error.message) {
        message = error.message;
      }
      showSnackbar(message, 'error');
    }
  };

  // const handleUpdateStock = async (id: number, cantidad: number) => {
  //   try {
  //     // Método updateStock no existe, comentado por ahora
  //     // await inventarioService.updateStock(id, cantidad);
  //     showSnackbar('Función de actualización de stock no implementada', 'warning');
  //     loadInventarios();
  //   } catch (error: any) {
  //     let message = 'Error al actualizar stock';
  //     if (error.response?.data?.message) {
  //       message = error.response.data.message;
  //     }
  //     showSnackbar(message, 'error');
  //   }
  // };

  const getStockStatus = (cantidad: number, cantidadMinima: number) => {
    if (cantidad <= cantidadMinima) {
      return { label: 'Crítico', color: 'error' as const };
    } else if (cantidad <= cantidadMinima * 2) {
      return { label: 'Bajo', color: 'warning' as const };
    }
    return { label: 'Normal', color: 'success' as const };
  };

  const columns: GridColDef[] = [
    // { field: 'id', headerName: 'ID', width: 70 }, // Ocultamos el ID
    { 
      field: 'productoNombre', 
      headerName: 'Producto', 
      width: 200,
      renderCell: (params: any) => {
        // Validar que params y params.row existan
        if (!params || !params.row) {
          return 'N/A';
        }
        
        // Usar directamente el objeto producto si existe
        if (params.row.producto && params.row.producto.nombre) {
          return `${params.row.producto.nombre} (${params.row.producto.sku})`;
        }
        
        // Fallback: buscar por ID
        if (params.row.productoId && productos.length > 0) {
          const producto = productos.find(p => p.id && p.id.toString() === params.row.productoId.toString());
          if (producto) {
            return `${producto.nombre} (${producto.sku})`;
          }
        }
        
        return `Producto ID: ${params.row.productoId || 'N/A'}`;
      }
    },
    { 
      field: 'bodegaNombre', 
      headerName: 'Bodega', 
      width: 150,
      renderCell: (params: any) => {
        // Validar que params y params.row existan
        if (!params || !params.row) {
          return 'N/A';
        }
        
        // Usar directamente el objeto bodega si existe
        if (params.row.bodega && params.row.bodega.nombre) {
          return params.row.bodega.nombre;
        }
        
        // Fallback: buscar por ID
        if (params.row.bodegaId && bodegas.length > 0) {
          const bodega = bodegas.find(b => b.id && b.id.toString() === params.row.bodegaId.toString());
          if (bodega) {
            return bodega.nombre;
          }
        }
        
        return `Bodega ID: ${params.row.bodegaId || 'N/A'}`;
      }
    },
    {
      field: 'cantidad',
      headerName: 'Stock Actual',
      width: 120,
      type: 'number',
      renderCell: (params) => {
        const cantidad = params.row.cantidad as number;
        const cantidadMinima = params.row.cantidadMinima as number;
        // const status = getStockStatus(cantidad, cantidadMinima);
        
        return (
          <Box display="flex" alignItems="center" gap={1}>
            <Typography>{cantidad}</Typography>
            {cantidad <= cantidadMinima && <Warning color="error" fontSize="small" />}
          </Box>
        );
      },
    },
    {
      field: 'cantidadMinima',
      headerName: 'Stock Mínimo',
      width: 120,
      type: 'number',
    },
    {
      field: 'estado',
      headerName: 'Estado',
      width: 100,
      renderCell: (params) => {
        const cantidad = params.row.cantidad as number;
        const cantidadMinima = params.row.cantidadMinima as number;
        const status = getStockStatus(cantidad, cantidadMinima);
        
        return (
          <Chip
            label={status.label}
            color={status.color}
            size="small"
          />
        );
      },
    },
    {
      field: 'ultimaActualizacion',
      headerName: 'Última Actualización',
      width: 180,
      type: 'dateTime',
      valueFormatter: (params) => {
        if (!params) return 'N/A';
        try {
          const date = new Date(params);
          if (isNaN(date.getTime())) return 'N/A';
          return date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          });
        } catch {
          return 'N/A';
        }
      },
    },
    {
      field: 'actions',
      headerName: 'Acciones',
      type: 'actions',
      width: 100,
      getActions: (params) => [
        <GridActionsCellItem
          key="edit"
          icon={<Edit />}
          label="Editar"
          onClick={() => handleEdit(params.row)}
          showInMenu
        />,
        <GridActionsCellItem
          key="delete"
          icon={<Delete />}
          label="Eliminar"
          onClick={() => handleDelete(params.row)}
          showInMenu
        />,
      ],
    },
  ];

  // Filtrar inventarios con stock crítico
  const stockCritico = Array.isArray(inventarios) ? inventarios.filter(inv => inv.cantidad <= inv.cantidadMinima) : [];

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  console.log('Datos pasados al DataGrid:', inventarios);
  console.log('Estructura de un inventario ejemplo:', inventarios.length > 0 ? inventarios[0] : 'No hay datos');

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Inventario</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleOpenDialog}
        >
          Nuevo Movimiento
        </Button>
      </Box>

      {/* Alertas de stock crítico */}
      {stockCritico.length > 0 && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          ¡Atención! Hay {stockCritico.length} productos con stock crítico
        </Alert>
      )}

      <Paper sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={inventarios}
          columns={columns}
          getRowId={(row) => row.id}
          paginationModel={{ pageSize: 10, page: 0 }}
          pageSizeOptions={[10, 25, 50]}
          disableRowSelectionOnClick
        />
      </Paper>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingInventario ? 'Editar Registro de Inventario' : 'Nuevo Registro de Inventario'}</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2, mt: 1 }}>
            {editingInventario ? 'Modifica los datos del registro de inventario existente.' : 'Crea un nuevo registro de inventario para un producto en una bodega específica.'}
          </Alert>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControl fullWidth required>
              <InputLabel>SKU Producto</InputLabel>
              <Select
                value={productoSku}
                onChange={(e) => setProductoSku(e.target.value)}
                label="SKU Producto"
              >
                {productos.length === 0 ? (
                  <MenuItem value="" disabled>
                    No hay productos disponibles
                  </MenuItem>
                ) : (
                  productos.map((producto) => (
                    <MenuItem key={producto.sku} value={producto.sku}>
                      {producto.sku} - {producto.nombre}
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>
            <FormControl fullWidth required>
              <InputLabel>Bodega</InputLabel>
              <Select
                value={formData.bodegaId?.toString() || ''}
                onChange={(e) => setFormData({ ...formData, bodegaId: parseInt(e.target.value) || undefined })}
                label="Bodega"
              >
                {bodegas.length === 0 ? (
                  <MenuItem value="" disabled>
                    No hay bodegas disponibles
                  </MenuItem>
                ) : (
                  bodegas.map((bodega) => (
                    <MenuItem key={bodega.id} value={bodega.id}>
                      {bodega.nombre} - {bodega.direccion}
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Cantidad Inicial"
              type="number"
              value={formData.cantidad ?? ''}
              onChange={(e) => setFormData({ ...formData, cantidad: parseInt(e.target.value) || 0 })}
              placeholder="0"
              required
              helperText="Cantidad inicial de productos en inventario"
              inputProps={{ min: 0 }}
            />
            <TextField
              fullWidth
              label="Stock Mínimo (Alerta)"
              type="number"
              value={formData.cantidadMinima ?? 10}
              onChange={(e) => setFormData({ ...formData, cantidadMinima: parseInt(e.target.value) || 10 })}
              placeholder="10"
              helperText="Cantidad mínima antes de mostrar alerta de stock bajo"
              inputProps={{ min: 0 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleSave} variant="contained">
            Crear
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default InventarioPage;

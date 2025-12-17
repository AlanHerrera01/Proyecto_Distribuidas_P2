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
} from '@mui/material';
import {
  DataGrid,
  GridColDef,
  GridActionsCellItem,
} from '@mui/x-data-grid';
import {
  Add,
  Edit,
  Delete,
} from '@mui/icons-material';
import { Producto } from '../types';
import { productoService } from '../services';

const ProductosPage: React.FC = () => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingProducto, setEditingProducto] = useState<Producto | null>(null);
  const [formData, setFormData] = useState<Partial<Producto>>({
    nombre: '',
    sku: '',
    descripcion: '',
    precio: 0,
    categoria: '',
    estado: 'ACTIVO',
  });
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // Optimizar carga de productos con useCallback
  const loadProductos = useCallback(async () => {
    try {
      const data = await productoService.getAll();
      setProductos(data);
    } catch (error) {
      console.error('Error loading productos:', error);
      showSnackbar('Error al cargar productos', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProductos();
  }, [loadProductos]);

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleOpenDialog = (producto?: Producto) => {
    if (producto) {
      setEditingProducto(producto);
      setFormData(producto);
    } else {
      setEditingProducto(null);
      setFormData({
        nombre: '',
        sku: '',
        descripcion: '',
        precio: 0,
        categoria: '',
        estado: 'ACTIVO',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingProducto(null);
    setFormData({});
  };

  const handleSave = async () => {
    try {
      if (editingProducto) {
        await productoService.update(editingProducto.id!, formData);
        showSnackbar('Producto actualizado exitosamente', 'success');
      } else {
        await productoService.create(formData as Omit<Producto, 'id'>);
        showSnackbar('Producto creado exitosamente', 'success');
      }
      handleCloseDialog();
      loadProductos();
    } catch (error) {
      console.error('Error saving producto:', error);
      showSnackbar('Error al guardar producto', 'error');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Está seguro que desea eliminar este producto?')) {
      try {
        await productoService.delete(id);
        showSnackbar('Producto eliminado exitosamente', 'success');
        loadProductos();
      } catch (error) {
        console.error('Error deleting producto:', error);
        showSnackbar('Error al eliminar producto', 'error');
      }
    }
  };

  const handleChangeEstado = async (id: number, estado: string) => {
    try {
      await productoService.cambiarEstado(id, estado);
      showSnackbar('Estado actualizado exitosamente', 'success');
      loadProductos();
    } catch (error) {
      console.error('Error changing estado:', error);
      showSnackbar('Error al cambiar estado', 'error');
    }
  };

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'sku', headerName: 'SKU', width: 120 },
    { field: 'nombre', headerName: 'Nombre', width: 200 },
    { field: 'categoria', headerName: 'Categoría', width: 120 },
    {
      field: 'precio',
      headerName: 'Precio',
      width: 100,
      type: 'number',
      valueFormatter: (params: any) => {
        const value = params.value as number;
        return value ? `$${value.toFixed(2)}` : '$0.00';
      },
    },
    {
      field: 'estado',
      headerName: 'Estado',
      width: 120,
      renderCell: (params) => {
        const estado = params.row.estado as string;
        return (
          <Chip
            label={estado}
            color={estado === 'ACTIVO' ? 'success' : 'default'}
            size="small"
            onClick={() => {
              const nuevoEstado = estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';
              handleChangeEstado(params.row.id, nuevoEstado);
            }}
            style={{ cursor: 'pointer' }}
          />
        );
      },
    },
    {
      field: 'actions',
      headerName: 'Acciones',
      width: 120,
      type: 'actions',
      getActions: (params) => [
        <GridActionsCellItem
          icon={<Edit />}
          label="Editar"
          onClick={() => handleOpenDialog(params.row)}
        />,
        <GridActionsCellItem
          icon={<Delete />}
          label="Eliminar"
          onClick={() => handleDelete(params.row.id)}
        />,
      ],
    },
  ];

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Productos</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
        >
          Nuevo Producto
        </Button>
      </Box>

      <Paper sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={productos}
          columns={columns}
          paginationModel={{ pageSize: 10, page: 0 }}
          pageSizeOptions={[10, 25, 50]}
          disableRowSelectionOnClick
        />
      </Paper>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingProducto ? 'Editar Producto' : 'Nuevo Producto'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
              <TextField
                fullWidth
                label="Nombre"
                value={formData.nombre || ''}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              />
              <TextField
                fullWidth
                label="SKU"
                value={formData.sku || ''}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
              />
            </Box>
            <TextField
              fullWidth
              label="Descripción"
              multiline
              rows={3}
              value={formData.descripcion || ''}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
            />
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
              <TextField
                fullWidth
                label="Categoría"
                value={formData.categoria || ''}
                onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
              />
              <TextField
                fullWidth
                label="Precio"
                type="number"
                value={formData.precio || ''}
                onChange={(e) => setFormData({ ...formData, precio: parseFloat(e.target.value) || 0 })}
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleSave} variant="contained">
            {editingProducto ? 'Actualizar' : 'Crear'}
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

export default ProductosPage;

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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
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
  Remove,
} from '@mui/icons-material';
import { OrdenCompra, DetalleOrden, Proveedor, Producto } from '../types';
import { ordenCompraService, proveedorService } from '../services';

const OrdenesCompraPage: React.FC = () => {
  const [ordenes, setOrdenes] = useState<OrdenCompra[]>([]);
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDetalleDialog, setOpenDetalleDialog] = useState(false);
  const [editingOrden, setEditingOrden] = useState<OrdenCompra | null>(null);
  const [selectedOrden, setSelectedOrden] = useState<OrdenCompra | null>(null);
  const [formData, setFormData] = useState<Partial<OrdenCompra>>({
    proveedorId: 0,
    total: 0,
    estado: 'PENDIENTE',
  });
  const [detalleForm, setDetalleForm] = useState<Partial<DetalleOrden>>({
    productoId: 0,
    cantidad: 1,
    precioUnitario: 0,
  });
  const [detalles, setDetalles] = useState<Partial<DetalleOrden>[]>([]);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // Optimizar carga de órdenes con useCallback
  const loadOrdenes = useCallback(async () => {
    try {
      const data = await ordenCompraService.getAll();
      setOrdenes(data);
    } catch (error) {
      console.error('Error loading ordenes:', error);
      showSnackbar('Error al cargar órdenes', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadProveedores = useCallback(async () => {
    try {
      const data = await proveedorService.getAll();
      setProveedores(data);
    } catch (error) {
      console.error('Error loading proveedores:', error);
    }
  }, []);

  useEffect(() => {
    loadOrdenes();
    loadProveedores();
  }, [loadOrdenes, loadProveedores]);

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'warning') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleOpenDialog = (orden?: OrdenCompra) => {
    if (orden) {
      setEditingOrden(orden);
      setFormData(orden);
      setDetalles(orden.detalles || []);
    } else {
      setEditingOrden(null);
      setFormData({
        proveedorId: 0,
        total: 0,
        estado: 'PENDIENTE',
      });
      setDetalles([]);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingOrden(null);
    setFormData({});
    setDetalles([]);
  };

  const handleSave = async () => {
    try {
      const ordenData = {
        ...formData,
        detalles: detalles as DetalleOrden[],
      };

      if (editingOrden) {
        await ordenCompraService.update(editingOrden.id!, ordenData);
        showSnackbar('Orden actualizada exitosamente', 'success');
      } else {
        await ordenCompraService.create(ordenData as Omit<OrdenCompra, 'id'>);
        showSnackbar('Orden creada exitosamente', 'success');
      }
      handleCloseDialog();
      loadOrdenes();
    } catch (error) {
      console.error('Error saving orden:', error);
      showSnackbar('Error al guardar orden', 'error');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Está seguro que desea eliminar esta orden?')) {
      try {
        await ordenCompraService.delete(id);
        showSnackbar('Orden eliminada exitosamente', 'success');
        loadOrdenes();
      } catch (error) {
        console.error('Error deleting orden:', error);
        showSnackbar('Error al eliminar orden', 'error');
      }
    }
  };

  const handleCambiarEstado = async (id: number, estado: string) => {
    try {
      // Convertir string al tipo EstadoOrden esperado
      await ordenCompraService.cambiarEstado(id, estado as any);
      showSnackbar('Estado actualizado exitosamente', 'success');
      loadOrdenes();
    } catch (error) {
      console.error('Error changing estado:', error);
      showSnackbar('Error al cambiar estado', 'error');
    }
  };

  const handleAddDetalle = () => {
    if (detalleForm.productoId && detalleForm.cantidad && detalleForm.precioUnitario) {
      const subtotal = (detalleForm.cantidad || 0) * (detalleForm.precioUnitario || 0);
      const nuevoDetalle = {
        ...detalleForm,
        subtotal,
      };
      setDetalles([...detalles, nuevoDetalle]);
      
      // Actualizar total
      const nuevoTotal = (formData.total || 0) + subtotal;
      setFormData({ ...formData, total: nuevoTotal });
      
      // Limpiar formulario de detalle
      setDetalleForm({
        productoId: 0,
        cantidad: 1,
        precioUnitario: 0,
      });
    }
  };

  const handleRemoveDetalle = (index: number) => {
    const detalle = detalles[index];
    const subtotal = (detalle.cantidad || 0) * (detalle.precioUnitario || 0);
    
    const nuevosDetalles = detalles.filter((_, i) => i !== index);
    setDetalles(nuevosDetalles);
    
    // Actualizar total
    const nuevoTotal = (formData.total || 0) - subtotal;
    setFormData({ ...formData, total: Math.max(0, nuevoTotal) });
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'APROBADA': return 'success';
      case 'RECHAZADA': return 'error';
      case 'PENDIENTE': return 'warning';
      default: return 'default';
    }
  };

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'proveedorNombre', headerName: 'Proveedor', width: 200 },
    {
      field: 'fechaOrden',
      headerName: 'Fecha Orden',
      width: 150,
      type: 'date',
    },
    {
      field: 'total',
      headerName: 'Total',
      width: 120,
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
            color={getEstadoColor(estado) as any}
            size="small"
            onClick={() => {
              const nuevosEstados = ['PENDIENTE', 'APROBADA', 'RECHAZADA'];
              const currentIndex = nuevosEstados.indexOf(estado);
              const nuevoEstado = nuevosEstados[(currentIndex + 1) % nuevosEstados.length];
              handleCambiarEstado(params.row.id, nuevoEstado);
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
        <Typography variant="h4">Órdenes de Compra</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
        >
          Nueva Orden
        </Button>
      </Box>

      <Paper sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={ordenes}
          columns={columns}
          paginationModel={{ pageSize: 10, page: 0 }}
          pageSizeOptions={[10, 25, 50]}
          disableRowSelectionOnClick
        />
      </Paper>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="lg" fullWidth>
        <DialogTitle>
          {editingOrden ? 'Editar Orden de Compra' : 'Nueva Orden de Compra'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Proveedor</InputLabel>
                <Select
                  value={formData.proveedorId?.toString() || ''}
                  onChange={(e) => setFormData({ ...formData, proveedorId: parseInt(e.target.value) || 0 })}
                >
                  {proveedores.map((proveedor) => (
                    <MenuItem key={proveedor.id} value={proveedor.id}>
                      {proveedor.nombre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="Total"
                type="number"
                value={formData.total || ''}
                InputProps={{ readOnly: true }}
              />
            </Box>

            <Typography variant="h6">Detalles de la Orden</Typography>
            
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
              <TextField
                fullWidth
                label="ID Producto"
                type="number"
                value={detalleForm.productoId || ''}
                onChange={(e) => setDetalleForm({ ...detalleForm, productoId: parseInt(e.target.value) || 0 })}
              />
              <TextField
                fullWidth
                label="Cantidad"
                type="number"
                value={detalleForm.cantidad || ''}
                onChange={(e) => setDetalleForm({ ...detalleForm, cantidad: parseInt(e.target.value) || 0 })}
              />
              <TextField
                fullWidth
                label="Precio Unitario"
                type="number"
                value={detalleForm.precioUnitario || ''}
                onChange={(e) => setDetalleForm({ ...detalleForm, precioUnitario: parseFloat(e.target.value) || 0 })}
              />
              <Button onClick={handleAddDetalle} variant="contained">
                <Add />
              </Button>
            </Box>

            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>ID Producto</TableCell>
                    <TableCell>Cantidad</TableCell>
                    <TableCell>Precio Unitario</TableCell>
                    <TableCell>Subtotal</TableCell>
                    <TableCell>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {detalles.map((detalle, index) => (
                    <TableRow key={index}>
                      <TableCell>{detalle.productoId}</TableCell>
                      <TableCell>{detalle.cantidad}</TableCell>
                      <TableCell>${(detalle.precioUnitario || 0).toFixed(2)}</TableCell>
                      <TableCell>
                        ${((detalle.cantidad || 0) * (detalle.precioUnitario || 0)).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <IconButton onClick={() => handleRemoveDetalle(index)}>
                          <Remove />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleSave} variant="contained">
            {editingOrden ? 'Actualizar' : 'Crear'}
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

export default OrdenesCompraPage;

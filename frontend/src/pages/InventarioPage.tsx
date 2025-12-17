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
import {
  DataGrid,
  GridColDef,
} from '@mui/x-data-grid';
import {
  Add,
  Warning,
} from '@mui/icons-material';
import { Inventario, Bodega } from '../types';
import { inventarioService } from '../services';

const InventarioPage: React.FC = () => {
  const [inventarios, setInventarios] = useState<Inventario[]>([]);
  const [bodegas, setBodegas] = useState<Bodega[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState<Partial<Inventario>>({
    productoId: 0,
    bodegaId: 0,
    cantidad: 0,
    cantidadMinima: 10,
  });
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
      const data = await inventarioService.getAll();
      setInventarios(data);
    } catch (error) {
      console.error('Error loading inventarios:', error);
      showSnackbar('Error al cargar inventario', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadBodegas = useCallback(async () => {
    try {
      const data = await inventarioService.getAllBodegas();
      setBodegas(data);
    } catch (error) {
      console.error('Error loading bodegas:', error);
    }
  }, []);

  useEffect(() => {
    loadInventarios();
    loadBodegas();
  }, [loadInventarios, loadBodegas]);

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'warning') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleOpenDialog = () => {
    setFormData({
      productoId: 0,
      bodegaId: 0,
      cantidad: 0,
      cantidadMinima: 10,
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormData({});
  };

  const handleSave = async () => {
    try {
      await inventarioService.create(formData as Omit<Inventario, 'id'>);
      showSnackbar('Inventario creado exitosamente', 'success');
      handleCloseDialog();
      loadInventarios();
    } catch (error) {
      console.error('Error saving inventario:', error);
      showSnackbar('Error al guardar inventario', 'error');
    }
  };

  const handleUpdateStock = async (id: number, cantidad: number) => {
    try {
      // Método updateStock no existe, comentado por ahora
      // await inventarioService.updateStock(id, cantidad);
      showSnackbar('Función de actualización de stock no implementada', 'warning');
      loadInventarios();
    } catch (error) {
      console.error('Error updating stock:', error);
      showSnackbar('Error al actualizar stock', 'error');
    }
  };

  const getStockStatus = (cantidad: number, cantidadMinima: number) => {
    if (cantidad <= cantidadMinima) {
      return { label: 'Crítico', color: 'error' as const };
    } else if (cantidad <= cantidadMinima * 2) {
      return { label: 'Bajo', color: 'warning' as const };
    }
    return { label: 'Normal', color: 'success' as const };
  };

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'productoNombre', headerName: 'Producto', width: 200 },
    { field: 'bodegaNombre', headerName: 'Bodega', width: 150 },
    {
      field: 'cantidad',
      headerName: 'Stock Actual',
      width: 120,
      type: 'number',
      renderCell: (params) => {
        const cantidad = params.row.cantidad as number;
        const cantidadMinima = params.row.cantidadMinima as number;
        const status = getStockStatus(cantidad, cantidadMinima);
        
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
      field: 'fechaActualizacion',
      headerName: 'Última Actualización',
      width: 180,
      type: 'dateTime',
    },
  ];

  // Filtrar inventarios con stock crítico
  const stockCritico = inventarios.filter(inv => inv.cantidad <= inv.cantidadMinima);

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
          paginationModel={{ pageSize: 10, page: 0 }}
          pageSizeOptions={[10, 25, 50]}
          disableRowSelectionOnClick
        />
      </Paper>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Nuevo Movimiento de Inventario</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              fullWidth
              label="ID Producto"
              type="number"
              value={formData.productoId || ''}
              onChange={(e) => setFormData({ ...formData, productoId: parseInt(e.target.value) || 0 })}
            />
            <FormControl fullWidth>
              <InputLabel>Bodega</InputLabel>
              <Select
                value={formData.bodegaId?.toString() || ''}
                onChange={(e) => setFormData({ ...formData, bodegaId: parseInt(e.target.value) || 0 })}
              >
                {bodegas.map((bodega) => (
                  <MenuItem key={bodega.id} value={bodega.id}>
                    {bodega.nombre}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Cantidad"
              type="number"
              value={formData.cantidad || ''}
              onChange={(e) => setFormData({ ...formData, cantidad: parseInt(e.target.value) || 0 })}
            />
            <TextField
              fullWidth
              label="Stock Mínimo"
              type="number"
              value={formData.cantidadMinima || ''}
              onChange={(e) => setFormData({ ...formData, cantidadMinima: parseInt(e.target.value) || 0 })}
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

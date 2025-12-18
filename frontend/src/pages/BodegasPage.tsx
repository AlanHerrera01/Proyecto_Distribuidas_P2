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
  GridActionsCellItem,
} from '@mui/x-data-grid';
import {
  Add,
  Edit,
  Delete,
  Warehouse,
} from '@mui/icons-material';
import { Bodega } from '../types';
import { bodegaService } from '../services';

const BodegasPage: React.FC = () => {
  const [bodegas, setBodegas] = useState<Bodega[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingBodega, setEditingBodega] = useState<Bodega | null>(null);
  const [formData, setFormData] = useState<Partial<Bodega>>({
    nombre: '',
    direccion: '',
    capacidad: 0,
    estado: 'ACTIVO',
  });
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof Bodega, string>>>({});
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // Carga de bodegas
  const loadBodegas = useCallback(async () => {
    try {
      const data = await bodegaService.getAll();
      setBodegas(data);
    } catch (error) {
      console.error('Error loading bodegas:', error);
      showSnackbar('Error al cargar bodegas', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBodegas();
  }, [loadBodegas]);

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  // Validaciones en tiempo real
  const validateField = (name: keyof Bodega, value: any) => {
    let error = '';
    switch (name) {
      case 'nombre':
        if (!value) error = 'El nombre es obligatorio';
        else if (value.length > 100) error = 'Máximo 100 caracteres';
        break;
      case 'direccion':
        if (!value) error = 'La dirección es obligatoria';
        else if (value.length > 200) error = 'Máximo 200 caracteres';
        break;
      case 'capacidad':
        if (!value || value <= 0) error = 'La capacidad debe ser mayor a 0';
        break;
    }
    return error;
  };

  const handleFieldChange = (field: keyof Bodega, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    const error = validateField(field, value);
    setFormErrors(prev => ({ ...prev, [field]: error }));
  };

  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof Bodega, string>> = {};
    
    if (!formData.nombre) errors.nombre = 'El nombre es obligatorio';
    if (!formData.direccion) errors.direccion = 'La dirección es obligatoria';
    if (!formData.capacidad || formData.capacidad <= 0) {
      errors.capacidad = 'La capacidad debe ser mayor a 0';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleOpenDialog = () => {
    setEditingBodega(null);
    setFormData({
      nombre: '',
      direccion: '',
      capacidad: 0,
      estado: 'ACTIVO',
    });
    setFormErrors({});
    setOpenDialog(true);
  };

  const handleEdit = (bodega: Bodega) => {
    setEditingBodega(bodega);
    setFormData(bodega);
    setFormErrors({});
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingBodega(null);
    setFormData({
      nombre: '',
      direccion: '',
      capacidad: 0,
      estado: 'ACTIVO',
    });
    setFormErrors({});
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      showSnackbar('Por favor corrige los errores en el formulario', 'error');
      return;
    }

    try {
      const dataToSend = {
        ...formData,
        estado: editingBodega ? formData.estado : 'ACTIVO'
      };

      if (editingBodega) {
        await bodegaService.update(editingBodega.id!, dataToSend);
        showSnackbar('Bodega actualizada exitosamente', 'success');
      } else {
        await bodegaService.create(dataToSend as Omit<Bodega, 'id'>);
        showSnackbar('Bodega creada exitosamente', 'success');
      }
      handleCloseDialog();
      loadBodegas();
    } catch (error: any) {
      console.error('Error saving bodega:', error);
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Error al guardar la bodega';
      showSnackbar(errorMessage, 'error');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Estás seguro de eliminar esta bodega?')) {
      try {
        await bodegaService.delete(id);
        showSnackbar('Bodega eliminada exitosamente', 'success');
        loadBodegas();
      } catch (error: any) {
        console.error('Error deleting bodega:', error);
        const errorMessage = error.response?.data?.message || 
                            'Error al eliminar la bodega';
        showSnackbar(errorMessage, 'error');
      }
    }
  };

  const handleToggleEstado = async (bodega: Bodega) => {
    const nuevoEstado = bodega.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';
    try {
      await bodegaService.cambiarEstado(bodega.id!, nuevoEstado);
      showSnackbar(`Estado cambiado a ${nuevoEstado}`, 'success');
      loadBodegas();
    } catch (error: any) {
      console.error('Error changing estado:', error);
      showSnackbar('Error al cambiar el estado', 'error');
    }
  };

  const columns: GridColDef[] = [
    // Columna ID eliminada completamente para evitar error de tipo
    {
      field: 'nombre',
      headerName: 'Nombre',
      flex: 1,
      minWidth: 150,
    },
    {
      field: 'direccion',
      headerName: 'Dirección',
      flex: 1,
      minWidth: 200,
    },
    {
      field: 'capacidad',
      headerName: 'Capacidad',
      width: 120,
      type: 'number',
      valueFormatter: (params) => `${params || 0} m³`,
    },
    {
      field: 'estado',
      headerName: 'Estado',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={params.value === 'ACTIVO' ? 'success' : 'default'}
          size="small"
          onClick={() => handleToggleEstado(params.row)}
          sx={{ cursor: 'pointer' }}
        />
      ),
    },
    {
      field: 'fechaCreacion',
      headerName: 'Fecha Creación',
      width: 140,
      valueFormatter: (params) => {
        if (!params) return 'N/A';
        try {
          return new Date(params).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          });
        } catch (error) {
          return 'N/A';
        }
      },
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Acciones',
      width: 100,
      getActions: (params) => [
        <GridActionsCellItem
          icon={<Edit />}
          label="Editar"
          onClick={() => handleEdit(params.row)}
          showInMenu={false}
        />,
        <GridActionsCellItem
          icon={<Delete />}
          label="Eliminar"
          onClick={() => handleDelete(params.row.id)}
          showInMenu={false}
        />,
      ],
    },
  ];

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Warehouse color="primary" sx={{ fontSize: 32 }} />
          <Typography variant="h4" component="h1">
            Gestión de Bodegas
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleOpenDialog}
        >
          Nueva Bodega
        </Button>
      </Box>

      <Paper sx={{ width: '100%', mb: 2 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <DataGrid
            rows={bodegas}
            columns={columns}
            getRowId={(row) => row.id}
            initialState={{
              pagination: {
                paginationModel: { pageSize: 10 },
              },
            }}
            pageSizeOptions={[5, 10, 25]}
            disableRowSelectionOnClick
            autoHeight
            sx={{
              '& .MuiDataGrid-cell:focus': {
                outline: 'none',
              },
            }}
          />
        )}
      </Paper>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingBodega ? 'Editar Bodega' : 'Nueva Bodega'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              fullWidth
              label="Nombre"
              value={formData.nombre || ''}
              onChange={(e) => handleFieldChange('nombre', e.target.value)}
              error={!!formErrors.nombre}
              helperText={formErrors.nombre}
              required
            />
            <TextField
              fullWidth
              label="Dirección"
              value={formData.direccion || ''}
              onChange={(e) => handleFieldChange('direccion', e.target.value)}
              error={!!formErrors.direccion}
              helperText={formErrors.direccion}
              required
              multiline
              rows={2}
            />
            <TextField
              fullWidth
              label="Capacidad (m³)"
              type="number"
              value={formData.capacidad || ''}
              onChange={(e) => handleFieldChange('capacidad', parseInt(e.target.value) || 0)}
              error={!!formErrors.capacidad}
              helperText={formErrors.capacidad}
              required
              inputProps={{ min: 1 }}
            />
            {editingBodega ? (
              <FormControl fullWidth>
                <InputLabel>Estado</InputLabel>
                <Select
                  value={formData.estado || 'ACTIVO'}
                  onChange={(e) => handleFieldChange('estado', e.target.value)}
                  label="Estado"
                >
                  <MenuItem value="ACTIVO">Activo</MenuItem>
                  <MenuItem value="INACTIVO">Inactivo</MenuItem>
                </Select>
              </FormControl>
            ) : null}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingBodega ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default BodegasPage;

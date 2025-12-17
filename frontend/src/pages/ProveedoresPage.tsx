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
import { Proveedor } from '../types';
import { proveedorService } from '../services';

const ProveedoresPage: React.FC = () => {
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingProveedor, setEditingProveedor] = useState<Proveedor | null>(null);
  const [formData, setFormData] = useState<Partial<Proveedor>>({
    nombre: '',
    nit: '',
    direccion: '',
    telefono: '',
    email: '',
    contacto: '',
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

  // Optimizar carga de proveedores con useCallback
  const loadProveedores = useCallback(async () => {
    try {
      const data = await proveedorService.getAll();
      setProveedores(data);
    } catch (error) {
      console.error('Error loading proveedores:', error);
      showSnackbar('Error al cargar proveedores', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProveedores();
  }, [loadProveedores]);

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleOpenDialog = (proveedor?: Proveedor) => {
    if (proveedor) {
      setEditingProveedor(proveedor);
      setFormData(proveedor);
    } else {
      setEditingProveedor(null);
      setFormData({
        nombre: '',
        nit: '',
        direccion: '',
        telefono: '',
        email: '',
        contacto: '',
        estado: 'ACTIVO',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingProveedor(null);
    setFormData({});
  };

  const handleSave = async () => {
    try {
      if (editingProveedor) {
        await proveedorService.update(editingProveedor.id!, formData);
        showSnackbar('Proveedor actualizado exitosamente', 'success');
      } else {
        await proveedorService.create(formData as Omit<Proveedor, 'id'>);
        showSnackbar('Proveedor creado exitosamente', 'success');
      }
      handleCloseDialog();
      loadProveedores();
    } catch (error) {
      console.error('Error saving proveedor:', error);
      showSnackbar('Error al guardar proveedor', 'error');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Está seguro que desea eliminar este proveedor?')) {
      try {
        await proveedorService.delete(id);
        showSnackbar('Proveedor eliminado exitosamente', 'success');
        loadProveedores();
      } catch (error) {
        console.error('Error deleting proveedor:', error);
        showSnackbar('Error al eliminar proveedor', 'error');
      }
    }
  };

  const handleChangeEstado = async (id: number, estado: string) => {
    try {
      await proveedorService.cambiarEstado(id, estado);
      showSnackbar('Estado actualizado exitosamente', 'success');
      loadProveedores();
    } catch (error) {
      console.error('Error changing estado:', error);
      showSnackbar('Error al cambiar estado', 'error');
    }
  };

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'nit', headerName: 'NIT', width: 120 },
    { field: 'nombre', headerName: 'Nombre', width: 200 },
    { field: 'contacto', headerName: 'Contacto', width: 150 },
    { field: 'telefono', headerName: 'Teléfono', width: 120 },
    { field: 'email', headerName: 'Email', width: 180 },
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
        <Typography variant="h4">Proveedores</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
        >
          Nuevo Proveedor
        </Button>
      </Box>

      <Paper sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={proveedores}
          columns={columns}
          paginationModel={{ pageSize: 10, page: 0 }}
          pageSizeOptions={[10, 25, 50]}
          disableRowSelectionOnClick
        />
      </Paper>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingProveedor ? 'Editar Proveedor' : 'Nuevo Proveedor'}
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
                label="NIT"
                value={formData.nit || ''}
                onChange={(e) => setFormData({ ...formData, nit: e.target.value })}
              />
            </Box>
            <TextField
              fullWidth
              label="Dirección"
              value={formData.direccion || ''}
              onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
            />
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
              <TextField
                fullWidth
                label="Teléfono"
                value={formData.telefono || ''}
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
              />
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </Box>
            <TextField
              fullWidth
              label="Contacto"
              value={formData.contacto || ''}
              onChange={(e) => setFormData({ ...formData, contacto: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleSave} variant="contained">
            {editingProveedor ? 'Actualizar' : 'Crear'}
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

export default ProveedoresPage;

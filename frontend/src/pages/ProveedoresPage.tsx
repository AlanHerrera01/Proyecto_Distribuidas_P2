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
  Search,
  Clear,
  Business as BusinessIcon,
} from '@mui/icons-material';
import {
  InputAdornment,
  IconButton,
  Tooltip,
} from '@mui/material';
import { Proveedor } from '../types';
import { proveedorService } from '../services';

const ProveedoresPage: React.FC = () => {
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [proveedoresFiltrados, setProveedoresFiltrados] = useState<Proveedor[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingProveedor, setEditingProveedor] = useState<Proveedor | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<string>('TODOS');
  const [formData, setFormData] = useState<Partial<Proveedor>>({
    nombre: '',
    nitRuc: '',
    direccion: '',
    telefono: '',
    email: '',
    contacto: '',
    estado: 'ACTIVO',
    observaciones: '',
  });
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof Proveedor, string>>>({});
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // Carga de proveedores
  const loadProveedores = useCallback(async () => {
    try {
      const data = await proveedorService.getAll();
      setProveedores(data);
      setProveedoresFiltrados(data);
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

  // Filtrar proveedores cuando cambien los criterios
  useEffect(() => {
    let filtered = [...proveedores];

    // Filtrar por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(p => 
        p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.nitRuc.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.contacto?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrar por estado
    if (filtroEstado !== 'TODOS') {
      filtered = filtered.filter(p => p.estado === filtroEstado);
    }

    setProveedoresFiltrados(filtered);
  }, [searchTerm, filtroEstado, proveedores]);

  const limpiarFiltros = () => {
    setSearchTerm('');
    setFiltroEstado('TODOS');
  };

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  // Validaciones en tiempo real
  const validateField = (name: keyof Proveedor, value: any) => {
    let error = '';
    switch (name) {
      case 'nombre':
        if (!value) error = 'El nombre es obligatorio';
        else if (value.length > 100) error = 'Máximo 100 caracteres';
        break;
      case 'nitRuc':
        if (!value) error = 'El NIT/RUC es obligatorio';
        else if (value.length > 20) error = 'Máximo 20 caracteres';
        break;
      case 'contacto':
        if (!value) error = 'El contacto es obligatorio';
        else if (value.length > 100) error = 'Máximo 100 caracteres';
        break;
      case 'email':
        if (!value) error = 'El email es obligatorio';
        else if (!/^\S+@\S+\.\S+$/.test(value)) error = 'Formato de email inválido';
        else if (value.length > 100) error = 'Máximo 100 caracteres';
        break;
      case 'telefono':
        if (!value) error = 'El teléfono es obligatorio';
        else if (!/^[0-9]{7,15}$/.test(value)) error = 'Solo números (7-15 dígitos)';
        break;
      case 'direccion':
        if (!value) error = 'La dirección es obligatoria';
        else if (value.length > 200) error = 'Máximo 200 caracteres';
        break;
      case 'estado':
        if (!value) error = 'El estado es obligatorio';
        else if (value.length > 20) error = 'Máximo 20 caracteres';
        break;
      case 'observaciones':
        if (value && value.length > 500) error = 'Máximo 500 caracteres';
        break;
      default:
        break;
    }
    setFormErrors((prev) => ({ ...prev, [name]: error }));
    return error;
  };

  const validateForm = () => {
    let valid = true;
    const requiredFields: (keyof Proveedor)[] = ['nombre', 'nitRuc', 'contacto', 'email', 'telefono', 'direccion', 'estado'];
    requiredFields.forEach((key) => {
      const error = validateField(key, formData[key]);
      if (error) valid = false;
    });
    return valid;
  };

  const handleOpenDialog = (proveedor?: Proveedor) => {
    if (proveedor) {
      setEditingProveedor(proveedor);
      setFormData(proveedor);
    } else {
      setEditingProveedor(null);
      setFormData({
        nombre: '',
        nitRuc: '',
        direccion: '',
        telefono: '',
        email: '',
        contacto: '',
        estado: 'ACTIVO',
        observaciones: '',
      });
    }
    setFormErrors({});
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingProveedor(null);
    setFormData({
      nombre: '',
      nitRuc: '',
      direccion: '',
      telefono: '',
      email: '',
      contacto: '',
      estado: 'ACTIVO',
      observaciones: '',
    });
    setFormErrors({});
  };

  const handleSave = async () => {
    if (!validateForm()) {
      showSnackbar('Por favor corrige los errores del formulario', 'error');
      return;
    }
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
    } catch (error: any) {
      let message = 'Error al guardar proveedor';
      if (error.response && error.response.data) {
        if (typeof error.response.data === 'string') {
          message = error.response.data;
        } else if (error.response.data.message) {
          message = error.response.data.message;
        } else if (Array.isArray(error.response.data.errors)) {
          message = error.response.data.errors.join(', ');
        }
      }
      console.error('Error saving proveedor:', error);
      showSnackbar(message, 'error');
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
    // { field: 'id', headerName: 'ID', width: 70 }, // Ocultamos el ID
    { field: 'nitRuc', headerName: 'NIT/RUC', width: 120 },
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
    <Box sx={{ width: '100%', p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <BusinessIcon color="primary" sx={{ fontSize: 32 }} />
          <Typography variant="h4" component="h1">
            Gestión de Proveedores
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
        >
          Nuevo Proveedor
        </Button>
      </Box>

      {/* Barra de búsqueda y filtros */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField
            placeholder="Buscar por nombre, NIT/RUC, email o contacto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ flexGrow: 1, minWidth: 300 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>Estado</InputLabel>
            <Select
              value={filtroEstado}
              label="Estado"
              onChange={(e) => setFiltroEstado(e.target.value)}
            >
              <MenuItem value="TODOS">TODOS</MenuItem>
              <MenuItem value="ACTIVO">ACTIVO</MenuItem>
              <MenuItem value="INACTIVO">INACTIVO</MenuItem>
            </Select>
          </FormControl>
          <Tooltip title="Limpiar filtros">
            <IconButton onClick={limpiarFiltros} color="primary">
              <Clear />
            </IconButton>
          </Tooltip>
        </Box>
        <Box sx={{ mt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Mostrando {proveedoresFiltrados.length} de {proveedores.length} proveedores
          </Typography>
        </Box>
      </Paper>

      <Paper sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={proveedoresFiltrados}
          columns={columns}
          getRowId={(row) => row.id}
          initialState={{
            pagination: {
              paginationModel: { pageSize: 10, page: 0 },
            },
          }}
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
                placeholder="Ej: Proveedor S.A."
                value={formData.nombre || ''}
                onChange={e => {
                  setFormData({ ...formData, nombre: e.target.value });
                  validateField('nombre', e.target.value);
                }}
                required
                error={!!formErrors.nombre}
                helperText={formErrors.nombre || 'Máximo 100 caracteres'}
                inputProps={{ maxLength: 100 }}
              />
              <TextField
                fullWidth
                label="NIT/RUC"
                placeholder="Ej: 1234567890"
                value={formData.nitRuc || ''}
                onChange={e => {
                  setFormData({ ...formData, nitRuc: e.target.value });
                  validateField('nitRuc', e.target.value);
                }}
                required
                error={!!formErrors.nitRuc}
                helperText={formErrors.nitRuc || 'Máximo 20 caracteres'}
                inputProps={{ maxLength: 20 }}
              />
            </Box>
            <TextField
              fullWidth
              label="Dirección"
              placeholder="Ej: Av. Siempre Viva 123"
              value={formData.direccion || ''}
              onChange={e => {
                setFormData({ ...formData, direccion: e.target.value });
                validateField('direccion', e.target.value);
              }}
              required
              error={!!formErrors.direccion}
              helperText={formErrors.direccion || 'Máximo 200 caracteres'}
              inputProps={{ maxLength: 200 }}
            />
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
              <TextField
                fullWidth
                label="Teléfono"
                placeholder="Solo números, 7-15 dígitos"
                value={formData.telefono || ''}
                onChange={e => {
                  setFormData({ ...formData, telefono: e.target.value });
                  validateField('telefono', e.target.value);
                }}
                required
                error={!!formErrors.telefono}
                helperText={formErrors.telefono || 'Solo números (7-15 dígitos)'}
                inputProps={{ maxLength: 15 }}
              />
              <TextField
                fullWidth
                label="Email"
                placeholder="Ej: correo@proveedor.com"
                type="email"
                value={formData.email || ''}
                onChange={e => {
                  setFormData({ ...formData, email: e.target.value });
                  validateField('email', e.target.value);
                }}
                required
                error={!!formErrors.email}
                helperText={formErrors.email || 'Formato válido de email'}
                inputProps={{ maxLength: 100 }}
              />
            </Box>
            <TextField
              fullWidth
              label="Contacto"
              placeholder="Ej: Juan Pérez"
              value={formData.contacto || ''}
              onChange={e => {
                setFormData({ ...formData, contacto: e.target.value });
                validateField('contacto', e.target.value);
              }}
              required
              error={!!formErrors.contacto}
              helperText={formErrors.contacto || 'Nombre del contacto (máx. 100 caracteres)'}
              inputProps={{ maxLength: 100 }}
            />
            {editingProveedor ? (
              <FormControl fullWidth required error={!!formErrors.estado}>
                <InputLabel>Estado</InputLabel>
                <Select
                  value={formData.estado || 'ACTIVO'}
                  label="Estado"
                  onChange={e => {
                    setFormData({ ...formData, estado: e.target.value as 'ACTIVO' | 'INACTIVO' });
                    validateField('estado', e.target.value);
                  }}
                >
                  <MenuItem value="ACTIVO">ACTIVO</MenuItem>
                  <MenuItem value="INACTIVO">INACTIVO</MenuItem>
                </Select>
              </FormControl>
            ) : null}
            <TextField
              fullWidth
              label="Observaciones (opcional)"
              placeholder="Notas adicionales (máx. 500 caracteres)"
              multiline
              rows={3}
              value={formData.observaciones || ''}
              onChange={e => {
                setFormData({ ...formData, observaciones: e.target.value });
                validateField('observaciones', e.target.value);
              }}
              error={!!formErrors.observaciones}
              helperText={formErrors.observaciones || `${(formData.observaciones || '').length}/500 caracteres`}
              inputProps={{ maxLength: 500 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleSave} variant="contained" color="primary">
            {editingProveedor ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
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

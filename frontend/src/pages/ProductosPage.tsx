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
  InputAdornment,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
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
  Inventory2,
} from '@mui/icons-material';
import { Producto } from '../types';
import { productoService } from '../services';

const ProductosPage: React.FC = () => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [productosFiltrados, setProductosFiltrados] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingProducto, setEditingProducto] = useState<Producto | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState<string>('TODOS');
  const [filtroEstado, setFiltroEstado] = useState<string>('TODOS');
  const [formData, setFormData] = useState<Partial<Producto>>({
    nombre: '',
    sku: '',
    descripcion: '',
    precio: 0,
    categoria: '',
    estado: 'ACTIVO',
  });
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof Producto, string>>>({});
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // Categorías disponibles
  const categorias = ['TODOS', 'ELECTRÓNICA', 'ALIMENTOS', 'ROPA', 'HOGAR', 'DEPORTES', 'OTROS'];

  // Optimizar carga de productos con useCallback
  const loadProductos = useCallback(async () => {
    try {
      const data = await productoService.getAll();
      setProductos(data);
      setProductosFiltrados(data);
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

  // Filtrar productos cuando cambien los criterios
  useEffect(() => {
    let filtered = [...productos];

    // Filtrar por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(p => 
        p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.categoria?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrar por categoría
    if (filtroCategoria !== 'TODOS') {
      filtered = filtered.filter(p => p.categoria === filtroCategoria);
    }

    // Filtrar por estado
    if (filtroEstado !== 'TODOS') {
      filtered = filtered.filter(p => p.estado === filtroEstado);
    }

    setProductosFiltrados(filtered);
  }, [searchTerm, filtroCategoria, filtroEstado, productos]);

  const limpiarFiltros = () => {
    setSearchTerm('');
    setFiltroCategoria('TODOS');
    setFiltroEstado('TODOS');
  };

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'warning') => {
    setSnackbar({ open: true, message, severity });
  };

  const validateField = (name: keyof Producto, value: any) => {
    let error = '';
    switch (name) {
      case 'nombre':
        if (!value) error = 'El nombre es obligatorio';
        else if (value.length < 3) error = 'Mínimo 3 caracteres';
        else if (value.length > 100) error = 'Máximo 100 caracteres';
        break;
      case 'sku':
        if (!value) error = 'El SKU es obligatorio';
        else if (value.length < 3) error = 'Mínimo 3 caracteres';
        else if (!/^[A-Za-z0-9-_]+$/.test(value)) error = 'Solo letras, números, guiones y guiones bajos';
        break;
      case 'precio':
        if (value === undefined || value === null) error = 'El precio es obligatorio';
        else if (value < 0) error = 'El precio no puede ser negativo';
        break;
      case 'categoria':
        if (!value) error = 'La categoría es obligatoria';
        break;
    }
    return error;
  };

  const handleFieldChange = (field: keyof Producto, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    const error = validateField(field, value);
    setFormErrors(prev => ({ ...prev, [field]: error }));
  };

  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof Producto, string>> = {};
    
    if (!formData.nombre) errors.nombre = 'El nombre es obligatorio';
    if (!formData.sku) errors.sku = 'El SKU es obligatorio';
    if (formData.precio === undefined || formData.precio < 0) errors.precio = 'Precio inválido';
    if (!formData.categoria) errors.categoria = 'La categoría es obligatoria';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
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
    setFormErrors({});
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingProducto(null);
    setFormData({});
    setFormErrors({});
  };

  const handleSave = async () => {
    if (!validateForm()) {
      showSnackbar('Por favor corrige los errores en el formulario', 'error');
      return;
    }

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
    } catch (error: any) {
      console.error('Error saving producto:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data || 
                          'Error al guardar el producto';
      showSnackbar(errorMessage, 'error');
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
    // { field: 'id', headerName: 'ID', width: 70 }, // Ocultamos el ID
    { field: 'sku', headerName: 'SKU', width: 120 },
    { field: 'nombre', headerName: 'Nombre', width: 200 },
    { field: 'categoria', headerName: 'Categoría', width: 120 },
    {
      field: 'precio',
      headerName: 'Precio',
      width: 100,
      type: 'number',
      valueFormatter: (value: any) => {
        return value ? `$${Number(value).toFixed(2)}` : '$0.00';
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
    <Box sx={{ width: '100%', p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Inventory2 color="primary" sx={{ fontSize: 32 }} />
          <Typography variant="h4" component="h1">
            Gestión de Productos
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
        >
          Nuevo Producto
        </Button>
      </Box>

      {/* Barra de búsqueda y filtros */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField
            placeholder="Buscar por nombre, SKU o categoría..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ flexGrow: 1, minWidth: 250 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Categoría</InputLabel>
            <Select
              value={filtroCategoria}
              label="Categoría"
              onChange={(e) => setFiltroCategoria(e.target.value)}
            >
              {categorias.map(cat => (
                <MenuItem key={cat} value={cat}>{cat}</MenuItem>
              ))}
            </Select>
          </FormControl>
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
            Mostrando {productosFiltrados.length} de {productos.length} productos
          </Typography>
        </Box>
      </Paper>

      <Paper sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={productosFiltrados}
          columns={columns}
          getRowId={(row) => row.id}
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
                onChange={(e) => handleFieldChange('nombre', e.target.value)}
                error={!!formErrors.nombre}
                helperText={formErrors.nombre}
                required
              />
              <TextField
                fullWidth
                label="SKU"
                value={formData.sku || ''}
                onChange={(e) => handleFieldChange('sku', e.target.value)}
                error={!!formErrors.sku}
                helperText={formErrors.sku || 'Código único del producto'}
                required
              />
            </Box>
            <TextField
              fullWidth
              label="Descripción"
              value={formData.descripcion || ''}
              onChange={(e) => handleFieldChange('descripcion', e.target.value)}
              multiline
              rows={3}
              placeholder="Descripción detallada del producto..."
            />
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
              <TextField
                fullWidth
                label="Precio"
                type="number"
                value={formData.precio || ''}
                onChange={(e) => handleFieldChange('precio', parseFloat(e.target.value) || 0)}
                error={!!formErrors.precio}
                helperText={formErrors.precio}
                required
                inputProps={{ min: 0, step: 0.01 }}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
              />
              <FormControl fullWidth required error={!!formErrors.categoria}>
                <InputLabel>Categoría</InputLabel>
                <Select
                  value={formData.categoria || ''}
                  label="Categoría"
                  onChange={(e) => handleFieldChange('categoria', e.target.value)}
                >
                  {categorias.filter(c => c !== 'TODOS').map(cat => (
                    <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                  ))}
                </Select>
                {formErrors.categoria && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 2 }}>
                    {formErrors.categoria}
                  </Typography>
                )}
              </FormControl>
            </Box>
            {editingProducto ? (
              <FormControl fullWidth>
                <InputLabel>Estado</InputLabel>
                <Select
                  value={formData.estado || 'ACTIVO'}
                  label="Estado"
                  onChange={(e) => handleFieldChange('estado', e.target.value)}
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
          <Button onClick={handleSave} variant="contained">
            {editingProducto ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
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

export default ProductosPage;

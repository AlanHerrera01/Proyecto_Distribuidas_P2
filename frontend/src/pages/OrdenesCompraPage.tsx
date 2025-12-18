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
  InputAdornment,
  Tooltip,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Remove,
  Clear,
  ShoppingCart as ShoppingCartIcon,
} from '@mui/icons-material';
import { OrdenCompra, DetalleOrden, Proveedor, Producto } from '../types';
import { ordenCompraService, proveedorService, productoService, inventarioService } from '../services';

const OrdenesCompraPage: React.FC = () => {
  const [ordenes, setOrdenes] = useState<OrdenCompra[]>([]);
  const [ordenesFiltradas, setOrdenesFiltradas] = useState<OrdenCompra[]>([]);
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingOrden, setEditingOrden] = useState<OrdenCompra | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<string>('TODOS');
  const [formData, setFormData] = useState<Partial<OrdenCompra>>({
    proveedorId: undefined,
    numeroFactura: '',
    fechaEmision: new Date().toISOString().split('T')[0], // Formato yyyy-MM-dd
    fechaEntrega: '',
    subtotal: 0,
    iva: 0,
    total: 0,
    estado: 'PENDIENTE',
    observaciones: '',
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
      console.log('Cargando órdenes desde el backend...');
      const data = await ordenCompraService.getAll();
      console.log('Datos recibidos del backend:', data); // Debug
      
      // Validar que data sea un array
      if (!Array.isArray(data)) {
        console.error('Los datos recibidos no son un array:', data);
        setOrdenes([]);
        setOrdenesFiltradas([]);
        showSnackbar('Error: formato de datos inválido del servidor', 'error');
        return;
      }
      
      console.log('Procesando', data.length, 'órdenes recibidas');
      
      // Validar que todas las órdenes tengan un id
      const ordenesValidas = data.filter(orden => orden.id != null);
      if (ordenesValidas.length !== data.length) {
        console.warn(`Se filtraron ${data.length - ordenesValidas.length} órdenes sin ID`);
      }
      
      // Mapear proveedores a las órdenes
      const ordenesConProveedor = ordenesValidas.map(orden => {
        const proveedor = proveedores.find(p => p.id === orden.proveedorId);
        return {
          ...orden,
          proveedor: proveedor ? {
            nombre: proveedor.nombre,
            nitRuc: proveedor.nitRuc
          } : undefined
        };
      });
      
      // Forzar actualización del estado con nuevas referencias
      setOrdenes([...ordenesConProveedor]);
      setOrdenesFiltradas([...ordenesConProveedor]);
    } catch (error) {
      console.error('Error loading ordenes:', error);
      setOrdenes([]);
      setOrdenesFiltradas([]);
      showSnackbar('Error al cargar órdenes', 'error');
    } finally {
      setLoading(false);
    }
  }, []); // Sin dependencias para poder recargar cuando sea necesario

  const loadProveedores = useCallback(async () => {
    try {
      const data = await proveedorService.getAll();
      setProveedores(data);
    } catch (error) {
      console.error('Error loading proveedores:', error);
    }
  }, []);

  const loadProductos = useCallback(async () => {
    try {
      const data = await productoService.getAll();
      console.log('Datos recibidos del backend:', data);
      setProductos(Array.isArray(data) ? data : []);
      const productosActivos = data.filter(p => p.estado === 'ACTIVO');
      setProductos(productosActivos);
    } catch (error) {
      console.error('Error loading productos:', error);
    }
  }, []);

  useEffect(() => {
    const cargarDatos = async () => {
      // Siempre cargar proveedores y productos para asegurar datos actualizados
      await Promise.all([loadProveedores(), loadProductos()]);
      // Luego cargar órdenes (que dependen de proveedores)
      await loadOrdenes();
    };
    cargarDatos();
  }, []); // Sin dependencias para evitar recargas innecesarias

  // Filtrar órdenes cuando cambien los criterios
  useEffect(() => {
    let filtered = [...ordenes];

    // Filtrar por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(o => 
        o.id?.toString().includes(searchTerm) ||
        o.proveedor?.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.numeroFactura?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrar por estado
    if (filtroEstado !== 'TODOS') {
      filtered = filtered.filter(o => o.estado === filtroEstado);
    }

    setOrdenesFiltradas(filtered);
  }, [searchTerm, filtroEstado, ordenes]);

  const limpiarFiltros = () => {
    setSearchTerm('');
    setFiltroEstado('TODOS');
  };

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'warning') => {
    setSnackbar({ open: true, message, severity });
  };

  // Función para reducir stock de inventario cuando una orden se completa
  const reducirStockInventario = async (orden: OrdenCompra) => {
    if (!orden.detalles || orden.detalles.length === 0) {
      console.log('La orden no tiene detalles, no se reduce stock');
      return;
    }

    console.log('Reduciendo stock para orden ID:', orden.id);
    console.log('Detalles a procesar:', orden.detalles);

    try {
      // Obtener todas las bodegas para saber cuál usar (por ahora usaremos la primera)
      const bodegas = await inventarioService.getAllBodegas();
      if (bodegas.length === 0) {
        showSnackbar('No hay bodegas disponibles para reducir stock', 'error');
        return;
      }

      const bodegaDefecto = bodegas[0]; // Usar la primera bodega como defecto
      console.log('Usando bodega por defecto:', bodegaDefecto);

      if (!bodegaDefecto.id) {
        showSnackbar('La bodega por defecto no tiene un ID válido', 'error');
        return;
      }

      let erroresReducir: string[] = [];
      let exitosReducir = 0;

      // Reducir stock para cada detalle de la orden
      for (const detalle of orden.detalles) {
        try {
          console.log(`Reduciendo ${detalle.cantidad} unidades del producto ${detalle.productoId} en bodega ${bodegaDefecto.id}`);
          
          await inventarioService.reducirStock(
            detalle.productoId,
            bodegaDefecto.id!,
            detalle.cantidad
          );
          
          console.log(`Stock reducido exitosamente para producto ${detalle.productoId}`);
          exitosReducir++;
        } catch (error) {
          console.error(`Error reduciendo stock del producto ${detalle.productoId}:`, error);
          erroresReducir.push(`Producto ${detalle.productoId}: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        }
      }

      // Mostrar resultados
      if (exitosReducir > 0) {
        showSnackbar(`Stock reducido exitosamente para ${exitosReducir} productos`, 'success');
      }
      
      if (erroresReducir.length > 0) {
        showSnackbar(`Errores al reducir stock: ${erroresReducir.join(', ')}`, 'error');
      }
    } catch (error) {
      console.error('Error general al reducir stock:', error);
      showSnackbar('Error al reducir stock de inventario', 'error');
    }
  };

  // Generar número de factura único sugerido
  const generarNumeroFactura = () => {
    const fecha = new Date();
    const año = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');
    const hora = String(fecha.getHours()).padStart(2, '0');
    const minuto = String(fecha.getMinutes()).padStart(2, '0');
    const segundo = String(fecha.getSeconds()).padStart(2, '0');
    const milisegundo = String(fecha.getMilliseconds()).padStart(3, '0');
    return `FAC-${año}${mes}${dia}-${hora}${minuto}${segundo}${milisegundo}`;
  };

  const handleOpenDialog = (orden?: OrdenCompra) => {
    if (orden) {
      setEditingOrden(orden);
      // Convertir fechas ISO a formato yyyy-MM-dd para el input
      setFormData({
        ...orden,
        fechaEmision: orden.fechaEmision ? new Date(orden.fechaEmision).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        fechaEntrega: orden.fechaEntrega ? new Date(orden.fechaEntrega).toISOString().split('T')[0] : '',
      });
      setDetalles(orden.detalles || []);
    } else {
      setEditingOrden(null);
      setFormData({
        proveedorId: undefined,
        numeroFactura: generarNumeroFactura(), // Generar número único automáticamente
        fechaEmision: new Date().toISOString().split('T')[0],
        fechaEntrega: '',
        subtotal: 0,
        iva: 0,
        total: 0,
        estado: 'PENDIENTE',
        observaciones: '',
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
    // Validaciones
    if (!formData.proveedorId) {
      showSnackbar('Debes seleccionar un proveedor', 'error');
      return;
    }
    if (!formData.numeroFactura || formData.numeroFactura.trim() === '') {
      showSnackbar('El número de factura es obligatorio', 'error');
      return;
    }
    if (!formData.fechaEmision) {
      showSnackbar('La fecha de emisión es obligatoria', 'error');
      return;
    }
    if (detalles.length === 0) {
      showSnackbar('Debes agregar al menos un detalle a la orden', 'warning');
      return;
    }

    try {
      // Calcular subtotal basado en detalles
      const subtotal = detalles.reduce((sum, d) => sum + ((d.cantidad || 0) * (d.precioUnitario || 0)), 0);
      const iva = subtotal * 0.12; // 12% IVA
      const total = subtotal + iva;

      // Formatear fechas al formato ISO para el backend
      const fechaEmisionISO = formData.fechaEmision ? new Date(formData.fechaEmision).toISOString() : new Date().toISOString();
      const fechaEntregaISO = formData.fechaEntrega ? new Date(formData.fechaEntrega).toISOString() : undefined;

      // Preparar detalles completos
      const detallesCompletos = detalles.map(d => ({
        productoId: d.productoId!,
        nombreProducto: d.nombreProducto || `Producto ${d.productoId}`,
        cantidad: d.cantidad!,
        precioUnitario: d.precioUnitario!,
        descuento: d.descuento || 0,
        subtotal: (d.cantidad || 0) * (d.precioUnitario || 0)
      }));

      const ordenData = {
        proveedorId: formData.proveedorId,
        numeroFactura: formData.numeroFactura,
        fechaEmision: fechaEmisionISO,
        fechaEntrega: fechaEntregaISO,
        subtotal,
        iva,
        total,
        estado: formData.estado || 'PENDIENTE',
        observaciones: formData.observaciones || '',
        detalles: detallesCompletos,
      };

      console.log('Enviando orden:', ordenData); // Para debug

      if (editingOrden) {
        console.log('Actualizando orden ID:', editingOrden.id, 'con datos:', ordenData);
        const updatedOrden = await ordenCompraService.update(editingOrden.id!, ordenData);
        console.log('Orden actualizada del backend:', updatedOrden);
        
        // Si el estado cambió, usar el método específico para cambiar el estado
        if (formData.estado && formData.estado !== editingOrden.estado) {
          console.log('Cambiando estado de', editingOrden.estado, 'a', formData.estado);
          
          // Validar reglas de transición de estados
          const estadoActual = editingOrden.estado;
          const nuevoEstado = formData.estado;
          
          let transicionPermitida = false;
          let mensajeError = '';
          
          switch (estadoActual) {
            case 'PENDIENTE':
              if (nuevoEstado === 'EN_PROCESO' || nuevoEstado === 'CANCELADA') {
                transicionPermitida = true;
              } else if (nuevoEstado === 'COMPLETADA') {
                mensajeError = 'Para cambiar a COMPLETADA, primero debe pasar a EN_PROCESO';
              } else {
                mensajeError = 'Desde PENDIENTE solo se puede cambiar a EN_PROCESO o CANCELADA';
              }
              break;
            case 'EN_PROCESO':
              if (nuevoEstado === 'COMPLETADA' || nuevoEstado === 'CANCELADA') {
                transicionPermitida = true;
              } else {
                mensajeError = 'Desde EN_PROCESO solo se puede cambiar a COMPLETADA o CANCELADA';
              }
              break;
            case 'COMPLETADA':
            case 'CANCELADA':
              mensajeError = 'No se puede cambiar el estado desde ' + estadoActual;
              break;
            default:
              mensajeError = 'Transición de estado no válida';
          }
          
          if (!transicionPermitida) {
            showSnackbar(mensajeError, 'error');
            return;
          }
          
          try {
            await ordenCompraService.cambiarEstado(editingOrden.id!, formData.estado as any);
            console.log('Estado cambiado exitosamente');
            
            // Si el nuevo estado es COMPLETADA, reducir el stock de inventario
            if (formData.estado === 'COMPLETADA') {
              await reducirStockInventario(editingOrden);
            }
          } catch (error) {
            console.error('Error al cambiar estado:', error);
            showSnackbar('Error al cambiar el estado de la orden', 'error');
          }
        }
        
        showSnackbar('Orden actualizada exitosamente', 'success');
      } else {
        await ordenCompraService.create(ordenData as any);
        showSnackbar('Orden creada exitosamente', 'success');
      }
      
      handleCloseDialog();
      
      // Forzar recarga completa de datos
      setTimeout(() => {
        loadOrdenes();
      }, 100);
    } catch (error: any) {
      console.error('Error saving orden:', error);
      console.error('Response data:', error.response?.data);
      console.error('FULL ERROR DETAILS:', JSON.stringify(error.response?.data, null, 2));
      
      let errorMessage = 'Error al guardar la orden';
      
      if (error.response?.status === 409) {
        // Extraer el mensaje específico del error
        if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        }
        // Revisar errores específicos
        if (error.response?.data?.errors) {
          const errors = error.response.data.errors;
          console.error('ERRORS OBJECT:', errors);
          if (errors.numeroFactura) {
            errorMessage = `${errors.numeroFactura}: "${formData.numeroFactura}". Intenta regenerar el número.`;
          } else if (errors.proveedorId) {
            errorMessage = `${errors.proveedorId}. Verifica que el proveedor exista en el sistema.`;
          } else if (errors.productoId) {
            errorMessage = `${errors.productoId}. Verifica que todos los productos existan en el sistema.`;
          } else if (errors.general) {
            errorMessage = errors.general;
            if (errors.detalle) {
              console.error('Detalle del error:', errors.detalle);
            }
          }
        }
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        errorMessage = Object.values(errors).join(', ');
      } else if (error.response?.data) {
        errorMessage = typeof error.response.data === 'string' 
          ? error.response.data 
          : JSON.stringify(error.response.data);
      }
      
      showSnackbar(errorMessage, 'error');
    }
  };

  const handleDelete = async (id: number) => {
    // Encontrar la orden para verificar su estado
    const orden = ordenes.find(o => o.id === id);
    
    if (orden && orden.estado !== 'PENDIENTE') {
      showSnackbar(`Solo se pueden eliminar órdenes en estado PENDIENTE. Esta orden está en estado: ${orden.estado}`, 'warning');
      return;
    }
    
    if (window.confirm('¿Está seguro que desea eliminar esta orden?')) {
      try {
        await ordenCompraService.delete(id);
        showSnackbar('Orden eliminada exitosamente', 'success');
        loadOrdenes();
      } catch (error: any) {
        console.error('Error deleting orden:', error);
        
        let errorMessage = 'Error al eliminar orden';
        if (error.response?.status === 500) {
          errorMessage = 'No se puede eliminar esta orden. Solo se pueden eliminar órdenes en estado PENDIENTE.';
        } else if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        }
        
        showSnackbar(errorMessage, 'error');
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
      const nuevoDetalle: Partial<DetalleOrden> = {
        productoId: detalleForm.productoId,
        nombreProducto: `Producto ${detalleForm.productoId}`, // Nombre temporal
        cantidad: detalleForm.cantidad,
        precioUnitario: detalleForm.precioUnitario,
        descuento: 0,
        subtotal,
      };
      setDetalles([...detalles, nuevoDetalle]);
      
      // Limpiar formulario de detalle
      setDetalleForm({
        productoId: 0,
        cantidad: 1,
        precioUnitario: 0,
      });
    } else {
      showSnackbar('Completa todos los campos del detalle', 'warning');
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
      case 'COMPLETADA': return 'success';
      case 'CANCELADA': return 'error';
      case 'EN_PROCESO': return 'info';
      case 'PENDIENTE': return 'warning';
      default: return 'default';
    }
  };

  // const columns: GridColDef[] = [
//   // { field: 'id', headerName: 'ID', width: 70 }, // Ocultamos el ID
//   { 
//     field: 'proveedor', 
//     headerName: 'Proveedor', 
//     width: 200,
//     valueGetter: (value: any, row: any) => row.proveedor?.nombre || 'N/A',
//   },
//   {
//     field: 'numeroFactura',
//     headerName: 'N° Factura',
//     width: 150,
//   },
//   {
//     field: 'total',
//     headerName: 'Total',
//     width: 120,
//     type: 'number',
//     valueFormatter: (value: any) => {
//       return value ? `$${Number(value).toFixed(2)}` : '$0.00';
//     },
//   },
//   {
//     field: 'estado',
//     headerName: 'Estado',
//     width: 120,
//     renderCell: (params) => {
//       const estado = params.row.estado as string;
//       return (
//         <Chip
//           label={estado}
//           color={getEstadoColor(estado) as any}
//           size="small"
//           onClick={() => {
//             const nuevosEstados = ['PENDIENTE', 'EN_PROCESO', 'COMPLETADA', 'CANCELADA'];
//             const currentIndex = nuevosEstados.indexOf(estado);
//             const nuevoEstado = nuevosEstados[(currentIndex + 1) % nuevosEstados.length];
//             handleCambiarEstado(params.row.id, nuevoEstado);
//           }}
//           style={{ cursor: 'pointer' }}
//         />
//       );
//     },
//   },
//   {
//     field: 'actions',
//     headerName: 'Acciones',
//     width: 120,
//     renderCell: (params) => (
//       <Box>
//         <IconButton
//           size="small"
//           onClick={() => handleOpenDialog(params.row)}
//           title="Editar"
//         >
//           <Edit />
//         </IconButton>
//         <IconButton
//           size="small"
//           onClick={() => handleDelete(params.row.id)}
//           title="Eliminar"
//         >
//           <Delete />
//         </IconButton>
//       </Box>
//     ),
//   },
// ];

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
          <ShoppingCartIcon color="primary" sx={{ fontSize: 32 }} />
          <Typography variant="h4" component="h1">
            Órdenes de Compra
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
        >
          Nueva Orden
        </Button>
      </Box>

      {/* Barra de búsqueda y filtros */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField
            placeholder="Buscar por proveedor o número de factura..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ flexGrow: 1, minWidth: 300 }}
          />
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Estado</InputLabel>
            <Select
              value={filtroEstado}
              label="Estado"
              onChange={(e) => setFiltroEstado(e.target.value)}
            >
              <MenuItem value="TODOS">TODOS</MenuItem>
              <MenuItem value="PENDIENTE">PENDIENTE</MenuItem>
              <MenuItem value="EN_PROCESO">EN_PROCESO</MenuItem>
              <MenuItem value="COMPLETADA">COMPLETADA</MenuItem>
              <MenuItem value="CANCELADA">CANCELADA</MenuItem>
            </Select>
          </FormControl>
          <IconButton onClick={limpiarFiltros} color="primary" title="Limpiar filtros">
            <Clear />
          </IconButton>
        </Box>
        <Box sx={{ mt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Mostrando {ordenesFiltradas.length} de {ordenes.length} órdenes
            {filtroEstado !== 'TODOS' && ` - Filtradas por: ${filtroEstado}`}
          </Typography>
        </Box>
      </Paper>

      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Lista de Órdenes de Compra
        </Typography>
        
        {ordenesFiltradas.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography color="text.secondary">
              No hay órdenes de compra disponibles
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'grey.50' }}>
                  <TableCell sx={{ fontWeight: 'bold' }}>Proveedor</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>N° Factura</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Fecha Emisión</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Total</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Estado</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {ordenesFiltradas.map((orden, index) => {
                  console.log(`Renderizando orden ${index}:`, orden);
                  return (
                    <TableRow key={orden.id} hover>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {orden.proveedor?.nombre || 'N/A'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {orden.proveedor?.nitRuc || ''}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontFamily="monospace">
                          {orden.numeroFactura}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {orden.fechaEmision ? new Date(orden.fechaEmision).toLocaleDateString() : 'N/A'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold" color="primary">
                          ${orden.total?.toFixed(2) || '0.00'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={orden.estado || 'N/A'}
                          color={getEstadoColor(orden.estado)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <IconButton
                            onClick={() => handleOpenDialog(orden)}
                            color="primary"
                            size="small"
                            title="Editar orden"
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                          <IconButton
                            onClick={() => handleDelete(orden.id!)}
                            color="error"
                            size="small"
                            title="Eliminar orden"
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="lg" fullWidth>
        <DialogTitle>
          {editingOrden ? 'Editar Orden de Compra' : 'Nueva Orden de Compra'}
        </DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2, mt: 1 }}>
            Complete los datos de la orden y agregue los productos necesarios
          </Alert>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Información básica */}
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
              <FormControl fullWidth required>
                <InputLabel>Proveedor *</InputLabel>
                <Select
                  value={formData.proveedorId?.toString() || ''}
                  onChange={(e) => setFormData({ ...formData, proveedorId: parseInt(e.target.value) || undefined })}
                  label="Proveedor *"
                >
                  {proveedores.map((proveedor) => (
                    <MenuItem key={proveedor.id} value={proveedor.id}>
                      {proveedor.nombre} - {proveedor.nitRuc}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                fullWidth
                required
                label="Número de Factura"
                value={formData.numeroFactura || ''}
                onChange={(e) => setFormData({ ...formData, numeroFactura: e.target.value })}
                placeholder="FAC-20251217-143025"
                helperText="Número único de factura (autogenerado)"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Tooltip title="Generar nuevo número">
                        <IconButton 
                          onClick={() => setFormData({ ...formData, numeroFactura: generarNumeroFactura() })}
                          edge="end"
                          size="small"
                        >
                          🔄
                        </IconButton>
                      </Tooltip>
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
              <TextField
                fullWidth
                required
                label="Fecha de Emisión"
                type="date"
                value={formData.fechaEmision || ''}
                onChange={(e) => setFormData({ ...formData, fechaEmision: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                fullWidth
                label="Fecha de Entrega"
                type="date"
                value={formData.fechaEntrega || ''}
                onChange={(e) => setFormData({ ...formData, fechaEntrega: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Box>

            {editingOrden ? (
              <FormControl fullWidth>
                <InputLabel>Estado</InputLabel>
                <Select
                  value={formData.estado || 'PENDIENTE'}
                  label="Estado"
                  onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                >
                  <MenuItem value="PENDIENTE">PENDIENTE</MenuItem>
                  <MenuItem value="EN_PROCESO">EN_PROCESO</MenuItem>
                  <MenuItem value="COMPLETADA">COMPLETADA</MenuItem>
                  <MenuItem value="CANCELADA">CANCELADA</MenuItem>
                </Select>
              </FormControl>
            ) : null}

            <TextField
              fullWidth
              label="Observaciones"
              multiline
              rows={2}
              value={formData.observaciones || ''}
              onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
              placeholder="Notas adicionales sobre la orden..."
            />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
              <Typography variant="h6">Detalles de la Orden</Typography>
              <Chip 
                label={`Total: $${detalles.reduce((sum, d) => sum + ((d.cantidad || 0) * (d.precioUnitario || 0)), 0).toFixed(2)}`}
                color="primary"
                sx={{ fontSize: '1rem', py: 2 }}
              />
            </Box>
            
            {/* Formulario para agregar detalles */}
            <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
              <Typography variant="subtitle2" gutterBottom>Agregar Producto</Typography>
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
                <FormControl fullWidth required>
                  <InputLabel>Producto</InputLabel>
                  <Select
                    value={detalleForm.productoId || ''}
                    onChange={(e) => {
                      const productoId = e.target.value as number;
                      const producto = productos.find(p => p.id === productoId);
                      setDetalleForm({ 
                        ...detalleForm, 
                        productoId,
                        nombreProducto: producto?.nombre || '',
                        precioUnitario: producto?.precio || 0
                      });
                    }}
                    label="Producto"
                  >
                    <MenuItem value="" disabled>
                      <em>Selecciona un producto</em>
                    </MenuItem>
                    {productos.map((producto) => (
                      <MenuItem key={producto.id} value={producto.id}>
                        {producto.nombre} - ${producto.precio?.toFixed(2)} ({producto.sku})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField
                  fullWidth
                  label="Cantidad"
                  type="number"
                  value={detalleForm.cantidad || ''}
                  onChange={(e) => setDetalleForm({ ...detalleForm, cantidad: parseInt(e.target.value) || 0 })}
                  inputProps={{ min: 1 }}
                />
                <TextField
                  fullWidth
                  label="Precio Unitario"
                  type="number"
                  value={detalleForm.precioUnitario || ''}
                  onChange={(e) => setDetalleForm({ ...detalleForm, precioUnitario: parseFloat(e.target.value) || 0 })}
                  inputProps={{ min: 0, step: 0.01 }}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                />
                <Button onClick={handleAddDetalle} variant="contained" sx={{ minWidth: '120px' }}>
                  <Add /> Agregar
                </Button>
              </Box>
            </Paper>

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

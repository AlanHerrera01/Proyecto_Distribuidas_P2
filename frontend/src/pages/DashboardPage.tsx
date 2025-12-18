import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Paper,
  List,
  ListItem,
  ListItemText,
  Chip,
  CircularProgress,
  Grid,
  Avatar,
  LinearProgress,
  Fade,
  Container,
  Button,
  IconButton,
  Tooltip,
  Skeleton,
  Divider,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Inventory,
  Business,
  Warehouse,
  ShoppingCart,
  TrendingUp,
  Warning,
  Assessment,
  Timeline,
  LocalShipping,
  Store,
  AttachMoney,
  Add,
  Refresh,
  ArrowUpward,
  ArrowDownward,
  Visibility,
  NotificationsActive,
  Speed,
  PieChart,
  BarChart,
  Dashboard,
  LightMode,
  DarkMode,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart,
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import { productoService, proveedorService, inventarioService, ordenCompraService } from '../services';

interface DashboardStats {
  totalProductos: number;
  totalProveedores: number;
  totalBodegas: number;
  totalOrdenes: number;
  stockCritico: number;
  ordenesPendientes: number;
  productosActivos: number;
  proveedoresActivos: number;
  bodegasActivas: number;
}

interface ChartData {
  name: string;
  value: number;
  color: string;
  growth?: number;
}

interface ActivityItem {
  id: string;
  type: 'producto' | 'proveedor' | 'orden' | 'inventario';
  title: string;
  description: string;
  timestamp: Date;
  status: 'success' | 'warning' | 'error' | 'info';
}

interface QuickAction {
  title: string;
  description: string;
  icon: string;
  color: string;
  path: string;
}

const DashboardPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({
    totalProductos: 0,
    totalProveedores: 0,
    totalBodegas: 0,
    totalOrdenes: 0,
    stockCritico: 0,
    ordenesPendientes: 0,
    productosActivos: 0,
    proveedoresActivos: 0,
    bodegasActivas: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [animatedStats, setAnimatedStats] = useState({
    totalProductos: 0,
    totalProveedores: 0,
    totalBodegas: 0,
    totalOrdenes: 0,
  });
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [chartData, setChartData] = useState<ChartData[]>([]);

  const updateChartData = () => {
    setChartData([
      { name: 'Productos', value: stats.totalProductos, color: '#1976d2', growth: 12 },
      { name: 'Proveedores', value: stats.totalProveedores, color: '#2e7d32', growth: 8 },
      { name: 'Bodegas', value: stats.totalBodegas, color: '#ed6c02', growth: 5 },
      { name: 'Órdenes', value: stats.totalOrdenes, color: '#9c27b0', growth: 15 },
    ]);
  };

  const performanceData = [
    { month: 'Ene', productos: 65, proveedores: 28, ordenes: 45 },
    { month: 'Feb', productos: 78, proveedores: 35, ordenes: 52 },
    { month: 'Mar', productos: 92, proveedores: 42, ordenes: 61 },
    { month: 'Abr', productos: 88, proveedores: 38, ordenes: 58 },
    { month: 'May', productos: 95, proveedores: 45, ordenes: 67 },
    { month: 'Jun', productos: stats.totalProductos, proveedores: stats.totalProveedores, ordenes: stats.totalOrdenes },
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedStats({
        totalProductos: stats.totalProductos,
        totalProveedores: stats.totalProveedores,
        totalBodegas: stats.totalBodegas,
        totalOrdenes: stats.totalOrdenes,
      });
    }, 500);
    return () => clearTimeout(timer);
  }, [stats]);

  const handleQuickAction = (path: string) => {
    navigate(path);
  };

  const generateRecentActivity = (): ActivityItem[] => {
    const activities: ActivityItem[] = [];
    
    if (stats.ordenesPendientes > 0) {
      activities.push({
        id: '1',
        type: 'orden',
        title: 'Nueva orden pendiente',
        description: `${stats.ordenesPendientes} órdenes esperando procesamiento`,
        timestamp: new Date(Date.now() - 1000 * 60 * 30),
        status: 'warning'
      });
    }
    
    if (stats.stockCritico > 0) {
      activities.push({
        id: '2',
        type: 'inventario',
        title: 'Alerta de stock crítico',
        description: `${stats.stockCritico} productos con bajo stock`,
        timestamp: new Date(Date.now() - 1000 * 60 * 60),
        status: 'error'
      });
    }
    
    if (stats.productosActivos > 0) {
      activities.push({
        id: '3',
        type: 'producto',
        title: 'Productos activos',
        description: `${stats.productosActivos} productos en el sistema`,
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
        status: 'success'
      });
    }
    
    return activities;
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const [productos, proveedores, bodegas, ordenes, stockCritico, ordenesPendientes] = await Promise.all([
        productoService.getAll(),
        proveedorService.getAll(),
        inventarioService.getAllBodegas(),
        ordenCompraService.getAll(),
        inventarioService.getStockCritico(),
        ordenCompraService.getPendientes(),
      ]);

      setStats({
        totalProductos: productos.length,
        totalProveedores: proveedores.length,
        totalBodegas: bodegas.length,
        totalOrdenes: ordenes.length,
        stockCritico: stockCritico.length,
        ordenesPendientes: ordenesPendientes.length,
        productosActivos: productos.filter(p => p.estado === 'ACTIVO').length,
        proveedoresActivos: proveedores.filter(p => p.estado === 'ACTIVO').length,
        bodegasActivas: bodegas.length,
      });
    } catch (error) {
      console.error('Error refreshing dashboard stats:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'Add':
        return <Add />;
      case 'ShoppingCart':
        return <ShoppingCart />;
      case 'Inventory':
        return <Inventory />;
      case 'Business':
        return <Business />;
      default:
        return <Add />;
    }
  };

  const quickActions: QuickAction[] = [
    {
      title: 'Nuevo Producto',
      description: 'Agregar un nuevo producto al inventario',
      icon: 'Add',
      color: '#1976d2',
      path: '/productos'
    },
    {
      title: 'Nueva Orden',
      description: 'Crear una nueva orden de compra',
      icon: 'ShoppingCart',
      color: '#2e7d32',
      path: '/ordenes'
    },
    {
      title: 'Ver Inventario',
      description: 'Consultar el inventario actual',
      icon: 'Inventory',
      color: '#ed6c02',
      path: '/inventario'
    },
    {
      title: 'Ver Proveedores',
      description: 'Gestionar proveedores',
      icon: 'Business',
      color: '#9c27b0',
      path: '/proveedores'
    },
  ];

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [productos, proveedores, bodegas, ordenes, stockCritico, ordenesPendientes] = await Promise.all([
          productoService.getAll(),
          proveedorService.getAll(),
          inventarioService.getAllBodegas(),
          ordenCompraService.getAll(),
          inventarioService.getStockCritico(),
          ordenCompraService.getPendientes(),
        ]);

        setStats({
          totalProductos: productos.length,
          totalProveedores: proveedores.length,
          totalBodegas: bodegas.length,
          totalOrdenes: ordenes.length,
          stockCritico: stockCritico.length,
          ordenesPendientes: ordenesPendientes.length,
          productosActivos: productos.filter(p => p.estado === 'ACTIVO').length,
          proveedoresActivos: proveedores.filter(p => p.estado === 'ACTIVO').length,
          bodegasActivas: bodegas.length,
        });
        setLastUpdate(new Date());
        updateChartData();
        setRecentActivity(generateRecentActivity());
      } catch (error) {
        console.error('Error loading dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      handleRefresh();
    }, 30000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  if (loading) {
    return (
      <Box sx={{ width: '100%', p: 3 }}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Skeleton variant="text" width={200} height={40} sx={{ mb: 2 }} />
          <Skeleton variant="text" width={400} height={20} sx={{ mb: 4 }} />
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            {[1, 2, 3, 4].map((item) => (
              <Box key={item} sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '1 1 calc(25% - 18px)' } }}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: item * 0.1 }}
                >
                  <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 2 }} />
                </motion.div>
              </Box>
            ))}
          </Box>
        </motion.div>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
          📊 Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Vista general del sistema de gestión de inventario distribuido
        </Typography>
      </Box>

      {/* Tarjetas de estadísticas */}
      <Box 
        sx={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: 3, 
          mb: 4 
        }}
      >
        {[
          {
            title: 'Total Productos',
            value: stats.totalProductos,
            icon: <Inventory />,
            color: '#1976d2',
          },
          {
            title: 'Total Proveedores',
            value: stats.totalProveedores,
            icon: <Business />,
            color: '#2e7d32',
          },
          {
            title: 'Total Bodegas',
            value: stats.totalBodegas,
            icon: <Warehouse />,
            color: '#ed6c02',
          },
          {
            title: 'Total Órdenes',
            value: stats.totalOrdenes,
            icon: <ShoppingCart />,
            color: '#9c27b0',
          },
        ].map((card, index) => (
          <Box 
            key={index}
            sx={{ 
              flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '1 1 calc(25% - 18px)' },
              minWidth: { xs: '100%', sm: 'calc(50% - 12px)', md: 'calc(25% - 18px)' }
            }}
          >
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  p: 2,
                  color: 'white',
                  backgroundColor: card.color,
                  borderRadius: '0 0 0 16px',
                }}
              >
                {card.icon}
              </Box>
              <CardContent sx={{ flexGrow: 1, pt: 4 }}>
                <Typography variant="h4" component="div" gutterBottom>
                  {card.value}
                </Typography>
                <Typography variant="h6" color="text.secondary">
                  {card.title}
                </Typography>
              </CardContent>
            </Card>
          </Box>
        ))}
      </Box>

      {/* Alertas y estado */}
      <Box 
        sx={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: 3 
        }}
      >
        <Box 
          sx={{ 
            flex: { xs: '1 1 100%', md: '1 1 calc(50% - 12px)' },
            minWidth: { xs: '100%', md: 'calc(50% - 12px)' }
          }}
        >
          <Paper sx={{ p: 2 }}>
            <Box display="flex" alignItems="center" mb={2}>
              <Warning color="warning" sx={{ mr: 1 }} />
              <Typography variant="h6">Alertas</Typography>
            </Box>
            <List>
              {stats.stockCritico > 0 && (
                <ListItem>
                  <ListItemText
                    primary={`Stock Crítico`}
                    secondary={`${stats.stockCritico} productos con stock bajo`}
                  />
                  <Chip
                    label={stats.stockCritico}
                    color="warning"
                    size="small"
                  />
                </ListItem>
              )}
              {stats.ordenesPendientes > 0 && (
                <ListItem>
                  <ListItemText
                    primary={`Órdenes Pendientes`}
                    secondary={`${stats.ordenesPendientes} órdenes por procesar`}
                  />
                  <Chip
                    label={stats.ordenesPendientes}
                    color="info"
                    size="small"
                  />
                </ListItem>
              )}
              {stats.stockCritico === 0 && stats.ordenesPendientes === 0 && (
                <ListItem>
                  <ListItemText
                    primary="Sin alertas"
                    secondary="Todo está funcionando correctamente"
                  />
                  <Chip label="OK" color="success" size="small" />
                </ListItem>
              )}
            </List>
          </Paper>
        </Box>

        <Box 
          sx={{ 
            flex: { xs: '1 1 100%', md: '1 1 calc(50% - 12px)' },
            minWidth: { xs: '100%', md: 'calc(50% - 12px)' }
          }}
        >
          <Paper sx={{ p: 2 }}>
            <Box display="flex" alignItems="center" mb={2}>
              <TrendingUp color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">Resumen Rápido</Typography>
            </Box>
            <List>
              <ListItem>
                <ListItemText
                  primary="Productos Activos"
                  secondary="Total de productos en el sistema"
                />
                <Chip
                  label={stats.totalProductos}
                  color="primary"
                  size="small"
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Proveedores Activos"
                  secondary="Total de proveedores registrados"
                />
                <Chip
                  label={stats.totalProveedores}
                  color="success"
                  size="small"
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Bodegas Operativas"
                  secondary="Total de bodegas disponibles"
                />
                <Chip
                  label={stats.totalBodegas}
                  color="secondary"
                  size="small"
                />
              </ListItem>
            </List>
          </Paper>
        </Box>
      </Box>

      {/* Acciones Rápidas */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          Acciones Rápidas
        </Typography>
        <Box 
          sx={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: 2 
          }}
        >
          {quickActions.map((action, index) => (
            <Button
              key={index}
              variant="outlined"
              startIcon={getIconComponent(action.icon)}
              onClick={() => handleQuickAction(action.path)}
              sx={{
                borderColor: action.color,
                color: action.color,
                '&:hover': {
                  borderColor: action.color,
                  backgroundColor: alpha(action.color, 0.04),
                },
              }}
            >
              {action.title}
            </Button>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardPage;

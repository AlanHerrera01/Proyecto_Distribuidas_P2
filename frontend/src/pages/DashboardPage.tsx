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
} from '@mui/material';
import {
  Inventory,
  Business,
  Warehouse,
  ShoppingCart,
  TrendingUp,
  Warning,
} from '@mui/icons-material';
import { productoService, proveedorService, inventarioService, ordenCompraService } from '../services';

interface DashboardStats {
  totalProductos: number;
  totalProveedores: number;
  totalBodegas: number;
  totalOrdenes: number;
  stockCritico: number;
  ordenesPendientes: number;
}

const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalProductos: 0,
    totalProveedores: 0,
    totalBodegas: 0,
    totalOrdenes: 0,
    stockCritico: 0,
    ordenesPendientes: 0,
  });
  const [loading, setLoading] = useState(true);

  const statCards = [
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
  ];

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
        });
      } catch (error) {
        console.error('Error loading dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary" gutterBottom>
        Vista general del sistema de gestión de inventario
      </Typography>

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
    </Box>
  );
};

export default DashboardPage;

import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, CircularProgress } from '@mui/material';

import Layout from './components/Layout';

// Lazy loading para páginas pesadas
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const ProductosPage = lazy(() => import('./pages/ProductosPage'));
const ProveedoresPage = lazy(() => import('./pages/ProveedoresPage'));
const BodegasPage = lazy(() => import('./pages/BodegasPage'));
const InventarioPage = lazy(() => import('./pages/InventarioPage'));
const OrdenesCompraPage = lazy(() => import('./pages/OrdenesCompraPage'));

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    allVariants: {
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    },
  },
});

// Componente de carga optimizado
const LoadingSpinner = () => (
  <Box
    display="flex"
    justifyContent="center"
    alignItems="center"
    minHeight="60vh"
  >
    <CircularProgress size={40} />
  </Box>
);

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{ display: 'flex' }}>
          <Layout>
            <Suspense fallback={<LoadingSpinner />}>
              <Routes>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/productos" element={<ProductosPage />} />
                <Route path="/proveedores" element={<ProveedoresPage />} />
                <Route path="/bodegas" element={<BodegasPage />} />
                <Route path="/inventario" element={<InventarioPage />} />
                <Route path="/ordenes-compra" element={<OrdenesCompraPage />} />
              </Routes>
            </Suspense>
          </Layout>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;

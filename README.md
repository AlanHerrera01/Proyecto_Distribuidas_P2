


<div align="center">
   <h2>INFORME DE PROYECTO PARCIAL 2</h2>
   <h1>SISTEMA DE GESTIÓN DE INVENTARIO Y ÓRDENES DE COMPRA</h1>
   <p><strong>Universidad de las Fuerzas Armadas ESPE</strong></p>
   <p><strong>Autores:</strong> Arico Cesar, Herrera Alan, Suquillo Fernando</p>
   <p><strong>Fecha:</strong> 17 de Noviembre de 2025</p>
   <p><strong>Ubicación:</strong> Sangolquí - Pichincha</p>
</div>

---
## Descripción General

Este proyecto es un prototipo funcional de un **Sistema de Gestión de Inventario y Órdenes de Compra** para una empresa de importación y distribución nacional de productos. El sistema permite administrar de forma integrada:

- Catálogo de productos
- Proveedores
- Inventario en múltiples bodegas
- Creación, aprobación y recepción de órdenes de compra
- Actualización automática de stock
- Reportes básicos de abastecimiento

La solución está construida bajo una **arquitectura de microservicios**, permitiendo que cada dominio de negocio evolucione y escale de manera independiente. Incluye un frontend SPA desarrollado en React y microservicios backend en Java 17 + Spring Boot 3, cada uno con su propia base de datos y contenedorizados con Docker.


## Arquitectura del Sistema
Arquitectura de microservicios: cada dominio de negocio es un servicio independiente, con su propia base de datos y APIs RESTful. El frontend es una SPA en React.

---

## Principales Funcionalidades

- **Gestión de Productos**: CRUD de productos, consulta de catálogo.
- **Gestión de Proveedores**: CRUD de proveedores, historial de compras por proveedor.
- **Gestión de Inventario**: Consulta y actualización de stock en bodegas.
- **Gestión de Órdenes de Compra**: Creación, aprobación, recepción y actualización automática de inventario.
- **Reportes**: Productos críticos, historial de compras, gastos por proveedor.

---

## Estructura del Proyecto

- **frontend/**: SPA en React para la gestión y visualización de datos.
- **producto-service/**: Microservicio para la gestión de productos.
- **proveedor-service/**: Microservicio para la gestión de proveedores.
- **inventario-service/**: Microservicio para la gestión de inventarios.
- **compras-service/**: Microservicio para la gestión de órdenes de compra.
- **docs/**: Documentación técnica y de arquitectura.

---

## Requisitos Técnicos

### Backend
- Arquitectura de microservicios
- Java 17 + Spring Boot 3
- Base de datos por microservicio (database-per-service)
- APIs RESTful
- Dockerfile por microservicio
- docker-compose.yml para orquestación
- Manejo centralizado de errores con `@RestControllerAdvice`
- Validaciones en DTO/entidades (campos obligatorios, formatos, números positivos)
- Códigos HTTP correctos (200, 201, 400, 404, 409, etc.)

### Frontend
- SPA en React
- Consumo de APIs REST vía HTTP/JSON
- Manejo de rutas y navegación
- Componentes reutilizables (tablas, formularios, diálogos)
- Manejo básico de estado (hooks/context)
- Manejo claro de errores y feedback visual (loaders, alertas)

---

## Despliegue y Ejecución

1. **Clonar el repositorio**
2. **Construir los microservicios**:
   - Navegar a cada carpeta de microservicio y ejecutar:
     ```
     mvn clean package
     ```
3. **Construir las imágenes Docker**:
   - Desde la raíz del proyecto:
     ```
     docker-compose build
     ```
4. **Levantar el sistema completo**:
   - Desde la raíz del proyecto:
     ```
     docker-compose up
     ```
5. **Acceder al frontend**:
   - Abrir el navegador en `http://localhost:3000` (o el puerto configurado)

---

## Decisiones Arquitectónicas y Técnicas

- **Microservicios**: Cada dominio (productos, proveedores, inventario, compras) es un microservicio independiente.
- **Database-per-service**: Cada microservicio tiene su propia base de datos para garantizar independencia y escalabilidad.
- **Docker**: Todo el sistema es contenedorizado para facilitar despliegue y portabilidad.
- **SPA**: El frontend es una aplicación de página única para mejor experiencia de usuario.
- **Buenas prácticas**: Validaciones, manejo de errores, estructura por capas/features y feedback visual.

---
## Autores
- Arico Cesar
- Herrera Alan
- Suquillo Fernando
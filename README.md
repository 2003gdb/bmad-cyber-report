# SafeTrade - Sistema de Reportes de Ciberseguridad

SafeTrade es una plataforma integral para reportes de incidentes de ciberseguridad que permite a usuarios reportar amenazas de forma segura, tanto identificados como anónimos, proporcionando análisis comunitarios y herramientas administrativas.

## 🏗️ Arquitectura del Proyecto

Este proyecto utiliza una arquitectura de monorepo con las siguientes tecnologías:

### 📦 Paquetes

- **`packages/backend/`** - API NestJS (Puerto 3000)
  - Framework: NestJS 10.2.0
  - Base de datos: SQL Server Express 2019
  - Autenticación: JWT + bcrypt con salt único por usuario
  - ORM: Sequelize

- **`packages/admin-portal/`** - Portal de Administración Next.js (Puerto 3001)
  - Framework: Next.js 13.4.0 con App Router
  - UI: Tailwind CSS
  - Idioma: Español

- **`packages/mobile/`** - Aplicación iOS SwiftUI
  - Framework: SwiftUI para iOS 14+
  - Lenguaje: Swift 5.8+
  - Patrón: MVVM con async/await

- **`shared/`** - Tipos y utilidades compartidas
  - Tipos TypeScript compartidos
  - Constantes de API y endpoints
  - Utilidades de validación

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js 18.17.0+
- npm 9.0.0+
- SQL Server Express 2019 (configurado y ejecutándose)
- Xcode 14.0+ (para desarrollo iOS)

### Instalación

1. **Configurar el proyecto:**
   ```bash
   ./scripts/setup.sh
   ```

2. **Configurar variables de entorno:**
   ```bash
   # Backend
   cp packages/backend/.env.example packages/backend/.env
   # Editar packages/backend/.env con credenciales de base de datos
   
   # Admin Portal
   cp packages/admin-portal/.env.local.example packages/admin-portal/.env.local
   ```

3. **Iniciar servidores de desarrollo:**
   ```bash
   npm run dev
   ```

4. **Configurar proyecto iOS:**
   - Ver instrucciones en `packages/mobile/README.md`

## 🔧 Scripts Disponibles

- `npm run dev` - Iniciar todos los servidores de desarrollo
- `npm run build` - Construir todos los paquetes
- `npm run test` - Ejecutar todas las pruebas
- `./scripts/setup.sh` - Configuración inicial del proyecto

## 📚 Endpoints de API

### Autenticación
- `POST /api/v1/auth/login` - Iniciar sesión
- `POST /api/v1/auth/register` - Registrar usuario

### Reportes (Español)
- `POST /api/v1/reportes` - Crear reporte
- `GET /api/v1/reportes` - Listar reportes
- `PUT /api/v1/reportes/:id/estado` - Actualizar estado de reporte

### Tendencias Comunitarias (Español)
- `GET /api/v1/tendencias-comunidad/tendencias` - Obtener tendencias
- `GET /api/v1/tendencias-comunidad/recomendaciones` - Recomendaciones

## 🔒 Características de Seguridad

- **Privacidad de Reportes Anónimos:** Sin registro de información personal
- **Autenticación Robusta:** JWT + bcrypt con salt único por usuario  
- **Validación de Archivos:** Verificación MIME type y límites de tamaño
- **Mensajes en Español:** Todos los mensajes de error en español
- **Prevención SQL Injection:** Uso exclusivo de queries parametrizadas

## 🧪 Testing

### Backend
```bash
cd packages/backend
npm run test        # Pruebas unitarias
npm run test:e2e    # Pruebas end-to-end
npm run test:cov    # Cobertura de código
```

### iOS
- Usar XCTest en Xcode con Cmd+U
- Archivos de prueba: `*Tests.swift`

## 📁 Estructura del Proyecto

```
safetrade-monorepo/
├── packages/
│   ├── backend/           # API NestJS
│   ├── admin-portal/      # Portal Next.js
│   └── mobile/           # App iOS SwiftUI
├── shared/               # Tipos compartidos
├── scripts/             # Scripts de automatización
├── docs/               # Documentación del proyecto
└── .github/workflows/  # CI/CD con GitHub Actions
```

## 🚀 CI/CD

El proyecto utiliza GitHub Actions para:
- Pruebas automatizadas en cada push/PR
- Verificación de tipos y linting
- Construcción de artefactos de producción
- Pruebas con base de datos SQL Server

## 📄 Licencia

MIT License - Ver archivo LICENSE para detalles.

## 👥 Equipo

Desarrollado por el equipo SafeTrade para el curso de Desarrollo de Aplicaciones Móviles.
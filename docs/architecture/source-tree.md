# Source Tree

This document describes the actual implemented source tree structure for SafeTrade's restructured backend.

## Overview

The backend follows the **modular repository pattern** with:
- **Controller → Service → Repository** separation
- **Spanish module names** for localization
- **Direct MySQL queries** (no ORM)
- **Module reuse** in AdminModule

## Current Implementation Structure

```
bmad-cyber-report/
├── packages/
│   ├── backend/                           # NestJS API Server
│   │   ├── src/
│   │   │   ├── auth/                      # AuthModule - Triple authentication
│   │   │   │   ├── auth.controller.ts     # User/admin login endpoints
│   │   │   │   ├── auth.service.ts        # Authentication logic
│   │   │   │   ├── auth.module.ts         # Module definition
│   │   │   │   ├── token.service.ts       # JWT token management
│   │   │   │   └── admin.repository.ts    # Admin user database operations
│   │   │   ├── users/                     # UsersModule - Repository pattern
│   │   │   │   ├── users.controller.ts    # User registration, profile
│   │   │   │   ├── users.service.ts       # User business logic
│   │   │   │   ├── users.repository.ts    # User database operations
│   │   │   │   └── users.module.ts        # Module definition
│   │   │   ├── reportes/                  # ReportesModule - Spanish endpoints
│   │   │   │   ├── reportes.controller.ts # POST /reportes, GET /reportes/:id
│   │   │   │   ├── reportes.service.ts    # Report business logic + recommendations
│   │   │   │   ├── reportes.repository.ts # Report database operations
│   │   │   │   ├── reportes.module.ts     # Module definition
│   │   │   │   └── dto/
│   │   │   │       └── crear-reporte.dto.ts # Spanish DTOs
│   │   │   ├── comunidad/                 # ComunidadModule - Spanish endpoints
│   │   │   │   ├── comunidad.controller.ts # GET /comunidad/tendencias, etc.
│   │   │   │   ├── comunidad.service.ts   # Community intelligence + translations
│   │   │   │   ├── comunidad.repository.ts # Community analytics database
│   │   │   │   └── comunidad.module.ts    # Module definition
│   │   │   ├── admin/                     # AdminModule - Reuses services
│   │   │   │   ├── admin.controller.ts    # GET /admin/users/list, /admin/users/:id
│   │   │   │   ├── admin.service.ts       # Reuses UsersService + ReportesService
│   │   │   │   ├── admin.repository.ts    # Admin-specific database operations
│   │   │   │   └── admin.module.ts        # Imports UsersModule, AuthModule
│   │   │   ├── common/                    # Shared guards and interfaces
│   │   │   │   ├── guards/
│   │   │   │   │   ├── jwt-auth.guard.ts      # Standard JWT guard
│   │   │   │   │   ├── admin-auth.guard.ts    # Admin-only access guard
│   │   │   │   │   └── anonymous-auth.guard.ts # Anonymous + auth access
│   │   │   │   └── interfaces/
│   │   │   │       └── authenticated-request.ts # Request types
│   │   │   ├── db/                        # Database module
│   │   │   │   ├── db.module.ts           # Global database module
│   │   │   │   └── db.service.ts          # MySQL connection pool
│   │   │   ├── util/                      # Utility functions
│   │   │   │   └── hash/
│   │   │   │       └── hash.util.ts       # Password hashing
│   │   │   ├── app.module.ts              # Root NestJS module
│   │   │   ├── app.controller.ts          # Health checks
│   │   │   ├── app.service.ts             # Basic app services
│   │   │   └── main.ts                    # Application entry point + Swagger
│   │   ├── database/                      # MySQL schema and setup
│   │   │   └── safetrade_schema.sql       # Complete MySQL schema
│   │   ├── uploads/                       # File upload storage
│   │   │   └── temp/                      # Temporary upload processing
│   │   ├── test/                          # E2E tests
│   │   │   ├── app.e2e-spec.ts            # Application tests
│   │   │   └── jest-e2e.json              # Jest E2E configuration
│   │   ├── package.json                   # Dependencies and scripts
│   │   ├── tsconfig.json                  # TypeScript configuration
│   │   ├── nest-cli.json                  # NestJS CLI configuration
│   │   ├── .env.example                   # Environment template
│   │   └── README.md                      # Backend documentation
│   │
├── docs/                                  # Project documentation
│   ├── prd.md                            # Product Requirements Document
│   ├── architecture/                     # Architecture documentation
│   │   ├── high-level-architecture.md    # This architecture document
│   │   ├── database-schema.md            # MySQL database schema
│   │   ├── source-tree.md                # This source tree document
│   │   └── rest-api-spec.md              # API specification
│   └── stories/                          # User stories and development tasks
└── README.md                             # Main project documentation
```

## Key Implementation Features

### Module Organization
- **AuthModule**: Triple authentication (anonymous, user, admin)
- **UsersModule**: Repository pattern for user management 
- **ReportesModule**: Spanish endpoints for incident reporting
- **ComunidadModule**: Community intelligence with Spanish translations
- **AdminModule**: Reuses existing services for DRY principle

### Spanish Localization
- Module names: `reportes/`, `comunidad/`
- Endpoint paths: `/reportes`, `/comunidad/tendencias`
- DTOs with Spanish validation messages
- Database with Spanish ENUM values

### Architecture Benefits
- **Performance**: Direct MySQL queries without ORM overhead
- **Maintainability**: Clear Controller → Service → Repository pattern
- **Reusability**: AdminModule imports and reuses existing services
- **Security**: Separate guards for different authentication levels
- **Scalability**: Modular structure ready for microservice migration

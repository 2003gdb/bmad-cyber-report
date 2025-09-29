# Migración de Base de Datos - Resumen General

## Objetivo

Migrar de un esquema de base de datos con ENUMs a un esquema normalizado con tablas de catálogo y foreign keys para mejorar escalabilidad, mantenibilidad y flexibilidad del sistema SafeTrade.

## Cambios Principales

### Base de Datos

#### Antes (ENUMs):
```sql
CREATE TABLE reportes (
    attack_type ENUM('email', 'SMS', 'whatsapp', 'llamada', 'redes_sociales', 'otro'),
    impact_level ENUM('ninguno', 'robo_datos', 'robo_dinero', 'cuenta_comprometida'),
    status ENUM('nuevo', 'revisado', 'en_investigacion', 'cerrado')
);
```

#### Después (Normalizado):
```sql
-- Tablas de catálogo
CREATE TABLE attack_types (id INT PRIMARY KEY, name VARCHAR(100));
CREATE TABLE impacts (id INT PRIMARY KEY, name VARCHAR(100));
CREATE TABLE status (id INT PRIMARY KEY, name VARCHAR(100));

-- Tabla principal con foreign keys
CREATE TABLE reports (
    attack_type INT REFERENCES attack_types(id),
    impact INT REFERENCES impacts(id),
    status INT REFERENCES status(id)
);
```

### APIs

#### Antes:
```json
{
  "attack_type": "email",
  "impact_level": "robo_datos",
  "status": "nuevo"
}
```

#### Después:
```json
{
  "attack_type": 1,
  "impact": 2,
  "status": 1
}
```

### Frontend (Mapeo automático)
- Los IDs se mapean automáticamente a nombres legibles
- Nuevos endpoints de catálogos: `GET /reportes/catalogs`
- Caché de catálogos para performance

## Beneficios

1. **Escalabilidad**: Fácil agregar nuevos tipos sin cambios de esquema
2. **Consistencia**: Gestión centralizada de valores
3. **Performance**: Mejor optimización de queries con foreign keys
4. **Mantenibilidad**: Sin cambios de código para nuevos valores
5. **Internacionalización**: Soporte futuro para múltiples idiomas

## Impacto por Componente

### Backend (NestJS)
- ✅ **Sin cambios de endpoints**: Mismas rutas existentes
- ✅ **Conversión automática**: APIs manejan mapeo ID ↔ string
- ✅ **Nuevo endpoint**: `/reportes/catalogs` para obtener catálogos
- ✅ **Compatibilidad**: Mantiene funcionamiento actual

### Admin Portal (Next.js)
- ✅ **Sin cambios visuales**: Misma experiencia de usuario
- ✅ **Mapeo automático**: IDs se convierten a nombres para display
- ✅ **Nuevos hooks**: `useCatalogs()` para gestión de catálogos
- ✅ **Caché inteligente**: Catálogos se cachean automáticamente

### Mobile App (iOS)
- ✅ **Sin cambios de UI**: Mismas pantallas y flujos
- ✅ **Nuevos modelos**: Estructuras Swift actualizadas
- ✅ **Caché local**: Catálogos se almacenan localmente
- ✅ **Mapeo automático**: IDs se muestran como nombres legibles

## Cronograma de Implementación

### Fase 1: Base de Datos (1 día)
- Ejecutar scripts SQL de migración
- Validar integridad de datos
- Backup completo del sistema

### Fase 2: Backend (2 días)
- Implementar repositorios con nueva estructura
- Mantener compatibilidad con APIs existentes
- Agregar endpoint de catálogos

### Fase 3: Frontend (2 días)
- Actualizar admin portal para usar catálogos
- Implementar caché de catálogos
- Testing de experiencia de usuario

### Fase 4: Mobile (2 días)
- Actualizar modelos Swift
- Implementar caché local de catálogos
- Testing en dispositivos

### Fase 5: Testing Final (1 día)
- Testing integración completa
- Validación de performance
- Documentación final

## Riesgos y Mitigaciones

### Riesgo: Pérdida de datos
- **Mitigación**: Backup completo antes de migración
- **Plan B**: Scripts de rollback preparados

### Riesgo: Downtime del sistema
- **Mitigación**: Migración en horario de menor uso
- **Plan B**: Despliegue gradual por módulos

### Riesgo: Performance degraded
- **Mitigación**: Índices apropiados en foreign keys
- **Plan B**: Optimización de queries post-migración

## Validación Post-Migración

### Criterios de Éxito:
1. ✅ Todos los reportes migrados correctamente
2. ✅ APIs responden con misma funcionalidad
3. ✅ Frontend muestra datos correctamente
4. ✅ Mobile app funciona sin cambios visibles
5. ✅ Performance mantiene < 2 segundos de respuesta

### Métricas a Monitorear:
- Tiempo de respuesta de APIs
- Uso de memoria en frontend
- Tiempo de carga de catálogos
- Errores en logs del sistema

## Contacto y Soporte

Para preguntas sobre la migración:
- **Documentación técnica**: Ver archivos de migración por carpeta
- **Scripts SQL**: `docs/migration-database-plan.md`
- **Backend**: `packages/backend/MIGRATION-BACKEND.md`
- **Admin Portal**: `packages/admin-portal/MIGRATION-FRONTEND.md`
- **Mobile**: `packages/mobile/MIGRATION-MOBILE.md`
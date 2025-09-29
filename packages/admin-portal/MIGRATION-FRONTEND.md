# Migración Admin Portal - Next.js Frontend

## Contexto para Agente de Claude Code - Carpeta packages/admin-portal/

Este documento proporciona el contexto completo para que un agente de Claude Code trabaje específicamente en la migración del portal administrativo (Next.js) para soportar la nueva estructura de base de datos normalizada.

## Objetivo

Adaptar el frontend administrativo para trabajar con los nuevos endpoints del backend que usan IDs de catálogo en lugar de strings de ENUMs, manteniendo la experiencia de usuario actual.

## Arquitectura Actual vs. Nueva

### Actual:
- Componentes que esperan strings (`'email', 'SMS'`)
- Filtros y dropdowns con valores hardcodeados
- Servicios API que envían/reciben ENUMs como strings

### Nueva:
- Componentes que trabajan con IDs pero muestran nombres legibles
- Filtros y dropdowns populados desde endpoints de catálogo
- Servicios API que manejan conversión ID ↔ nombre automáticamente
- Caché de datos de catálogo para performance

## Archivos a Modificar

### 1. Tipos TypeScript

#### `src/types/normalized.types.ts` (YA EXISTE - IMPLEMENTAR)
El archivo ya existe con la estructura nueva. Implementar su uso:

```typescript
// Interfaces ya definidas - USAR ESTAS:
export interface AttackType {
  id: number;
  name: string;
  created_at: Date;
}

export interface Impact {
  id: number;
  name: string;
  created_at: Date;
}

export interface Status {
  id: number;
  name: string;
  created_at: Date;
}

export interface NormalizedReport {
  id: number;
  user_id: number | null;
  is_anonymous: boolean;
  attack_type: number; // ID en lugar de string
  incident_date: Date;
  evidence_url: string | null;
  attack_origin: string | null;
  suspicious_url: string | null;
  message_content: string | null;
  description: string | null;
  impact: number; // ID en lugar de string
  status: number; // ID en lugar de string
  admin_notes: string | null;
  created_at: Date;
  updated_at: Date;
}

// Tipo extendido con nombres legibles para UI
export interface ReportWithCatalogNames extends NormalizedReport {
  attack_type_name: string;
  impact_name: string;
  status_name: string;
  user_name?: string;
  user_email?: string;
}
```

#### Crear `src/types/catalog.types.ts`
```typescript
export interface CatalogData {
  attackTypes: AttackType[];
  impacts: Impact[];
  statuses: Status[];
}

export interface CatalogMaps {
  attackTypeMap: Map<number, string>;
  impactMap: Map<number, string>;
  statusMap: Map<number, string>;
  // Mapas inversos para búsquedas por nombre
  attackTypeNameMap: Map<string, number>;
  impactNameMap: Map<string, number>;
  statusNameMap: Map<string, number>;
}
```

### 2. Servicios

#### `src/services/AdminAPIService.ts`
**Cambios principales:**

```typescript
export class AdminAPIService {
  private catalogCache: CatalogData | null = null;
  private catalogMaps: CatalogMaps | null = null;

  // Nuevo método para cargar catálogos
  async getCatalogs(): Promise<CatalogData> {
    if (this.catalogCache) {
      return this.catalogCache;
    }

    const response = await fetch(`${this.baseURL}/reportes/catalogs`);
    const data = await response.json();

    this.catalogCache = data;
    this.catalogMaps = this.createCatalogMaps(data);

    return data;
  }

  private createCatalogMaps(catalogs: CatalogData): CatalogMaps {
    return {
      attackTypeMap: new Map(catalogs.attackTypes.map(at => [at.id, at.name])),
      impactMap: new Map(catalogs.impacts.map(i => [i.id, i.name])),
      statusMap: new Map(catalogs.statuses.map(s => [s.id, s.name])),
      attackTypeNameMap: new Map(catalogs.attackTypes.map(at => [at.name, at.id])),
      impactNameMap: new Map(catalogs.impacts.map(i => [i.name, i.id])),
      statusNameMap: new Map(catalogs.statuses.map(s => [s.name, s.id]))
    };
  }

  // Método helper para obtener nombre por ID
  getAttackTypeName(id: number): string {
    return this.catalogMaps?.attackTypeMap.get(id) || 'Desconocido';
  }

  getImpactName(id: number): string {
    return this.catalogMaps?.impactMap.get(id) || 'Desconocido';
  }

  getStatusName(id: number): string {
    return this.catalogMaps?.statusMap.get(id) || 'Desconocido';
  }

  // Métodos existentes adaptados
  async getReports(filters: ReportFilters = {}): Promise<{ reports: ReportWithCatalogNames[], total: number }> {
    // Asegurar que los catálogos estén cargados
    await this.getCatalogs();

    const queryParams = new URLSearchParams();

    // Convertir filtros de nombres a IDs si es necesario
    if (filters.attack_type && typeof filters.attack_type === 'string') {
      const attackTypeId = this.catalogMaps?.attackTypeNameMap.get(filters.attack_type);
      if (attackTypeId) {
        queryParams.append('attack_type', attackTypeId.toString());
      }
    } else if (filters.attack_type && typeof filters.attack_type === 'number') {
      queryParams.append('attack_type', filters.attack_type.toString());
    }

    // Similar para otros filtros...

    const response = await fetch(`${this.baseURL}/reportes?${queryParams}`);
    const data = await response.json();

    // Enriquecer reportes con nombres de catálogo si no vienen del backend
    const enrichedReports = data.reports.map((report: NormalizedReport) => ({
      ...report,
      attack_type_name: this.getAttackTypeName(report.attack_type),
      impact_name: this.getImpactName(report.impact),
      status_name: this.getStatusName(report.status)
    }));

    return { reports: enrichedReports, total: data.total };
  }

  async getReportStats(): Promise<ReportStats> {
    await this.getCatalogs();

    const response = await fetch(`${this.baseURL}/admin/stats`);
    const data = await response.json();

    // Convertir stats que usan IDs a nombres legibles
    if (data.attackTypeBreakdown) {
      data.attackTypeBreakdown = data.attackTypeBreakdown.map((item: any) => ({
        ...item,
        name: this.getAttackTypeName(item.attack_type || item.id)
      }));
    }

    return data;
  }

  // Nuevo método para crear reporte con v2 API
  async createReportV2(reportData: CreateReportV2Data): Promise<NormalizedReport> {
    const response = await fetch(`${this.baseURL}/reportes/v2`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reportData)
    });

    if (!response.ok) {
      throw new Error('Failed to create report');
    }

    return response.json();
  }

  // Método helper para refrescar caché
  async refreshCatalogs(): Promise<void> {
    this.catalogCache = null;
    this.catalogMaps = null;
    await this.getCatalogs();
  }
}
```

#### Crear `src/services/CatalogService.ts`
```typescript
import { AdminAPIService } from './AdminAPIService';

export class CatalogService {
  constructor(private apiService: AdminAPIService) {}

  async getAttackTypes(): Promise<AttackType[]> {
    const catalogs = await this.apiService.getCatalogs();
    return catalogs.attackTypes;
  }

  async getImpacts(): Promise<Impact[]> {
    const catalogs = await this.apiService.getCatalogs();
    return catalogs.impacts;
  }

  async getStatuses(): Promise<Status[]> {
    const catalogs = await this.apiService.getCatalogs();
    return catalogs.statuses;
  }

  // Método para obtener opciones de dropdown
  async getAttackTypeOptions(): Promise<Array<{ value: number; label: string }>> {
    const attackTypes = await this.getAttackTypes();
    return attackTypes.map(at => ({ value: at.id, label: at.name }));
  }

  async getImpactOptions(): Promise<Array<{ value: number; label: string }>> {
    const impacts = await this.getImpacts();
    return impacts.map(i => ({ value: i.id, label: i.name }));
  }

  async getStatusOptions(): Promise<Array<{ value: number; label: string }>> {
    const statuses = await this.getStatuses();
    return statuses.map(s => ({ value: s.id, label: s.name }));
  }
}
```

### 3. Hooks Personalizados

#### Crear `src/hooks/useCatalogs.ts`
```typescript
import { useState, useEffect } from 'react';
import { AdminAPIService } from '../services/AdminAPIService';
import { CatalogData } from '../types/catalog.types';

export const useCatalogs = () => {
  const [catalogs, setCatalogs] = useState<CatalogData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCatalogs = async () => {
      try {
        setLoading(true);
        const apiService = new AdminAPIService();
        const data = await apiService.getCatalogs();
        setCatalogs(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading catalogs');
      } finally {
        setLoading(false);
      }
    };

    loadCatalogs();
  }, []);

  return { catalogs, loading, error };
};
```

#### Crear `src/hooks/useReports.ts`
```typescript
import { useState, useEffect } from 'react';
import { AdminAPIService } from '../services/AdminAPIService';
import { ReportWithCatalogNames } from '../types/normalized.types';

export const useReports = (filters: ReportFilters = {}) => {
  const [reports, setReports] = useState<ReportWithCatalogNames[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadReports = async () => {
      try {
        setLoading(true);
        const apiService = new AdminAPIService();
        const data = await apiService.getReports(filters);
        setReports(data.reports);
        setTotal(data.total);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading reports');
      } finally {
        setLoading(false);
      }
    };

    loadReports();
  }, [JSON.stringify(filters)]); // Re-run when filters change

  return { reports, total, loading, error, refetch: () => loadReports() };
};
```

### 4. Componentes

#### `src/components/Dashboard/AttackTypesChart.tsx`
**Cambios principales:**

```typescript
import { useCatalogs } from '../../hooks/useCatalogs';

export default function AttackTypesChart() {
  const { catalogs, loading: catalogsLoading } = useCatalogs();
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!catalogs) return;

      try {
        const apiService = new AdminAPIService();
        const stats = await apiService.getReportStats();

        // Convertir datos de backend (IDs) a nombres para el chart
        const data = stats.attackTypeBreakdown.map((item: any) => ({
          name: catalogs.attackTypes.find(at => at.id === item.attack_type)?.name || 'Desconocido',
          value: item.count,
          id: item.attack_type
        }));

        setChartData(data);
      } catch (error) {
        console.error('Error loading attack types data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [catalogs]);

  if (catalogsLoading || loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="chart-container">
      <h3>Tipos de Ataque</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={80}
            fill="#8884d8"
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          />
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
```

#### `src/components/Dashboard/StatusChart.tsx`
**Cambios similares a AttackTypesChart:**

```typescript
// Similar pattern - usar useCatalogs hook
// Mapear IDs de status a nombres para display
// Mantener funcionalidad de filtros pero con IDs
```

#### `src/components/Dashboard/ImpactChart.tsx`
**Cambios similares:**

```typescript
// Usar catalogs.impacts para mapear IDs a nombres
// Actualizar lógica de colores basada en nombres conocidos
```

#### Crear `src/components/Filters/CatalogFilter.tsx`
```typescript
interface CatalogFilterProps {
  type: 'attackTypes' | 'impacts' | 'statuses';
  value: number | null;
  onChange: (value: number | null) => void;
  placeholder?: string;
}

export function CatalogFilter({ type, value, onChange, placeholder }: CatalogFilterProps) {
  const { catalogs, loading } = useCatalogs();

  if (loading) {
    return <select disabled><option>Cargando...</option></select>;
  }

  const options = catalogs?.[type] || [];

  return (
    <select
      value={value || ''}
      onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
      className="filter-select"
    >
      <option value="">{placeholder || 'Todos'}</option>
      {options.map(option => (
        <option key={option.id} value={option.id}>
          {option.name}
        </option>
      ))}
    </select>
  );
}
```

#### `src/components/Pagination.tsx`
**Ajustes menores:** Mantener funcionalidad actual, no necesita cambios significativos.

### 5. Páginas

#### `src/app/dashboard/page.tsx`
**Cambios principales:**

```typescript
'use client';

import { useCatalogs } from '../../hooks/useCatalogs';
import { useReports } from '../../hooks/useReports';

export default function Dashboard() {
  const { catalogs, loading: catalogsLoading } = useCatalogs();
  const { reports, loading: reportsLoading } = useReports({ limit: 10 });

  // Pre-cargar catálogos al montar la página
  useEffect(() => {
    if (catalogs) {
      console.log('Catálogos cargados:', catalogs);
    }
  }, [catalogs]);

  if (catalogsLoading) {
    return (
      <div className="loading-container">
        <LoadingSpinner />
        <p>Cargando configuración...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <h1>Dashboard Administrativo</h1>

      {/* Componentes de gráficos - ahora usan catálogos */}
      <div className="charts-grid">
        <AttackTypesChart />
        <ImpactChart />
        <StatusChart />
        <TrendsChart />
      </div>

      {/* Lista de reportes recientes */}
      <div className="recent-reports">
        <h2>Reportes Recientes</h2>
        {reportsLoading ? (
          <LoadingSpinner />
        ) : (
          <ReportsTable reports={reports} />
        )}
      </div>
    </div>
  );
}
```

#### `src/app/reports/[id]/page.tsx`
**Cambios principales:**

```typescript
export default function ReportDetailPage({ params }: { params: { id: string } }) {
  const { catalogs } = useCatalogs();
  const [report, setReport] = useState<ReportWithCatalogNames | null>(null);

  useEffect(() => {
    const loadReport = async () => {
      const apiService = new AdminAPIService();
      const reportData = await apiService.getReportById(Number(params.id));

      // Enriquecer con nombres de catálogo si no vienen del backend
      const enrichedReport = {
        ...reportData,
        attack_type_name: catalogs?.attackTypes.find(at => at.id === reportData.attack_type)?.name,
        impact_name: catalogs?.impacts.find(i => i.id === reportData.impact)?.name,
        status_name: catalogs?.statuses.find(s => s.id === reportData.status)?.name
      };

      setReport(enrichedReport);
    };

    if (catalogs) {
      loadReport();
    }
  }, [params.id, catalogs]);

  return (
    <div className="report-detail">
      <h1>Reporte #{params.id}</h1>

      {report && (
        <div className="report-info">
          <div className="field">
            <label>Tipo de Ataque:</label>
            <span>{report.attack_type_name}</span>
          </div>

          <div className="field">
            <label>Impacto:</label>
            <span>{report.impact_name}</span>
          </div>

          <div className="field">
            <label>Estado:</label>
            <span>{report.status_name}</span>
          </div>

          {/* Resto de campos del reporte */}
        </div>
      )}
    </div>
  );
}
```

### 6. Utilidades

#### Crear `src/utils/catalogUtils.ts`
```typescript
import { CatalogData } from '../types/catalog.types';

export class CatalogUtils {
  static createLookupMaps(catalogs: CatalogData) {
    return {
      attackTypeById: new Map(catalogs.attackTypes.map(at => [at.id, at.name])),
      impactById: new Map(catalogs.impacts.map(i => [i.id, i.name])),
      statusById: new Map(catalogs.statuses.map(s => [s.id, s.name])),
      attackTypeByName: new Map(catalogs.attackTypes.map(at => [at.name, at.id])),
      impactByName: new Map(catalogs.impacts.map(i => [i.name, i.id])),
      statusByName: new Map(catalogs.statuses.map(s => [s.name, s.id]))
    };
  }

  static getDisplayName(
    catalogs: CatalogData,
    type: 'attackTypes' | 'impacts' | 'statuses',
    id: number
  ): string {
    const item = catalogs[type].find(item => item.id === id);
    return item?.name || 'Desconocido';
  }

  static getId(
    catalogs: CatalogData,
    type: 'attackTypes' | 'impacts' | 'statuses',
    name: string
  ): number | null {
    const item = catalogs[type].find(item => item.name === name);
    return item?.id || null;
  }

  // Convertir reporte legacy a formato normalizado
  static convertLegacyReport(legacyReport: any, catalogs: CatalogData): NormalizedReport {
    return {
      ...legacyReport,
      attack_type: this.getId(catalogs, 'attackTypes', legacyReport.attack_type) || 1,
      impact: this.getId(catalogs, 'impacts', legacyReport.impact_level) || 1,
      status: this.getId(catalogs, 'statuses', legacyReport.status) || 1,
      incident_date: new Date(`${legacyReport.incident_date} ${legacyReport.incident_time || '00:00:00'}`),
      evidence_url: legacyReport.suspicious_url
    };
  }
}
```

### 7. Context Provider

#### Crear `src/contexts/CatalogContext.tsx`
```typescript
import React, { createContext, useContext, useEffect, useState } from 'react';
import { CatalogData } from '../types/catalog.types';
import { AdminAPIService } from '../services/AdminAPIService';

interface CatalogContextType {
  catalogs: CatalogData | null;
  loading: boolean;
  error: string | null;
  refreshCatalogs: () => Promise<void>;
}

const CatalogContext = createContext<CatalogContextType | undefined>(undefined);

export function CatalogProvider({ children }: { children: React.ReactNode }) {
  const [catalogs, setCatalogs] = useState<CatalogData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCatalogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const apiService = new AdminAPIService();
      const data = await apiService.getCatalogs();
      setCatalogs(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading catalogs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCatalogs();
  }, []);

  const refreshCatalogs = async () => {
    await loadCatalogs();
  };

  return (
    <CatalogContext.Provider value={{ catalogs, loading, error, refreshCatalogs }}>
      {children}
    </CatalogContext.Provider>
  );
}

export function useCatalogContext() {
  const context = useContext(CatalogContext);
  if (context === undefined) {
    throw new Error('useCatalogContext must be used within a CatalogProvider');
  }
  return context;
}
```

## Plan de Implementación

### Fase 1: Preparación
1. Verificar que backend tiene endpoints de catálogo funcionando
2. Crear tipos TypeScript actualizados
3. Implementar servicios de catálogo

### Fase 2: Core Services
1. Actualizar AdminAPIService con manejo de catálogos
2. Crear hooks personalizados (useCatalogs, useReports)
3. Implementar Context Provider para catálogos

### Fase 3: Componentes
1. Actualizar componentes de gráficos para usar catálogos
2. Crear componente CatalogFilter reutilizable
3. Actualizar tablas para mostrar nombres en lugar de IDs

### Fase 4: Páginas
1. Actualizar Dashboard para pre-cargar catálogos
2. Modificar páginas de detalle de reportes
3. Ajustar filtros y búsquedas

### Fase 5: Testing y Optimización
1. Testing de conversión de datos
2. Optimización de caché de catálogos
3. Manejo de errores y estados de carga

## Consideraciones Especiales

1. **Performance**: Caché de catálogos para evitar requests repetidos
2. **UX**: Estados de carga durante carga de catálogos
3. **Fallbacks**: Mostrar "Desconocido" si falta mapeo
4. **Compatibilidad**: Mantener funcionamiento con datos legacy
5. **Error Handling**: Manejo graceful si catálogos no cargan

## Testing

### Tests Necesarios
```typescript
describe('CatalogService', () => {
  it('should load catalogs on initialization', async () => {
    // Test de carga inicial de catálogos
  });

  it('should map IDs to names correctly', () => {
    // Test de mapeo ID → nombre
  });

  it('should handle missing catalog entries', () => {
    // Test de fallback para IDs no encontrados
  });
});

describe('Components', () => {
  it('should display catalog names instead of IDs', () => {
    // Test de renderizado con nombres legibles
  });

  it('should filter by catalog IDs correctly', () => {
    // Test de filtros con nueva estructura
  });
});
```

## Tareas para el Agente Claude Code

1. **Implementar servicios**: AdminAPIService con manejo de catálogos
2. **Crear hooks**: useCatalogs, useReports con nueva estructura
3. **Actualizar componentes**: Gráficos y tablas con mapeo ID→nombre
4. **Implementar filtros**: CatalogFilter con opciones dinámicas
5. **Context Provider**: Gestión global de estado de catálogos
6. **Testing**: Cobertura de conversiones y mapeos
7. **Performance**: Optimización de caché y requests
8. **Error handling**: Estados de error y fallbacks
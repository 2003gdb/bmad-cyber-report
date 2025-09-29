'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '../../components/ProtectedRoute';
import Header from '../../components/Header';
import EnhancedMetricsCards from '../../components/Dashboard/EnhancedMetricsCards';
import StatusChart from '../../components/Dashboard/StatusChart';
import AttackTypesChart from '../../components/Dashboard/AttackTypesChart';
import ImpactChart from '../../components/Dashboard/ImpactChart';
import TrendsAnalysis from '../../components/Dashboard/TrendsAnalysis';
import { adminAPIService } from '../../services/AdminAPIService';
import { EnhancedDashboardMetrics } from '../../types';
import { es } from '../../locales/es';
import { CatalogProvider, useCatalogContext } from '../../contexts/CatalogContext';

function DashboardContent() {
  const [enhancedMetrics, setEnhancedMetrics] = useState<EnhancedDashboardMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { loading: catalogLoading, error: catalogError } = useCatalogContext();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Load enhanced metrics - AdminAPIService will now enrich data with catalog names
      const enhancedData = await adminAPIService.getEnhancedDashboardMetrics();
      setEnhancedMetrics(enhancedData);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al cargar datos');
    } finally {
      setIsLoading(false);
    }
  };

  // Show catalog loading state
  if (catalogLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen">
          <Header />
          <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="px-4 py-6 sm:px-0">
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin h-8 w-8 border-b-2 border-safetrade-orange"></div>
                <span className="ml-3 text-safetrade-dark">Cargando configuración del sistema...</span>
              </div>
            </div>
          </main>
        </div>
      </ProtectedRoute>
    );
  }

  // Show catalog error state
  if (catalogError) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen">
          <Header />
          <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="px-4 py-6 sm:px-0">
              <div className="rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      Error al cargar la configuración del sistema
                    </h3>
                    <div className="mt-2 text-sm text-red-700">
                      <p>{catalogError}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen">
        <Header />

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {/* Page Header */}
          <div className="px-4 py-6 sm:px-0">
            <h1 className="text-2xl font-bold text-safetrade-dark">
              {es.dashboard.title}
            </h1>
            <p className="mt-1 text-sm text-safetrade-dark/70">
              {es.dashboard.welcome}
            </p>
          </div>

          {/* Error State */}
          {error && (
            <div className="px-4 sm:px-0 mb-6">
              <div className="rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      {error}
                    </h3>
                  </div>
                  <div className="ml-auto pl-3">
                    <button
                      onClick={loadDashboardData}
                      className="bg-red-50 p-1.5 text-red-500 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-red-50 focus:ring-red-600"
                    >
                      <span className="sr-only">Reintentar</span>
                      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Enhanced Metrics Grid */}
          <div className="px-4 sm:px-0">
            <EnhancedMetricsCards
              metrics={enhancedMetrics}
              isLoading={isLoading}
            />
          </div>

          {/* Charts Grid */}
          <div className="px-4 sm:px-0 mt-8">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <StatusChart
                data={enhancedMetrics?.status_distribution || []}
                isLoading={isLoading}
              />

              <ImpactChart
                data={enhancedMetrics?.impact_distribution || []}
                isLoading={isLoading}
              />
            </div>
          </div>

          {/* Attack Types Chart */}
          <div className="px-4 sm:px-0 mt-8">
            <AttackTypesChart
              data={enhancedMetrics?.attack_types || []}
              isLoading={isLoading}
            />
          </div>

          {/* Trends Analysis */}
          <div className="px-4 sm:px-0 mt-8">
            <TrendsAnalysis
              weeklyData={enhancedMetrics?.weekly_trends || []}
              monthlyData={enhancedMetrics?.monthly_trends || []}
              isLoading={isLoading}
            />
          </div>

          {/* Quick Actions */}
          <div className="px-4 sm:px-0 mt-8">
            <div className="bg-white/70 backdrop-blur-sm overflow-hidden shadow border border-safetrade-blue/30">
              <div className="p-6">
                <h3 className="text-lg leading-6 font-medium text-safetrade-dark mb-4">
                  Acciones Rápidas
                </h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <a
                    href="/reports"
                    className="block p-4 border border-safetrade-blue/30 hover:bg-safetrade-blue/10 transition-colors"
                  >
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div className="ml-4">
                        <h4 className="text-sm font-medium text-safetrade-dark">Ver Todos los Reportes</h4>
                        <p className="text-sm text-safetrade-dark/60">Gestionar reportes de incidentes</p>
                      </div>
                    </div>
                  </a>

                  <button
                    onClick={loadDashboardData}
                    className="block p-4 border border-safetrade-blue/30 hover:bg-safetrade-blue/10 transition-colors text-left"
                  >
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      </div>
                      <div className="ml-4">
                        <h4 className="text-sm font-medium text-safetrade-dark">Actualizar Datos</h4>
                        <p className="text-sm text-safetrade-dark/60">Refrescar métricas del panel</p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}

export default function DashboardPage() {
  return (
    <CatalogProvider>
      <DashboardContent />
    </CatalogProvider>
  );
}
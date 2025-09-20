'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '../../components/ProtectedRoute';
import Header from '../../components/Header';
import ReportsTable from '../../components/Reports/ReportsTable';
import ReportsFilter from '../../components/Reports/ReportsFilter';
import Pagination from '../../components/Pagination';
import { adminAPIService } from '../../services/AdminAPIService';
import { ReportSummary, PaginatedResponse } from '../../types';
import { es } from '../../locales/es';

export default function ReportsPage() {
  const [reports, setReports] = useState<ReportSummary[]>([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0
  });
  const [filters, setFilters] = useState({
    status: '',
    attackType: '',
    search: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  const loadReports = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...(filters.status && { status: filters.status }),
        ...(filters.attackType && { attackType: filters.attackType })
      };

      const response: PaginatedResponse<ReportSummary> = await adminAPIService.getReports(params);

      let filteredData = response.data;

      // Apply client-side search filter if provided
      if (filters.search.trim()) {
        const searchTerm = filters.search.toLowerCase();
        filteredData = response.data.filter(report =>
          report.id.toString().includes(searchTerm) ||
          report.location.toLowerCase().includes(searchTerm) ||
          report.attackType.toLowerCase().includes(searchTerm)
        );
      }

      setReports(filteredData);
      setPagination({
        total: response.total,
        page: response.page,
        limit: response.limit,
        totalPages: response.totalPages
      });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al cargar reportes');
    } finally {
      setIsLoading(false);
    }
  }, [pagination.page, pagination.limit, filters.status, filters.attackType]);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page when filtering
  };

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }));
  };

  const handleViewReport = (id: number) => {
    router.push(`/reports/${id}`);
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Header />

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {/* Page Header */}
          <div className="px-4 py-6 sm:px-0">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {es.reports.title}
                </h1>
                <p className="mt-1 text-sm text-gray-600">
                  {es.reports.listTitle}
                </p>
              </div>
              <div className="text-sm text-gray-500">
                {pagination.total} {es.reports.pagination.results}
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="px-4 sm:px-0">
            <ReportsFilter
              filters={filters}
              onFilterChange={handleFilterChange}
            />
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
                      onClick={loadReports}
                      className="bg-red-50 rounded-md p-1.5 text-red-500 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-red-50 focus:ring-red-600"
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

          {/* Reports Table */}
          <div className="px-4 sm:px-0">
            <ReportsTable
              reports={reports}
              isLoading={isLoading}
              onViewReport={handleViewReport}
            />
          </div>

          {/* Pagination */}
          {!isLoading && reports.length > 0 && (
            <div className="px-4 sm:px-0 mt-6">
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                totalResults={pagination.total}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '../../../components/ProtectedRoute';
import Header from '../../../components/Header';
import StatusUpdateModal from '../../../components/Reports/StatusUpdateModal';
import { adminAPIService } from '../../../services/AdminAPIService';
import { Report, UpdateStatusRequest } from '../../../types';
import { es } from '../../../locales/es';

interface ReportDetailPageProps {
  params: {
    id: string;
  };
}

export default function ReportDetailPage({ params }: ReportDetailPageProps) {
  const [report, setReport] = useState<Report | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);

  const router = useRouter();
  const reportId = parseInt(params.id);

  const loadReport = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await adminAPIService.getReportById(reportId);
      setReport(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al cargar el reporte');
    } finally {
      setIsLoading(false);
    }
  }, [reportId]);

  useEffect(() => {
    if (reportId) {
      loadReport();
    }
  }, [reportId, loadReport]);

  const handleStatusUpdated = (updatedReport: Report) => {
    setReport(updatedReport);
    setShowStatusModal(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'nuevo':
        return 'bg-yellow-100 text-yellow-800';
      case 'revisado':
        return 'bg-blue-100 text-blue-800';
      case 'en_investigacion':
        return 'bg-purple-100 text-purple-800';
      case 'cerrado':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getImpactColor = (level: string) => {
    switch (level) {
      case 'bajo':
        return 'bg-green-100 text-green-800';
      case 'medio':
        return 'bg-yellow-100 text-yellow-800';
      case 'alto':
        return 'bg-orange-100 text-orange-800';
      case 'critico':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          <Header />
          <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          </main>
        </div>
      </ProtectedRoute>
    );
  }

  if (error || !report) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          <Header />
          <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="px-4 py-6 sm:px-0">
              <div className="rounded-md bg-red-50 p-4">
                <div className="text-center">
                  <h3 className="text-lg font-medium text-red-800">
                    {error || 'Reporte no encontrado'}
                  </h3>
                  <button
                    onClick={() => router.push('/reports')}
                    className="mt-4 bg-red-100 hover:bg-red-200 text-red-800 px-4 py-2 rounded-md text-sm font-medium"
                  >
                    Volver a Reportes
                  </button>
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
      <div className="min-h-screen bg-gray-50">
        <Header />

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {/* Page Header */}
          <div className="px-4 py-6 sm:px-0">
            <div className="flex justify-between items-center">
              <div>
                <button
                  onClick={() => router.push('/reports')}
                  className="text-blue-600 hover:text-blue-800 mb-2 flex items-center"
                >
                  <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                  </svg>
                  {es.common.back}
                </button>
                <h1 className="text-2xl font-bold text-gray-900">
                  {es.reports.detailTitle} #{report.id}
                </h1>
              </div>
              <button
                onClick={() => setShowStatusModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                {es.reports.actions.updateStatus}
              </button>
            </div>
          </div>

          {/* Report Details */}
          <div className="px-4 sm:px-0">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900">Información Básica</h3>

                    <div>
                      <dt className="text-sm font-medium text-gray-500">Tipo de Ataque</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {es.reports.attackTypes[report.attackType as keyof typeof es.reports.attackTypes] || report.attackType}
                      </dd>
                    </div>

                    <div>
                      <dt className="text-sm font-medium text-gray-500">Fecha del Incidente</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {formatDate(report.incidentDate)}
                      </dd>
                    </div>

                    <div>
                      <dt className="text-sm font-medium text-gray-500">Nivel de Impacto</dt>
                      <dd className="mt-1">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getImpactColor(report.impactLevel)}`}>
                          {es.reports.impactLevels[report.impactLevel as keyof typeof es.reports.impactLevels] || report.impactLevel}
                        </span>
                      </dd>
                    </div>

                    <div>
                      <dt className="text-sm font-medium text-gray-500">Estado</dt>
                      <dd className="mt-1">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(report.status)}`}>
                          {es.reports.status[report.status as keyof typeof es.reports.status] || report.status}
                        </span>
                      </dd>
                    </div>

                    <div>
                      <dt className="text-sm font-medium text-gray-500">Ubicación</dt>
                      <dd className="mt-1 text-sm text-gray-900">{report.location}</dd>
                    </div>

                    <div>
                      <dt className="text-sm font-medium text-gray-500">Reporte Anónimo</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {report.isAnonymous ? 'Sí' : 'No'}
                      </dd>
                    </div>
                  </div>

                  {/* Additional Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900">Información Adicional</h3>

                    <div>
                      <dt className="text-sm font-medium text-gray-500">Usuario</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {report.isAnonymous ? 'Anónimo' : `ID: ${report.userId}`}
                      </dd>
                    </div>

                    <div>
                      <dt className="text-sm font-medium text-gray-500">Información del Dispositivo</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {report.deviceInfo || 'No disponible'}
                      </dd>
                    </div>

                    <div>
                      <dt className="text-sm font-medium text-gray-500">Fecha de Creación</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {formatDate(report.createdAt)}
                      </dd>
                    </div>

                    <div>
                      <dt className="text-sm font-medium text-gray-500">Última Actualización</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {formatDate(report.updatedAt)}
                      </dd>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="mt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Descripción del Incidente</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                      {report.description}
                    </p>
                  </div>
                </div>

                {/* Admin Notes */}
                {report.adminNotes && (
                  <div className="mt-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Notas Administrativas</h3>
                    <div className="bg-blue-50 rounded-lg p-4">
                      <p className="text-sm text-blue-700 whitespace-pre-wrap">
                        {report.adminNotes}
                      </p>
                    </div>
                  </div>
                )}

                {/* Evidence URLs */}
                {report.evidenceUrls && report.evidenceUrls.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Evidencia</h3>
                    <ul className="space-y-2">
                      {report.evidenceUrls.map((url, index) => (
                        <li key={index}>
                          <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            Evidencia {index + 1}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>

        {/* Status Update Modal */}
        {report && (
          <StatusUpdateModal
            isOpen={showStatusModal}
            onClose={() => setShowStatusModal(false)}
            onStatusUpdated={handleStatusUpdated}
            report={report}
          />
        )}
      </div>
    </ProtectedRoute>
  );
}
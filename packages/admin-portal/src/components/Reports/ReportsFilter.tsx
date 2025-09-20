'use client';

import { es } from '../../locales/es';

interface ReportsFilterProps {
  filters: {
    status: string;
    attackType: string;
    search: string;
  };
  onFilterChange: (filters: { status: string; attackType: string; search: string; }) => void;
}

export default function ReportsFilter({ filters, onFilterChange }: ReportsFilterProps) {
  const handleStatusChange = (status: string) => {
    onFilterChange({ ...filters, status });
  };

  const handleAttackTypeChange = (attackType: string) => {
    onFilterChange({ ...filters, attackType });
  };

  const handleSearchChange = (search: string) => {
    onFilterChange({ ...filters, search });
  };

  const clearFilters = () => {
    onFilterChange({ status: '', attackType: '', search: '' });
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Search */}
        <div>
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
            {es.common.search}
          </label>
          <input
            type="text"
            id="search"
            value={filters.search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder={es.reports.searchPlaceholder}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>

        {/* Status Filter */}
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
            {es.reports.filterByStatus}
          </label>
          <select
            id="status"
            value={filters.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            <option value="">Todos los estados</option>
            <option value="pendiente">{es.reports.status.pendiente}</option>
            <option value="en_revision">{es.reports.status.en_revision}</option>
            <option value="resuelto">{es.reports.status.resuelto}</option>
            <option value="cerrado">{es.reports.status.cerrado}</option>
          </select>
        </div>

        {/* Attack Type Filter */}
        <div>
          <label htmlFor="attackType" className="block text-sm font-medium text-gray-700 mb-1">
            {es.reports.filterByAttackType}
          </label>
          <select
            id="attackType"
            value={filters.attackType}
            onChange={(e) => handleAttackTypeChange(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            <option value="">Todos los tipos</option>
            <option value="phishing">{es.reports.attackTypes.phishing}</option>
            <option value="malware">{es.reports.attackTypes.malware}</option>
            <option value="fraude">{es.reports.attackTypes.fraude}</option>
            <option value="robo_identidad">{es.reports.attackTypes.robo_identidad}</option>
            <option value="otro">{es.reports.attackTypes.otro}</option>
          </select>
        </div>

        {/* Clear Filters */}
        <div className="flex items-end">
          <button
            onClick={clearFilters}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm font-medium transition-colors"
          >
            {es.common.clear}
          </button>
        </div>
      </div>

      {/* Active Filters Display */}
      {(filters.status || filters.attackType || filters.search) && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-gray-500">Filtros activos:</span>
            {filters.search && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Búsqueda: {filters.search}
              </span>
            )}
            {filters.status && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Estado: {es.reports.status[filters.status as keyof typeof es.reports.status]}
              </span>
            )}
            {filters.attackType && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                Tipo: {es.reports.attackTypes[filters.attackType as keyof typeof es.reports.attackTypes]}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
import React, { useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Search, Filter, Calendar, User } from 'lucide-react';

export function ReportsListScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');

  const reports = [
    {
      id: 1,
      date: '2024-01-15',
      type: 'Phishing',
      reporter: 'María González',
      status: 'accepted',
      statusLabel: 'Aceptado'
    },
    {
      id: 2,
      date: '2024-01-14',
      type: 'Spam',
      reporter: 'Anónimo',
      status: 'in-progress',
      statusLabel: 'En proceso'
    },
    {
      id: 3,
      date: '2024-01-13',
      type: 'Malware',
      reporter: 'Carlos Ruiz',
      status: 'rejected',
      statusLabel: 'Rechazado'
    },
    {
      id: 4,
      date: '2024-01-12',
      type: 'Fraude',
      reporter: 'Ana Martín',
      status: 'accepted',
      statusLabel: 'Aceptado'
    },
    {
      id: 5,
      date: '2024-01-11',
      type: 'Phishing',
      reporter: 'Anónimo',
      status: 'in-progress',
      statusLabel: 'En proceso'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-100 text-green-700';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-700';
      case 'rejected':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusDot = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-500';
      case 'in-progress':
        return 'bg-yellow-500';
      case 'rejected':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         report.reporter.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-[#A1CDF4]/10 to-background">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-[#25283D]">Reportes</h1>
        <p className="text-sm text-muted-foreground">Lista de todos los reportes enviados</p>
      </div>

      {/* Search Bar */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-white border-[#A1CDF4]/30 focus:border-[#A1CDF4] rounded-xl"
          placeholder="Buscar reportes..."
        />
      </div>

      {/* Filter Chips */}
      <div className="flex gap-2 mb-4 overflow-x-auto">
        {[
          { key: 'all', label: 'Todos' },
          { key: 'accepted', label: 'Aceptado' },
          { key: 'in-progress', label: 'En proceso' },
          { key: 'rejected', label: 'Rechazado' }
        ].map(filter => (
          <Button
            key={filter.key}
            variant={statusFilter === filter.key ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter(filter.key)}
            className={`rounded-full whitespace-nowrap ${
              statusFilter === filter.key 
                ? 'bg-[#F5853F] hover:bg-[#F5853F]/90 text-white' 
                : 'border-[#A1CDF4] text-[#25283D] hover:bg-[#A1CDF4]/10'
            }`}
          >
            {filter.label}
          </Button>
        ))}
      </div>

      {/* Sort Dropdown */}
      <div className="mb-6">
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-40 bg-white border-[#A1CDF4]/30 focus:border-[#A1CDF4] rounded-xl">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Más recientes</SelectItem>
            <SelectItem value="oldest">Más antiguos</SelectItem>
            <SelectItem value="type">Por tipo</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Reports List */}
      <div className="space-y-3">
        {filteredReports.map((report) => (
          <Card key={report.id} className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
            <CardContent className="pt-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${getStatusDot(report.status)}`} />
                  <span className="font-medium text-[#25283D]">{report.type}</span>
                </div>
                <Badge className={getStatusColor(report.status)}>
                  {report.statusLabel}
                </Badge>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>Fecha: {new Date(report.date).toLocaleDateString('es-ES')}</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="w-4 h-4" />
                  <span>Reportado por: {report.reporter}</span>
                </div>

                <div className="pt-2">
                  <p className="text-sm text-[#25283D]">Estado: {report.statusLabel}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredReports.length === 0 && (
        <div className="text-center py-12">
          <Filter className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No se encontraron reportes con los filtros seleccionados</p>
        </div>
      )}
    </div>
  );
}
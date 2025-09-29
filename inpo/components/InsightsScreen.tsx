import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { TrendingUp, Shield, AlertTriangle, Users } from 'lucide-react';

export function InsightsScreen() {
  const [timeFilter, setTimeFilter] = useState('month');

  const chartData = [
    { name: 'Lun', reportes: 12 },
    { name: 'Mar', reportes: 19 },
    { name: 'Mié', reportes: 15 },
    { name: 'Jue', reportes: 22 },
    { name: 'Vie', reportes: 28 },
    { name: 'Sáb', reportes: 8 },
    { name: 'Dom', reportes: 6 }
  ];

  const topAttacks = [
    { name: 'Phishing', count: 45, color: 'bg-red-500' },
    { name: 'Spam', count: 32, color: 'bg-orange-500' },
    { name: 'Malware', count: 18, color: 'bg-yellow-500' }
  ];

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-[#A1CDF4]/10 to-background">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-[#25283D]">Estadísticas</h1>
        <p className="text-sm text-muted-foreground">Panel de insights de la comunidad</p>
      </div>

      {/* Time Filter */}
      <div className="flex gap-2 mb-6">
        {[
          { key: 'week', label: 'Esta semana' },
          { key: 'month', label: 'Este mes' },
          { key: 'all', label: 'Todo' }
        ].map(filter => (
          <Button
            key={filter.key}
            variant={timeFilter === filter.key ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeFilter(filter.key)}
            className={`rounded-full ${
              timeFilter === filter.key 
                ? 'bg-[#F5853F] hover:bg-[#F5853F]/90 text-white' 
                : 'border-[#A1CDF4] text-[#25283D] hover:bg-[#A1CDF4]/10'
            }`}
          >
            {filter.label}
          </Button>
        ))}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 mb-6">
        <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total de Reportes</p>
                <p className="text-3xl font-bold text-[#25283D]">1,247</p>
                <p className="text-sm text-green-600 flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3" />
                  +12% vs mes anterior
                </p>
              </div>
              <div className="p-3 rounded-full bg-[#A1CDF4]/20">
                <Shield className="w-6 h-6 text-[#25283D]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Attacks Card */}
      <Card className="mb-6 shadow-lg border-0 bg-white/70 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#25283D]">
            <AlertTriangle className="w-5 h-5" />
            Ataques Más Comunes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {topAttacks.map((attack, index) => (
              <div key={attack.name} className="flex items-center justify-between p-3 rounded-xl bg-[#A1CDF4]/10">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${attack.color}`} />
                  <span className="font-medium text-[#25283D]">{attack.name}</span>
                </div>
                <Badge variant="secondary" className="bg-white text-[#25283D]">
                  {attack.count}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Chart Card */}
      <Card className="mb-6 shadow-lg border-0 bg-white/70 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-[#25283D]">Tendencia de Reportes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis 
                  dataKey="name" 
                  tick={{ fill: '#25283D', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fill: '#25283D', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Bar 
                  dataKey="reportes" 
                  fill="#A1CDF4" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Community Data */}
      <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#25283D]">
            <Users className="w-5 h-5" />
            Datos de la Comunidad
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 rounded-xl bg-[#A1CDF4]/10">
              <p className="text-2xl font-bold text-[#25283D]">2,431</p>
              <p className="text-sm text-muted-foreground">Usuarios activos</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-[#A1CDF4]/10">
              <p className="text-2xl font-bold text-[#25283D]">89%</p>
              <p className="text-sm text-muted-foreground">Reportes resueltos</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
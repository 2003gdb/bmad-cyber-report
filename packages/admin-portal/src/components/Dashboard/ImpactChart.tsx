'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { ImpactDistribution } from '../../types';

interface ImpactChartProps {
  data: ImpactDistribution[];
  isLoading?: boolean;
}

const IMPACT_COLORS = {
  'ninguno': '#10B981',           // Green - No Impact
  'robo_datos': '#F59E0B',        // Amber - Data Theft
  'robo_dinero': '#DC2626',       // Red - Money Theft
  'cuenta_comprometida': '#7C2D12' // Dark Red - Account Compromised
};

const IMPACT_LABELS = {
  'ninguno': 'Sin Impacto',
  'robo_datos': 'Robo de Datos',
  'robo_dinero': 'Robo de Dinero',
  'cuenta_comprometida': 'Cuenta Comprometida'
};

export default function ImpactChart({ data, isLoading }: ImpactChartProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Nivel de Impacto</h3>
        <div className="h-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  const chartData = data.map(item => ({
    name: IMPACT_LABELS[item.impact_level as keyof typeof IMPACT_LABELS] || item.impact_level,
    value: item.count,
    percentage: item.percentage,
    color: IMPACT_COLORS[item.impact_level as keyof typeof IMPACT_COLORS] || '#6B7280'
  }));

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: { name: string; value: number; percentage: number } }> }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm text-gray-600">
            Reportes: <span className="font-medium">{data.value}</span>
          </p>
          <p className="text-sm text-gray-600">
            Porcentaje: <span className="font-medium">{data.percentage}%</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Nivel de Impacto</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value: string, entry: { color: string }) => (
                <span style={{ color: entry.color }}>{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
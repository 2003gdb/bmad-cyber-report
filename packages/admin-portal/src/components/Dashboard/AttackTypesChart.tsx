'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AttackTypeData } from '../../types';

interface AttackTypesChartProps {
  data: AttackTypeData[];
  isLoading?: boolean;
}

const ATTACK_TYPE_LABELS = {
  'email': 'Email',
  'SMS': 'SMS',
  'whatsapp': 'WhatsApp',
  'llamada': 'Llamada',
  'redes_sociales': 'Redes Sociales',
  'otro': 'Otro'
};

export default function AttackTypesChart({ data, isLoading }: AttackTypesChartProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Tipos de Ataque</h3>
        <div className="h-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  const chartData = data.map(item => ({
    name: ATTACK_TYPE_LABELS[item.attack_type as keyof typeof ATTACK_TYPE_LABELS] || item.attack_type,
    count: item.count,
    percentage: item.percentage
  }));

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ payload: { count: number; percentage: number } }>; label?: string }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium">{label}</p>
          <p className="text-sm text-gray-600">
            Reportes: <span className="font-medium text-blue-600">{data.count}</span>
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
      <h3 className="text-lg font-medium text-gray-900 mb-4">Tipos de Ataque</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="count"
              fill="#3B82F6"
              radius={[4, 4, 0, 0]}
              className="hover:opacity-80"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
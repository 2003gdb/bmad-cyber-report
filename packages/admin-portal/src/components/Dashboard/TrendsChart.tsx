'use client';

import { TrendData } from '../../types';
import { es } from '../../locales/es';

interface TrendsChartProps {
  trends: TrendData[];
  isLoading?: boolean;
}

export default function TrendsChart({ trends, isLoading }: TrendsChartProps) {
  if (isLoading) {
    return (
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            {es.dashboard.metrics.recentTrends}
          </h3>
          <div className="animate-pulse">
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center space-x-3">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                  <div className="h-2 bg-gray-200 rounded flex-1"></div>
                  <div className="h-4 bg-gray-200 rounded w-12"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!trends || trends.length === 0) {
    return (
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            {es.dashboard.metrics.recentTrends}
          </h3>
          <p className="text-gray-500 text-center py-8">
            {es.dashboard.noData}
          </p>
        </div>
      </div>
    );
  }

  const maxCount = Math.max(...trends.map(t => t.count));

  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
          {es.dashboard.metrics.recentTrends}
        </h3>
        <div className="space-y-4">
          {trends.map((trend, index) => (
            <div key={index} className="flex items-center space-x-3">
              <div className="w-24 text-sm font-medium text-gray-700 truncate">
                {es.reports.attackTypes[trend.attackType as keyof typeof es.reports.attackTypes] || trend.attackType}
              </div>
              <div className="flex-1">
                <div className="bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(trend.count / maxCount) * 100}%` }}
                  ></div>
                </div>
              </div>
              <div className="w-12 text-sm text-gray-600 text-right">
                {trend.count}
              </div>
              <div className="w-12 text-sm text-gray-500 text-right">
                {trend.percentage.toFixed(1)}%
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
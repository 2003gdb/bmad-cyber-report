// Impact Level Constants and Labels for SafeTrade Platform

import { ImpactLevel } from '../types/report.types';

export const IMPACT_LEVELS: Record<ImpactLevel, {
  label: string;
  description: string;
  color: string;
  priority: number;
}> = {
  low: {
    label: 'Bajo',
    description: 'Impacto mínimo en operaciones',
    color: '#27AE60',
    priority: 1
  },
  medium: {
    label: 'Medio',
    description: 'Impacto moderado en operaciones',
    color: '#F39C12',
    priority: 2
  },
  high: {
    label: 'Alto',
    description: 'Impacto significativo en operaciones',
    color: '#E67E22',
    priority: 3
  },
  critical: {
    label: 'Crítico',
    description: 'Impacto severo en operaciones',
    color: '#E74C3C',
    priority: 4
  }
};
// Attack Type Constants and Labels for SafeTrade Platform

import { AttackType } from '../types/report.types';

export const ATTACK_TYPES: Record<AttackType, { 
  label: string; 
  description: string; 
  color: string;
}> = {
  phishing: {
    label: 'Phishing',
    description: 'Intento de robo de credenciales mediante sitios web falsos',
    color: '#FF6B6B'
  },
  malware: {
    label: 'Malware',
    description: 'Software malicioso que infecta dispositivos',
    color: '#E74C3C'
  },
  social_engineering: {
    label: 'Ingeniería Social',
    description: 'Manipulación psicológica para obtener información',
    color: '#F39C12'
  },
  data_theft: {
    label: 'Robo de Datos',
    description: 'Acceso no autorizado a información sensible',
    color: '#9B59B6'
  },
  ransomware: {
    label: 'Ransomware',
    description: 'Software que cifra archivos exigiendo rescate',
    color: '#2C3E50'
  },
  other: {
    label: 'Otro',
    description: 'Otro tipo de ataque cibernético',
    color: '#95A5A6'
  }
};
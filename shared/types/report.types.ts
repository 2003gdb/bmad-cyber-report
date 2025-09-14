// Report-related Types for SafeTrade Platform

export interface Report {
  id: string;
  userId?: string; // Null for anonymous reports
  attackType: AttackType;
  incidentDate: string;
  description: string;
  impactLevel: ImpactLevel;
  isAnonymous: boolean;
  status: ReportStatus;
  createdAt: string;
  updatedAt: string;
  attachments?: ReportAttachment[];
}

export interface ReportAttachment {
  id: string;
  reportId: string;
  filename: string;
  originalName: string;
  mimeType: string;
  fileSize: number;
  filePath: string;
  uploadedAt: string;
}

export interface CreateReportDto {
  attackType: AttackType;
  incidentDate: string;
  description: string;
  impactLevel: ImpactLevel;
  isAnonymous: boolean;
  attachments?: File[];
}

export interface UpdateReportStatusDto {
  status: ReportStatus;
  adminNotes?: string;
}

export type AttackType = 
  | 'phishing'
  | 'malware'
  | 'social_engineering'
  | 'data_theft'
  | 'ransomware'
  | 'other';

export type ImpactLevel = 
  | 'low'
  | 'medium'
  | 'high'
  | 'critical';

export type ReportStatus = 
  | 'pending'
  | 'reviewed'
  | 'resolved';

export interface ReportFilters {
  status?: ReportStatus;
  attackType?: AttackType;
  impactLevel?: ImpactLevel;
  dateFrom?: string;
  dateTo?: string;
  isAnonymous?: boolean;
}
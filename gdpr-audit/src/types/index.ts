export type ComplianceStatus = 'compliant' | 'non_compliant' | 'partial' | 'not_applicable' | 'pending';

export type CameraType = 'indoor' | 'outdoor' | 'ptz' | 'dome' | 'bullet' | 'fisheye';
export type RetentionPeriod = '24h' | '48h' | '72h' | '7d' | '14d' | '30d' | 'custom';

export interface Camera {
  id: string;
  name: string;
  location: string;
  floor?: string;
  building?: string;
  type: CameraType;
  purpose: string;
  retentionPeriod: RetentionPeriod;
  retentionCustomDays?: number;
  hasSignage: boolean;
  signageDescription?: string;
  coverageArea: string;
  publicArea: boolean;
  recordsAudio: boolean;
  vendor?: string;
  model?: string;
  installDate?: string;
  responsible: string;
  notes?: string;
  complianceChecks: ComplianceCheck[];
  createdAt: string;
  updatedAt: string;
}

export interface ComplianceCheck {
  id: string;
  checkId: string;
  status: ComplianceStatus;
  notes?: string;
  evidenceDescription?: string;
  reviewedAt?: string;
}

export interface ChecklistItem {
  id: string;
  category: AuditCategory;
  title: string;
  description: string;
  legalBasis?: string;
  guidance?: string;
  required: boolean;
}

export type AuditCategory =
  | 'purpose_limitation'
  | 'legal_basis'
  | 'signage'
  | 'data_minimization'
  | 'retention'
  | 'access_control'
  | 'data_security'
  | 'data_subject_rights'
  | 'processor_contracts'
  | 'documentation'
  | 'dpia';

export interface AuditSession {
  id: string;
  title: string;
  auditDate: string;
  auditor: string;
  organization: string;
  location: string;
  scope: string;
  status: 'draft' | 'in_progress' | 'completed';
  cameras: Camera[];
  organizationalChecks: OrganizationalCheck[];
  findings: Finding[];
  summary?: string;
  recommendations?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrganizationalCheck {
  checkId: string;
  status: ComplianceStatus;
  notes?: string;
  evidenceDescription?: string;
  reviewedAt?: string;
}

export interface Finding {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  title: string;
  description: string;
  affectedCameras?: string[];
  recommendation: string;
  status: 'open' | 'in_progress' | 'resolved';
  createdAt: string;
}

export interface ComplianceStats {
  totalChecks: number;
  compliant: number;
  nonCompliant: number;
  partial: number;
  notApplicable: number;
  pending: number;
  complianceRate: number;
}

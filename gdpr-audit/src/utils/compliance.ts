import type { Camera, AuditSession, ComplianceStats } from '../types';
import { CAMERA_CHECKLIST, ORGANIZATIONAL_CHECKLIST } from '../data/checklistItems';

export function calcCheckStats(checks: { status: string }[]): ComplianceStats {
  const total = checks.length;
  const compliant = checks.filter(c => c.status === 'compliant').length;
  const nonCompliant = checks.filter(c => c.status === 'non_compliant').length;
  const partial = checks.filter(c => c.status === 'partial').length;
  const notApplicable = checks.filter(c => c.status === 'not_applicable').length;
  const pending = checks.filter(c => c.status === 'pending').length;
  const applicable = total - notApplicable;
  const complianceRate = applicable > 0
    ? Math.round(((compliant + partial * 0.5) / applicable) * 100)
    : 0;
  return { totalChecks: total, compliant, nonCompliant, partial, notApplicable, pending, complianceRate };
}

export function calcCameraStats(camera: Camera): ComplianceStats {
  return calcCheckStats(camera.complianceChecks);
}

export function calcSessionStats(session: AuditSession): ComplianceStats {
  const allChecks = [
    ...session.cameras.flatMap(c => c.complianceChecks),
    ...session.organizationalChecks,
  ];
  return calcCheckStats(allChecks);
}

export function getCriticalIssues(session: AuditSession): string[] {
  const issues: string[] = [];

  // Check required camera items
  for (const camera of session.cameras) {
    const requiredChecks = CAMERA_CHECKLIST.filter(c => c.required);
    for (const check of requiredChecks) {
      const result = camera.complianceChecks.find(cc => cc.checkId === check.id);
      if (result?.status === 'non_compliant') {
        issues.push(`${camera.name}: ${check.title}`);
      }
    }
  }

  // Check required org items
  const requiredOrgChecks = ORGANIZATIONAL_CHECKLIST.filter(c => c.required);
  for (const check of requiredOrgChecks) {
    const result = session.organizationalChecks.find(oc => oc.checkId === check.id);
    if (result?.status === 'non_compliant') {
      issues.push(`Organisation: ${check.title}`);
    }
  }

  return issues;
}

export function getComplianceColor(rate: number): string {
  if (rate >= 80) return 'text-green-600';
  if (rate >= 60) return 'text-yellow-600';
  return 'text-red-600';
}

export function getComplianceBgColor(rate: number): string {
  if (rate >= 80) return 'bg-green-500';
  if (rate >= 60) return 'bg-yellow-500';
  return 'bg-red-500';
}

export function formatRetention(period: string, customDays?: number): string {
  const map: Record<string, string> = {
    '24h': '24 Stunden',
    '48h': '48 Stunden',
    '72h': '72 Stunden (empfohlen)',
    '7d': '7 Tage',
    '14d': '14 Tage',
    '30d': '30 Tage',
    custom: `${customDays ?? '?'} Tage (benutzerdefiniert)`,
  };
  return map[period] ?? period;
}

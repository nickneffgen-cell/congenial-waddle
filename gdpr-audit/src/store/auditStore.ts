import { useState, useEffect, useCallback } from 'react';
import type { AuditSession, Camera, Finding, ComplianceStatus } from '../types';
import { CAMERA_CHECKLIST, ORGANIZATIONAL_CHECKLIST } from '../data/checklistItems';

const STORAGE_KEY = 'gdpr_audit_sessions';

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

function loadSessions(): AuditSession[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveSessions(sessions: AuditSession[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}

export function createNewCamera(overrides: Partial<Camera> = {}): Camera {
  const now = new Date().toISOString();
  return {
    id: generateId(),
    name: '',
    location: '',
    type: 'indoor',
    purpose: '',
    retentionPeriod: '72h',
    hasSignage: false,
    coverageArea: '',
    publicArea: false,
    recordsAudio: false,
    responsible: '',
    complianceChecks: CAMERA_CHECKLIST.map(item => ({
      id: generateId(),
      checkId: item.id,
      status: 'pending' as ComplianceStatus,
    })),
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

export function createNewSession(overrides: Partial<AuditSession> = {}): AuditSession {
  const now = new Date().toISOString();
  return {
    id: generateId(),
    title: '',
    auditDate: new Date().toISOString().split('T')[0],
    auditor: '',
    organization: '',
    location: '',
    scope: '',
    status: 'draft',
    cameras: [],
    organizationalChecks: ORGANIZATIONAL_CHECKLIST.map(item => ({
      checkId: item.id,
      status: 'pending' as ComplianceStatus,
    })),
    findings: [],
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

export function useAuditStore() {
  const [sessions, setSessions] = useState<AuditSession[]>(loadSessions);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  useEffect(() => {
    saveSessions(sessions);
  }, [sessions]);

  const activeSession = sessions.find(s => s.id === activeSessionId) ?? null;

  const updateSessions = useCallback((updater: (sessions: AuditSession[]) => AuditSession[]) => {
    setSessions(prev => updater(prev));
  }, []);

  const createSession = useCallback((data: Partial<AuditSession>) => {
    const session = createNewSession(data);
    setSessions(prev => [...prev, session]);
    setActiveSessionId(session.id);
    return session;
  }, []);

  const updateSession = useCallback((id: string, updates: Partial<AuditSession>) => {
    setSessions(prev => prev.map(s =>
      s.id === id ? { ...s, ...updates, updatedAt: new Date().toISOString() } : s
    ));
  }, []);

  const deleteSession = useCallback((id: string) => {
    setSessions(prev => prev.filter(s => s.id !== id));
    if (activeSessionId === id) setActiveSessionId(null);
  }, [activeSessionId]);

  const addCamera = useCallback((sessionId: string, cameraData: Partial<Camera>) => {
    const camera = createNewCamera(cameraData);
    setSessions(prev => prev.map(s =>
      s.id === sessionId
        ? { ...s, cameras: [...s.cameras, camera], updatedAt: new Date().toISOString() }
        : s
    ));
    return camera;
  }, []);

  const updateCamera = useCallback((sessionId: string, cameraId: string, updates: Partial<Camera>) => {
    setSessions(prev => prev.map(s =>
      s.id === sessionId
        ? {
            ...s,
            cameras: s.cameras.map(c =>
              c.id === cameraId ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c
            ),
            updatedAt: new Date().toISOString(),
          }
        : s
    ));
  }, []);

  const deleteCamera = useCallback((sessionId: string, cameraId: string) => {
    setSessions(prev => prev.map(s =>
      s.id === sessionId
        ? { ...s, cameras: s.cameras.filter(c => c.id !== cameraId), updatedAt: new Date().toISOString() }
        : s
    ));
  }, []);

  const updateCameraCheck = useCallback((
    sessionId: string,
    cameraId: string,
    checkId: string,
    status: ComplianceStatus,
    notes?: string
  ) => {
    setSessions(prev => prev.map(s =>
      s.id === sessionId
        ? {
            ...s,
            cameras: s.cameras.map(c =>
              c.id === cameraId
                ? {
                    ...c,
                    complianceChecks: c.complianceChecks.map(check =>
                      check.checkId === checkId
                        ? { ...check, status, notes, reviewedAt: new Date().toISOString() }
                        : check
                    ),
                    updatedAt: new Date().toISOString(),
                  }
                : c
            ),
            updatedAt: new Date().toISOString(),
          }
        : s
    ));
  }, []);

  const updateOrganizationalCheck = useCallback((
    sessionId: string,
    checkId: string,
    status: ComplianceStatus,
    notes?: string
  ) => {
    setSessions(prev => prev.map(s =>
      s.id === sessionId
        ? {
            ...s,
            organizationalChecks: s.organizationalChecks.map(check =>
              check.checkId === checkId
                ? { ...check, status, notes, reviewedAt: new Date().toISOString() }
                : check
            ),
            updatedAt: new Date().toISOString(),
          }
        : s
    ));
  }, []);

  const addFinding = useCallback((sessionId: string, finding: Omit<Finding, 'id' | 'createdAt'>) => {
    const newFinding: Finding = {
      ...finding,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    setSessions(prev => prev.map(s =>
      s.id === sessionId
        ? { ...s, findings: [...s.findings, newFinding], updatedAt: new Date().toISOString() }
        : s
    ));
  }, []);

  const updateFinding = useCallback((sessionId: string, findingId: string, updates: Partial<Finding>) => {
    setSessions(prev => prev.map(s =>
      s.id === sessionId
        ? {
            ...s,
            findings: s.findings.map(f => f.id === findingId ? { ...f, ...updates } : f),
            updatedAt: new Date().toISOString(),
          }
        : s
    ));
  }, []);

  const deleteFinding = useCallback((sessionId: string, findingId: string) => {
    setSessions(prev => prev.map(s =>
      s.id === sessionId
        ? { ...s, findings: s.findings.filter(f => f.id !== findingId), updatedAt: new Date().toISOString() }
        : s
    ));
  }, []);

  return {
    sessions,
    activeSession,
    activeSessionId,
    setActiveSessionId,
    createSession,
    updateSession,
    deleteSession,
    addCamera,
    updateCamera,
    deleteCamera,
    updateCameraCheck,
    updateOrganizationalCheck,
    addFinding,
    updateFinding,
    deleteFinding,
    updateSessions,
  };
}

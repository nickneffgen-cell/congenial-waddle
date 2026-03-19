import type { AuditSession } from '../types';
import { calcSessionStats, getCriticalIssues } from '../utils/compliance';
import ComplianceBar from './ComplianceBar';
import { Camera, AlertTriangle, CheckCircle, Clock, FileText } from 'lucide-react';

interface Props {
  session: AuditSession;
}

export default function Dashboard({ session }: Props) {
  const stats = calcSessionStats(session);
  const criticalIssues = getCriticalIssues(session);
  const openFindings = session.findings.filter(f => f.status === 'open');
  const criticalFindings = session.findings.filter(f => f.severity === 'critical' || f.severity === 'high');
  const pendingCameras = session.cameras.filter(c => {
    const pending = c.complianceChecks.filter(cc => cc.status === 'pending').length;
    return pending > 0;
  });

  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-base font-semibold text-gray-900 mb-4">Gesamtübersicht</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">{session.cameras.length}</div>
            <div className="text-xs text-gray-500 mt-1">Kameras</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-700">{stats.compliant}</div>
            <div className="text-xs text-gray-500 mt-1">Konform</div>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-700">{stats.nonCompliant}</div>
            <div className="text-xs text-gray-500 mt-1">Nicht konform</div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-700">{stats.pending}</div>
            <div className="text-xs text-gray-500 mt-1">Ausstehend</div>
          </div>
        </div>
        <ComplianceBar stats={stats} showDetails />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Critical Issues */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={18} className="text-red-500" />
            <h3 className="text-base font-semibold text-gray-900">Pflichtanforderungen nicht erfüllt</h3>
          </div>
          {criticalIssues.length === 0 ? (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle size={16} />
              <span className="text-sm">Alle Pflichtanforderungen erfüllt oder noch nicht geprüft</span>
            </div>
          ) : (
            <ul className="space-y-2">
              {criticalIssues.slice(0, 8).map((issue, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-red-700">
                  <span className="text-red-500 mt-0.5 flex-shrink-0">✕</span>
                  {issue}
                </li>
              ))}
              {criticalIssues.length > 8 && (
                <li className="text-xs text-gray-500">+{criticalIssues.length - 8} weitere...</li>
              )}
            </ul>
          )}
        </div>

        {/* Findings Summary */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <FileText size={18} className="text-orange-500" />
            <h3 className="text-base font-semibold text-gray-900">Feststellungen</h3>
          </div>
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <div className="text-xl font-bold text-red-700">{openFindings.length}</div>
              <div className="text-xs text-gray-500">Offen</div>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <div className="text-xl font-bold text-orange-700">{criticalFindings.length}</div>
              <div className="text-xs text-gray-500">Kritisch/Hoch</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-xl font-bold text-green-700">
                {session.findings.filter(f => f.status === 'resolved').length}
              </div>
              <div className="text-xs text-gray-500">Behoben</div>
            </div>
          </div>
        </div>
      </div>

      {/* Camera Status */}
      {session.cameras.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Camera size={18} className="text-blue-500" />
            <h3 className="text-base font-semibold text-gray-900">Kamerastatus</h3>
          </div>
          <div className="space-y-3">
            {session.cameras.map(camera => {
              const cStats = calcSessionStats({
                ...session,
                cameras: [camera],
                organizationalChecks: [],
              });
              const nonCompliant = camera.complianceChecks.filter(c => c.status === 'non_compliant').length;
              return (
                <div key={camera.id} className="flex items-center gap-4">
                  <div className="w-32 flex-shrink-0">
                    <div className="text-sm font-medium text-gray-900 truncate">{camera.name || 'Unnamed'}</div>
                    <div className="text-xs text-gray-500 truncate">{camera.location}</div>
                  </div>
                  <div className="flex-1">
                    <ComplianceBar stats={cStats} />
                  </div>
                  {nonCompliant > 0 && (
                    <div className="flex-shrink-0">
                      <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">
                        {nonCompliant} Problem(e)
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Pending Tasks */}
      {pendingCameras.length > 0 && (
        <div className="bg-white rounded-xl border border-amber-200 p-5">
          <div className="flex items-center gap-2 mb-3">
            <Clock size={18} className="text-amber-500" />
            <h3 className="text-base font-semibold text-gray-900">Ausstehende Prüfungen</h3>
          </div>
          <ul className="space-y-1">
            {pendingCameras.map(c => {
              const n = c.complianceChecks.filter(cc => cc.status === 'pending').length;
              return (
                <li key={c.id} className="text-sm text-amber-800">
                  <span className="font-medium">{c.name || 'Unbenannte Kamera'}</span>: {n} Prüfpunkt(e) ausstehend
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

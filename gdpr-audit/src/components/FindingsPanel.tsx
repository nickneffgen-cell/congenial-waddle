import { useState } from 'react';
import type { Finding, AuditSession } from '../types';
import { Plus, Trash2, AlertTriangle, AlertCircle, Info, CheckCircle } from 'lucide-react';

const SEVERITY_CONFIG = {
  critical: { label: 'Kritisch', color: 'bg-red-100 text-red-800 border-red-200', icon: AlertCircle },
  high: { label: 'Hoch', color: 'bg-orange-100 text-orange-800 border-orange-200', icon: AlertTriangle },
  medium: { label: 'Mittel', color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: AlertTriangle },
  low: { label: 'Niedrig', color: 'bg-blue-100 text-blue-800 border-blue-200', icon: Info },
  info: { label: 'Hinweis', color: 'bg-gray-100 text-gray-600 border-gray-200', icon: Info },
};

const FINDING_STATUS = {
  open: { label: 'Offen', color: 'bg-red-50 text-red-700' },
  in_progress: { label: 'In Bearbeitung', color: 'bg-yellow-50 text-yellow-700' },
  resolved: { label: 'Behoben', color: 'bg-green-50 text-green-700' },
};

interface Props {
  session: AuditSession;
  onAdd: (finding: Omit<Finding, 'id' | 'createdAt'>) => void;
  onUpdate: (id: string, updates: Partial<Finding>) => void;
  onDelete: (id: string) => void;
}

function emptyFinding(): Omit<Finding, 'id' | 'createdAt'> {
  return {
    severity: 'medium',
    title: '',
    description: '',
    recommendation: '',
    status: 'open',
    affectedCameras: [],
  };
}

export default function FindingsPanel({ session, onAdd, onUpdate, onDelete }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [newFinding, setNewFinding] = useState(emptyFinding);

  const handleAdd = () => {
    if (!newFinding.title.trim()) return;
    onAdd(newFinding);
    setNewFinding(emptyFinding());
    setShowForm(false);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-gray-900">Feststellungen & Maßnahmen</h3>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
        >
          <Plus size={14} />
          Feststellung
        </button>
      </div>

      {showForm && (
        <div className="border border-blue-200 rounded-lg p-4 mb-4 bg-blue-50 space-y-3">
          <h4 className="text-sm font-medium text-gray-900">Neue Feststellung</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Schweregrad</label>
              <select
                value={newFinding.severity}
                onChange={e => setNewFinding(f => ({ ...f, severity: e.target.value as Finding['severity'] }))}
                className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm"
              >
                {Object.entries(SEVERITY_CONFIG).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
              <select
                value={newFinding.status}
                onChange={e => setNewFinding(f => ({ ...f, status: e.target.value as Finding['status'] }))}
                className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm"
              >
                {Object.entries(FINDING_STATUS).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">Titel *</label>
              <input
                type="text"
                value={newFinding.title}
                onChange={e => setNewFinding(f => ({ ...f, title: e.target.value }))}
                placeholder="Kurze Beschreibung der Feststellung"
                className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">Beschreibung</label>
              <textarea
                value={newFinding.description}
                onChange={e => setNewFinding(f => ({ ...f, description: e.target.value }))}
                rows={2}
                placeholder="Detaillierte Beschreibung..."
                className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">Empfehlung / Maßnahme</label>
              <textarea
                value={newFinding.recommendation}
                onChange={e => setNewFinding(f => ({ ...f, recommendation: e.target.value }))}
                rows={2}
                placeholder="Empfohlene Maßnahme zur Behebung..."
                className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleAdd} className="px-4 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
              Hinzufügen
            </button>
            <button onClick={() => setShowForm(false)} className="px-4 py-1.5 border border-gray-300 text-sm rounded-lg hover:bg-gray-50">
              Abbrechen
            </button>
          </div>
        </div>
      )}

      {session.findings.length === 0 && !showForm && (
        <div className="text-center py-8 text-gray-400">
          <CheckCircle size={32} className="mx-auto mb-2 opacity-40" />
          <p className="text-sm">Noch keine Feststellungen dokumentiert.</p>
        </div>
      )}

      <div className="space-y-3">
        {session.findings.map(finding => {
          const cfg = SEVERITY_CONFIG[finding.severity];
          const Icon = cfg.icon;
          return (
            <div key={finding.id} className={`border rounded-lg p-4 ${cfg.color}`}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2 flex-1">
                  <Icon size={16} className="flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm">{finding.title}</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${FINDING_STATUS[finding.status].color}`}>
                        {FINDING_STATUS[finding.status].label}
                      </span>
                      <span className="text-xs font-medium">{cfg.label}</span>
                    </div>
                    {finding.description && (
                      <p className="text-xs mt-1 opacity-80">{finding.description}</p>
                    )}
                    {finding.recommendation && (
                      <div className="mt-2 text-xs bg-white/60 rounded p-2">
                        <span className="font-medium">Empfehlung:</span> {finding.recommendation}
                      </div>
                    )}
                    <div className="flex gap-2 mt-2">
                      {Object.entries(FINDING_STATUS).map(([k, v]) => (
                        <button
                          key={k}
                          onClick={() => onUpdate(finding.id, { status: k as Finding['status'] })}
                          className={`text-xs px-2 py-0.5 rounded border border-current opacity-70 hover:opacity-100 ${finding.status === k ? 'font-bold opacity-100' : ''}`}
                        >
                          {v.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => onDelete(finding.id)}
                  className="text-current opacity-50 hover:opacity-100 transition-opacity"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

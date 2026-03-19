import type { AuditSession } from '../types';
import { calcSessionStats } from '../utils/compliance';
import ComplianceBar from './ComplianceBar';
import { Plus, Trash2, FileText, Calendar, User, Building } from 'lucide-react';

interface Props {
  sessions: AuditSession[];
  activeSessionId: string | null;
  onSelect: (id: string) => void;
  onCreate: () => void;
  onDelete: (id: string) => void;
}

const STATUS_BADGE: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-600',
  in_progress: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
};
const STATUS_LABEL: Record<string, string> = {
  draft: 'Entwurf',
  in_progress: 'In Bearbeitung',
  completed: 'Abgeschlossen',
};

export default function SessionList({ sessions, activeSessionId, onSelect, onCreate, onDelete }: Props) {
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Audits</h2>
        <button
          onClick={onCreate}
          className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
        >
          <Plus size={14} />
          Neu
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {sessions.length === 0 && (
          <div className="p-6 text-center text-gray-400">
            <FileText size={32} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">Noch kein Audit vorhanden.<br />Erstellen Sie ein neues Audit.</p>
          </div>
        )}
        {sessions.map(session => {
          const stats = calcSessionStats(session);
          const isActive = session.id === activeSessionId;
          return (
            <div
              key={session.id}
              onClick={() => onSelect(session.id)}
              className={`p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${isActive ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-gray-900 truncate">
                    {session.title || 'Unbenanntes Audit'}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                    <Calendar size={10} />
                    {session.auditDate}
                  </div>
                  {session.organization && (
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Building size={10} />
                      {session.organization}
                    </div>
                  )}
                  {session.auditor && (
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <User size={10} />
                      {session.auditor}
                    </div>
                  )}
                </div>
                <button
                  onClick={e => { e.stopPropagation(); onDelete(session.id); }}
                  className="text-gray-400 hover:text-red-500 transition-colors p-1 flex-shrink-0"
                  title="Löschen"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <div className="mt-2">
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${STATUS_BADGE[session.status]}`}>
                    {STATUS_LABEL[session.status]}
                  </span>
                  <span className="text-xs text-gray-500">{session.cameras.length} Kamera(s)</span>
                </div>
                <ComplianceBar stats={stats} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

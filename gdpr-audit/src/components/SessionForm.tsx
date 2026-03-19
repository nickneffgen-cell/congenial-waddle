import type { AuditSession } from '../types';

interface Props {
  session: AuditSession;
  onChange: (updates: Partial<AuditSession>) => void;
}

export default function SessionForm({ session, onChange }: Props) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-base font-semibold text-gray-900 mb-4">Audit-Stammdaten</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Titel des Audits *</label>
          <input
            type="text"
            value={session.title}
            onChange={e => onChange({ title: e.target.value })}
            placeholder="z.B. DSGVO-Audit Videoüberwachung 2024"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Auditdatum *</label>
          <input
            type="date"
            value={session.auditDate}
            onChange={e => onChange({ auditDate: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Auditor *</label>
          <input
            type="text"
            value={session.auditor}
            onChange={e => onChange({ auditor: e.target.value })}
            placeholder="Name des Prüfers / Datenschutzbeauftragter"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Organisation *</label>
          <input
            type="text"
            value={session.organization}
            onChange={e => onChange({ organization: e.target.value })}
            placeholder="Name des Unternehmens / der Organisation"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Standort</label>
          <input
            type="text"
            value={session.location}
            onChange={e => onChange({ location: e.target.value })}
            placeholder="Gebäude / Adresse"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            value={session.status}
            onChange={e => onChange({ status: e.target.value as AuditSession['status'] })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="draft">Entwurf</option>
            <option value="in_progress">In Bearbeitung</option>
            <option value="completed">Abgeschlossen</option>
          </select>
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Prüfumfang / Scope</label>
          <textarea
            value={session.scope}
            onChange={e => onChange({ scope: e.target.value })}
            rows={2}
            placeholder="Beschreibung des Prüfumfangs (welche Bereiche, welche Systeme...)"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  );
}

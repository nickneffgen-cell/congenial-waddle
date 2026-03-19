import type { Camera } from '../types';

interface Props {
  camera: Camera;
  onChange: (updates: Partial<Camera>) => void;
  onClose: () => void;
}

const CAMERA_TYPES = [
  { value: 'indoor', label: 'Innenraum' },
  { value: 'outdoor', label: 'Außenbereich' },
  { value: 'ptz', label: 'PTZ (Schwenk/Neige/Zoom)' },
  { value: 'dome', label: 'Dome-Kamera' },
  { value: 'bullet', label: 'Bullet-Kamera' },
  { value: 'fisheye', label: 'Fisheye-Kamera' },
];

const RETENTION_OPTIONS = [
  { value: '24h', label: '24 Stunden' },
  { value: '48h', label: '48 Stunden' },
  { value: '72h', label: '72 Stunden (empfohlen)' },
  { value: '7d', label: '7 Tage' },
  { value: '14d', label: '14 Tage' },
  { value: '30d', label: '30 Tage' },
  { value: 'custom', label: 'Benutzerdefiniert' },
];

export default function CameraForm({ camera, onChange, onClose }: Props) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-200">
          <h3 className="text-base font-semibold text-gray-900">
            {camera.name ? `Kamera: ${camera.name}` : 'Neue Kamera'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl font-bold">×</button>
        </div>
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bezeichnung / Name *</label>
              <input
                type="text"
                value={camera.name}
                onChange={e => onChange({ name: e.target.value })}
                placeholder="z.B. Eingang Nord"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Typ</label>
              <select
                value={camera.type}
                onChange={e => onChange({ type: e.target.value as Camera['type'] })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {CAMERA_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Standort *</label>
              <input
                type="text"
                value={camera.location}
                onChange={e => onChange({ location: e.target.value })}
                placeholder="z.B. Erdgeschoss, Flur A"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Etage / Gebäude</label>
              <input
                type="text"
                value={camera.floor ?? ''}
                onChange={e => onChange({ floor: e.target.value })}
                placeholder="z.B. EG, 1. OG"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Zweck der Überwachung *</label>
              <textarea
                value={camera.purpose}
                onChange={e => onChange({ purpose: e.target.value })}
                rows={2}
                placeholder="z.B. Schutz vor Einbruch und Vandalismus am Haupteingang"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Erfassungsbereich</label>
              <input
                type="text"
                value={camera.coverageArea}
                onChange={e => onChange({ coverageArea: e.target.value })}
                placeholder="z.B. Eingangsbereich 5m × 3m, Parkplatz"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Speicherdauer *</label>
              <select
                value={camera.retentionPeriod}
                onChange={e => onChange({ retentionPeriod: e.target.value as Camera['retentionPeriod'] })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {RETENTION_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            {camera.retentionPeriod === 'custom' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Speicherdauer (Tage)</label>
                <input
                  type="number"
                  value={camera.retentionCustomDays ?? ''}
                  onChange={e => onChange({ retentionCustomDays: parseInt(e.target.value) })}
                  min={1}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Verantwortliche Person *</label>
              <input
                type="text"
                value={camera.responsible}
                onChange={e => onChange({ responsible: e.target.value })}
                placeholder="Name / Funktion"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hersteller / Modell</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={camera.vendor ?? ''}
                  onChange={e => onChange({ vendor: e.target.value })}
                  placeholder="Hersteller"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  value={camera.model ?? ''}
                  onChange={e => onChange({ model: e.target.value })}
                  placeholder="Modell"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Installationsdatum</label>
              <input
                type="date"
                value={camera.installDate ?? ''}
                onChange={e => onChange({ installDate: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4 space-y-3">
            <h4 className="text-sm font-medium text-gray-900">Eigenschaften</h4>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={camera.publicArea}
                onChange={e => onChange({ publicArea: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <span className="text-sm text-gray-700">Überwacht öffentlichen Bereich</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={camera.recordsAudio}
                onChange={e => onChange({ recordsAudio: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <span className="text-sm text-gray-700">Nimmt Audio auf</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={camera.hasSignage}
                onChange={e => onChange({ hasSignage: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <span className="text-sm text-gray-700">Hinweisschild vorhanden</span>
            </label>
            {camera.hasSignage && (
              <div className="ml-7">
                <label className="block text-sm text-gray-600 mb-1">Beschreibung des Hinweisschildes</label>
                <input
                  type="text"
                  value={camera.signageDescription ?? ''}
                  onChange={e => onChange({ signageDescription: e.target.value })}
                  placeholder="z.B. Standardschild DIN A5, mehrsprachig"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notizen</label>
            <textarea
              value={camera.notes ?? ''}
              onChange={e => onChange({ notes: e.target.value })}
              rows={2}
              placeholder="Weitere Anmerkungen..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="flex justify-end gap-3 p-5 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Schließen
          </button>
        </div>
      </div>
    </div>
  );
}

import type { Camera } from '../types';
import { calcCameraStats } from '../utils/compliance';
import ComplianceBar from './ComplianceBar';
import { Edit2, Trash2, Camera as CameraIcon, AlertCircle, CheckCircle } from 'lucide-react';
import { formatRetention } from '../utils/compliance';

interface Props {
  camera: Camera;
  onEdit: () => void;
  onDelete: () => void;
  onChecklist: () => void;
}

export default function CameraCard({ camera, onEdit, onDelete, onChecklist }: Props) {
  const stats = calcCameraStats(camera);
  const hasIssues = stats.nonCompliant > 0;

  return (
    <div className={`bg-white rounded-xl border ${hasIssues ? 'border-red-200' : 'border-gray-200'} p-4 hover:shadow-md transition-shadow`}>
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-start gap-2 flex-1 min-w-0">
          <CameraIcon size={18} className="text-gray-400 flex-shrink-0 mt-0.5" />
          <div className="min-w-0">
            <h4 className="font-semibold text-gray-900 text-sm truncate">{camera.name || 'Unbenannte Kamera'}</h4>
            <p className="text-xs text-gray-500 truncate">{camera.location}</p>
          </div>
        </div>
        <div className="flex gap-1 flex-shrink-0">
          <button onClick={onEdit} className="p-1.5 text-gray-400 hover:text-blue-500 transition-colors" title="Bearbeiten">
            <Edit2 size={14} />
          </button>
          <button onClick={onDelete} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors" title="Löschen">
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <div className="space-y-1.5 mb-3">
        {camera.purpose && (
          <p className="text-xs text-gray-600 line-clamp-2">{camera.purpose}</p>
        )}
        <div className="flex flex-wrap gap-2 text-xs text-gray-500">
          <span className="bg-gray-100 px-2 py-0.5 rounded">{formatRetention(camera.retentionPeriod, camera.retentionCustomDays)}</span>
          {camera.hasSignage ? (
            <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded flex items-center gap-1">
              <CheckCircle size={10} /> Schild vorhanden
            </span>
          ) : (
            <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded flex items-center gap-1">
              <AlertCircle size={10} /> Kein Schild
            </span>
          )}
          {camera.publicArea && <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded">Öffentlich</span>}
          {camera.recordsAudio && <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded">Audio</span>}
        </div>
      </div>

      <ComplianceBar stats={stats} />

      <button
        onClick={onChecklist}
        className="mt-3 w-full py-1.5 text-xs font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
      >
        Checkliste prüfen ({stats.pending} ausstehend)
      </button>
    </div>
  );
}

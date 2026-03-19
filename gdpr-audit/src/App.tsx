import { useState } from 'react';
import { useAuditStore } from './store/auditStore';
import type { Camera as CameraType, ComplianceStatus } from './types';
import { CAMERA_CHECKLIST, ORGANIZATIONAL_CHECKLIST } from './data/checklistItems';
import SessionList from './components/SessionList';
import SessionForm from './components/SessionForm';
import Dashboard from './components/Dashboard';
import CameraCard from './components/CameraCard';
import CameraForm from './components/CameraForm';
import ChecklistPanel from './components/ChecklistPanel';
import FindingsPanel from './components/FindingsPanel';
import ReportGenerator from './components/ReportGenerator';
import {
  LayoutDashboard,
  Camera,
  AlertTriangle,
  FileText,
  Building2,
  Menu,
  X,
  ShieldCheck,
} from 'lucide-react';

type Tab = 'dashboard' | 'cameras' | 'org_checklist' | 'findings' | 'report';

const TABS: { id: Tab; label: string; icon: React.ComponentType<{ size?: number }> }[] = [
  { id: 'dashboard', label: 'Übersicht', icon: LayoutDashboard },
  { id: 'cameras', label: 'Kameras', icon: Camera },
  { id: 'org_checklist', label: 'Organisation', icon: Building2 },
  { id: 'findings', label: 'Feststellungen', icon: AlertTriangle },
  { id: 'report', label: 'Bericht', icon: FileText },
];

export default function App() {
  const store = useAuditStore();
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [editCamera, setEditCamera] = useState<CameraType | null>(null);
  const [checklistCamera, setChecklistCamera] = useState<CameraType | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const session = store.activeSession;

  const handleCreateSession = () => {
    store.createSession({
      title: 'Neues Audit',
      auditDate: new Date().toISOString().split('T')[0],
    });
    setActiveTab('dashboard');
    setSidebarOpen(false);
  };

  const handleDeleteSession = (id: string) => {
    if (confirm('Audit wirklich löschen?')) {
      store.deleteSession(id);
    }
  };

  const handleAddCamera = () => {
    if (!session) return;
    const camera = store.addCamera(session.id, {});
    setEditCamera(camera);
  };

  const handleDeleteCamera = (cameraId: string) => {
    if (!session) return;
    if (confirm('Kamera wirklich löschen?')) {
      store.deleteCamera(session.id, cameraId);
      if (checklistCamera?.id === cameraId) setChecklistCamera(null);
    }
  };

  const handleCameraUpdate = (cameraId: string, updates: Partial<CameraType>) => {
    if (!session) return;
    store.updateCamera(session.id, cameraId, updates);
    setEditCamera(prev => prev?.id === cameraId ? { ...prev, ...updates } : prev);
  };

  const handleOpenChecklist = (camera: CameraType) => {
    const fresh = session?.cameras.find(c => c.id === camera.id);
    setChecklistCamera(fresh ?? camera);
    setEditCamera(null);
  };

  const handleCameraCheckUpdate = (checkId: string, status: ComplianceStatus, notes?: string) => {
    if (!session || !checklistCamera) return;
    store.updateCameraCheck(session.id, checklistCamera.id, checkId, status, notes);
    setChecklistCamera(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        complianceChecks: prev.complianceChecks.map(c =>
          c.checkId === checkId ? { ...c, status, notes } : c
        ),
      };
    });
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 fixed md:relative z-40 w-72 bg-white border-r border-gray-200 h-full flex flex-col transition-transform duration-200`}>
        <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-200" style={{ background: '#0f172a' }}>
          <ShieldCheck size={22} style={{ color: '#60a5fa' }} />
          <div>
            <div className="text-sm font-bold text-white leading-tight">DSGVO Audit</div>
            <div className="text-xs" style={{ color: '#94a3b8' }}>Videoüberwachung</div>
          </div>
          <button className="ml-auto md:hidden" style={{ color: '#94a3b8' }} onClick={() => setSidebarOpen(false)}>
            <X size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-hidden">
          <SessionList
            sessions={store.sessions}
            activeSessionId={store.activeSessionId}
            onSelect={id => { store.setActiveSessionId(id); setSidebarOpen(false); }}
            onCreate={handleCreateSession}
            onDelete={handleDeleteSession}
          />
        </div>
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/30 z-30 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-200 flex-shrink-0">
          <button className="md:hidden text-gray-500" onClick={() => setSidebarOpen(true)}>
            <Menu size={20} />
          </button>
          {session ? (
            <div className="flex-1 min-w-0">
              <h1 className="text-base font-semibold text-gray-900 truncate">{session.title || 'Unbenanntes Audit'}</h1>
              <p className="text-xs text-gray-500">{session.organization} · {session.auditDate}</p>
            </div>
          ) : (
            <div className="flex-1">
              <h1 className="text-base font-semibold text-gray-500">Kein Audit ausgewählt</h1>
            </div>
          )}
        </header>

        {!session ? (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center max-w-sm">
              <ShieldCheck size={48} className="mx-auto mb-4 text-gray-300" />
              <h2 className="text-xl font-semibold text-gray-700 mb-2">DSGVO Videoüberwachungs-Audit</h2>
              <p className="text-gray-500 text-sm mb-6">
                Erstellen Sie ein neues Audit oder wählen Sie ein bestehendes Audit aus der Seitenleiste.
              </p>
              <button
                onClick={handleCreateSession}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Neues Audit erstellen
              </button>
            </div>
          </div>
        ) : (
          <>
            <nav className="flex gap-1 px-4 pt-3 border-b border-gray-200 bg-white overflow-x-auto flex-shrink-0">
              {TABS.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => { setActiveTab(tab.id); setChecklistCamera(null); }}
                    className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap border-b-2 ${
                      activeTab === tab.id
                        ? 'border-blue-600 text-blue-600 bg-blue-50'
                        : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <Icon size={15} />
                    {tab.label}
                  </button>
                );
              })}
            </nav>

            <main className="flex-1 overflow-y-auto p-4 md:p-6">
              {activeTab === 'dashboard' && (
                <div className="max-w-4xl mx-auto space-y-4">
                  <SessionForm
                    session={session}
                    onChange={updates => store.updateSession(session.id, updates)}
                  />
                  <Dashboard session={session} />
                </div>
              )}

              {activeTab === 'cameras' && !checklistCamera && (
                <div className="max-w-4xl mx-auto">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base font-semibold text-gray-900">
                      Kameras ({session.cameras.length})
                    </h2>
                    <button
                      onClick={handleAddCamera}
                      className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                    >
                      <Camera size={14} />
                      Kamera hinzufügen
                    </button>
                  </div>
                  {session.cameras.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                      <Camera size={40} className="mx-auto mb-3 text-gray-300" />
                      <p className="text-gray-500 text-sm">Noch keine Kameras erfasst.</p>
                      <p className="text-gray-400 text-xs mt-1">Klicken Sie auf "Kamera hinzufügen".</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                      {session.cameras.map(camera => (
                        <CameraCard
                          key={camera.id}
                          camera={camera}
                          onEdit={() => setEditCamera(camera)}
                          onDelete={() => handleDeleteCamera(camera.id)}
                          onChecklist={() => handleOpenChecklist(camera)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'cameras' && checklistCamera && (
                <div className="max-w-3xl mx-auto">
                  <div className="flex items-center gap-3 mb-4">
                    <button
                      onClick={() => setChecklistCamera(null)}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      ← Zurück
                    </button>
                    <h2 className="text-base font-semibold text-gray-900">
                      Checkliste: {checklistCamera.name || 'Kamera'}
                    </h2>
                  </div>
                  <ChecklistPanel
                    title="DSGVO-Prüfpunkte für diese Kamera"
                    checklist={CAMERA_CHECKLIST}
                    checks={checklistCamera.complianceChecks}
                    onUpdate={handleCameraCheckUpdate}
                  />
                </div>
              )}

              {activeTab === 'org_checklist' && (
                <div className="max-w-3xl mx-auto">
                  <ChecklistPanel
                    title="Organisatorische DSGVO-Anforderungen"
                    checklist={ORGANIZATIONAL_CHECKLIST}
                    checks={session.organizationalChecks}
                    onUpdate={(checkId, status, notes) =>
                      store.updateOrganizationalCheck(session.id, checkId, status, notes)
                    }
                  />
                </div>
              )}

              {activeTab === 'findings' && (
                <div className="max-w-3xl mx-auto">
                  <FindingsPanel
                    session={session}
                    onAdd={finding => store.addFinding(session.id, finding)}
                    onUpdate={(id, updates) => store.updateFinding(session.id, id, updates)}
                    onDelete={id => store.deleteFinding(session.id, id)}
                  />
                </div>
              )}

              {activeTab === 'report' && (
                <div className="max-w-2xl mx-auto space-y-4">
                  <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <h3 className="text-base font-semibold text-gray-900 mb-3">Zusammenfassung & Empfehlungen</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Zusammenfassung</label>
                        <textarea
                          value={session.summary ?? ''}
                          onChange={e => store.updateSession(session.id, { summary: e.target.value })}
                          rows={4}
                          placeholder="Gesamtbewertung des Audits..."
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Handlungsempfehlungen</label>
                        <textarea
                          value={session.recommendations ?? ''}
                          onChange={e => store.updateSession(session.id, { recommendations: e.target.value })}
                          rows={4}
                          placeholder="Priorisierte Maßnahmen zur Verbesserung der Konformität..."
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                  <ReportGenerator session={session} />
                </div>
              )}
            </main>
          </>
        )}
      </div>

      {editCamera && (
        <CameraForm
          camera={editCamera}
          onChange={updates => handleCameraUpdate(editCamera.id, updates)}
          onClose={() => setEditCamera(null)}
        />
      )}
    </div>
  );
}

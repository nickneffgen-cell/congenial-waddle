import { useState } from 'react';
import type { ChecklistItem, ComplianceStatus } from '../types';
import { CATEGORY_LABELS, STATUS_LABELS } from '../data/checklistItems';
import StatusBadge from './StatusBadge';
import { ChevronDown, ChevronRight, Info } from 'lucide-react';

interface CheckRowProps {
  item: ChecklistItem;
  check: { status: ComplianceStatus; notes?: string };
  onUpdate: (status: ComplianceStatus, notes?: string) => void;
}

function CheckRow({ item, check, onUpdate }: CheckRowProps) {
  const [expanded, setExpanded] = useState(false);
  const [notes, setNotes] = useState(check.notes ?? '');

  return (
    <div className={`border rounded-lg overflow-hidden mb-2 ${check.status === 'non_compliant' ? 'border-red-200' : 'border-gray-200'}`}>
      <div className="flex items-start gap-3 p-3">
        <button
          onClick={() => setExpanded(e => !e)}
          className="text-gray-400 hover:text-gray-600 mt-0.5 flex-shrink-0"
        >
          {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium text-gray-900">{item.title}</span>
              {item.required && (
                <span className="text-xs bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded font-medium">Pflicht</span>
              )}
            </div>
            <StatusBadge status={check.status} small />
          </div>
          {item.legalBasis && (
            <div className="text-xs text-gray-500 mt-0.5">{item.legalBasis}</div>
          )}
        </div>
      </div>

      {expanded && (
        <div className="px-3 pb-3 border-t border-gray-100 pt-3 space-y-3">
          <p className="text-sm text-gray-600">{item.description}</p>
          {item.guidance && (
            <div className="flex gap-2 bg-blue-50 rounded-lg p-2.5">
              <Info size={14} className="text-blue-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-blue-700">{item.guidance}</p>
            </div>
          )}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Bewertung</label>
            <div className="flex flex-wrap gap-2">
              {(['compliant', 'partial', 'non_compliant', 'not_applicable', 'pending'] as ComplianceStatus[]).map(s => (
                <button
                  key={s}
                  onClick={() => onUpdate(s, notes)}
                  className={`px-3 py-1 text-xs rounded-full border font-medium transition-colors ${
                    check.status === s
                      ? s === 'compliant' ? 'bg-green-600 text-white border-green-600'
                        : s === 'non_compliant' ? 'bg-red-600 text-white border-red-600'
                        : s === 'partial' ? 'bg-yellow-500 text-white border-yellow-500'
                        : s === 'not_applicable' ? 'bg-gray-500 text-white border-gray-500'
                        : 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {STATUS_LABELS[s]}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Notizen / Nachweise</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              onBlur={() => onUpdate(check.status, notes)}
              rows={2}
              placeholder="Belege, Anmerkungen, Verbesserungsmaßnahmen..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      )}
    </div>
  );
}

interface Props {
  title: string;
  checklist: ChecklistItem[];
  checks: { checkId: string; status: ComplianceStatus; notes?: string }[];
  onUpdate: (checkId: string, status: ComplianceStatus, notes?: string) => void;
}

export default function ChecklistPanel({ title, checklist, checks, onUpdate }: Props) {
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());

  const toggleCategory = (cat: string) => {
    setCollapsedCategories(prev => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  const categories = [...new Set(checklist.map(c => c.category))];

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h3 className="text-base font-semibold text-gray-900 mb-4">{title}</h3>
      {categories.map(cat => {
        const items = checklist.filter(c => c.category === cat);
        const isCollapsed = collapsedCategories.has(cat);
        const catChecks = items.map(item => {
          const check = checks.find(c => c.checkId === item.id);
          return { item, check: check ?? { status: 'pending' as ComplianceStatus } };
        });
        const issues = catChecks.filter(c => c.check.status === 'non_compliant').length;
        const done = catChecks.filter(c => c.check.status !== 'pending').length;

        return (
          <div key={cat} className="mb-4">
            <button
              onClick={() => toggleCategory(cat)}
              className="w-full flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-2">
                {isCollapsed ? <ChevronRight size={16} className="text-gray-500" /> : <ChevronDown size={16} className="text-gray-500" />}
                <span className="text-sm font-semibold text-gray-800">{CATEGORY_LABELS[cat]}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                {issues > 0 && <span className="bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-medium">{issues} Problem(e)</span>}
                <span>{done}/{items.length}</span>
              </div>
            </button>
            {!isCollapsed && (
              <div className="mt-2">
                {catChecks.map(({ item, check }) => (
                  <CheckRow
                    key={item.id}
                    item={item}
                    check={check}
                    onUpdate={(status, notes) => onUpdate(item.id, status, notes)}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

import type { ComplianceStats } from '../types';
import { getComplianceBgColor, getComplianceColor } from '../utils/compliance';

interface Props {
  stats: ComplianceStats;
  showDetails?: boolean;
}

export default function ComplianceBar({ stats, showDetails }: Props) {
  const { complianceRate, compliant, nonCompliant, partial, notApplicable, pending, totalChecks } = stats;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1">
        <span className={`text-sm font-semibold ${getComplianceColor(complianceRate)}`}>
          {complianceRate}% konform
        </span>
        {showDetails && (
          <span className="text-xs text-gray-500">{totalChecks} Prüfpunkte</span>
        )}
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${getComplianceBgColor(complianceRate)}`}
          style={{ width: `${complianceRate}%` }}
        />
      </div>
      {showDetails && (
        <div className="flex gap-3 mt-2 text-xs text-gray-600 flex-wrap">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
            {compliant} konform
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
            {nonCompliant} nicht konform
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-yellow-500 inline-block" />
            {partial} teilweise
          </span>
          {notApplicable > 0 && (
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-gray-400 inline-block" />
              {notApplicable} n/a
            </span>
          )}
          {pending > 0 && (
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-400 inline-block" />
              {pending} ausstehend
            </span>
          )}
        </div>
      )}
    </div>
  );
}

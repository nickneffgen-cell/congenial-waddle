import type { ComplianceStatus } from '../types';
import { STATUS_LABELS, STATUS_COLORS } from '../data/checklistItems';

interface Props {
  status: ComplianceStatus;
  small?: boolean;
}

export default function StatusBadge({ status, small }: Props) {
  return (
    <span className={`inline-flex items-center rounded-full font-medium ${STATUS_COLORS[status]} ${small ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm'}`}>
      {STATUS_LABELS[status]}
    </span>
  );
}

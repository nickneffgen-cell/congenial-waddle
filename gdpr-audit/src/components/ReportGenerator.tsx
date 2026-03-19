import type { AuditSession } from '../types';
import { calcSessionStats, calcCameraStats, formatRetention } from '../utils/compliance';
import { CAMERA_CHECKLIST, ORGANIZATIONAL_CHECKLIST } from '../data/checklistItems';
import { FileDown, Printer } from 'lucide-react';
import jsPDF from 'jspdf';

interface Props {
  session: AuditSession;
}

function generatePDF(session: AuditSession) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const margin = 20;
  const pageW = 210;
  const contentW = pageW - 2 * margin;
  let y = margin;

  const checkY = (needed = 20) => {
    if (y + needed > 280) {
      doc.addPage();
      y = margin;
    }
  };

  const addText = (text: string, fontSize: number, bold = false, color: [number, number, number] = [30, 30, 30]) => {
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    doc.setTextColor(...color);
    const lines = doc.splitTextToSize(text, contentW);
    checkY(lines.length * fontSize * 0.4 + 4);
    doc.text(lines, margin, y);
    y += lines.length * fontSize * 0.4 + 2;
  };

  const addSection = (title: string) => {
    checkY(16);
    y += 4;
    doc.setFillColor(37, 99, 235);
    doc.rect(margin, y - 5, contentW, 8, 'F');
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text(title, margin + 2, y);
    y += 6;
    doc.setTextColor(30, 30, 30);
  };

  const stats = calcSessionStats(session);

  // Header
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageW, 40, 'F');
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('DSGVO Videoüberwachungs-Audit', margin, 18);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Datenschutz-Prüfbericht gemäß EU-DSGVO und BDSG', margin, 28);
  doc.setTextColor(30, 30, 30);
  y = 50;

  // Meta
  addSection('Audit-Informationen');
  y += 2;
  const meta = [
    ['Audit-Titel', session.title || '-'],
    ['Datum', session.auditDate],
    ['Auditor', session.auditor || '-'],
    ['Organisation', session.organization || '-'],
    ['Standort', session.location || '-'],
    ['Status', session.status === 'completed' ? 'Abgeschlossen' : session.status === 'in_progress' ? 'In Bearbeitung' : 'Entwurf'],
    ['Anzahl Kameras', session.cameras.length.toString()],
  ];
  meta.forEach(([label, value]) => {
    checkY(8);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(label + ':', margin, y);
    doc.setFont('helvetica', 'normal');
    doc.text(value, margin + 50, y);
    y += 6;
  });

  // Compliance Summary
  addSection('Compliance-Zusammenfassung');
  y += 2;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(`Gesamtkonformität: ${stats.complianceRate}%`, margin, y);
  y += 6;

  // Draw bar
  doc.setFillColor(229, 231, 235);
  doc.rect(margin, y, contentW, 5, 'F');
  const barW = (stats.complianceRate / 100) * contentW;
  const barColor: [number, number, number] = stats.complianceRate >= 80 ? [34, 197, 94] : stats.complianceRate >= 60 ? [234, 179, 8] : [239, 68, 68];
  doc.setFillColor(...barColor);
  doc.rect(margin, y, barW, 5, 'F');
  y += 10;

  const summaryItems = [
    ['Konform', stats.compliant.toString()],
    ['Nicht konform', stats.nonCompliant.toString()],
    ['Teilweise konform', stats.partial.toString()],
    ['Nicht anwendbar', stats.notApplicable.toString()],
    ['Ausstehend', stats.pending.toString()],
    ['Gesamt Prüfpunkte', stats.totalChecks.toString()],
  ];
  summaryItems.forEach(([label, value]) => {
    checkY(7);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(label + ': ' + value, margin, y);
    y += 5;
  });

  // Scope
  if (session.scope) {
    addSection('Prüfumfang');
    y += 2;
    addText(session.scope, 9);
  }

  // Cameras
  if (session.cameras.length > 0) {
    addSection('Kameraübersicht');
    session.cameras.forEach((camera, idx) => {
      checkY(30);
      y += 3;
      const cStats = calcCameraStats(camera);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setFillColor(243, 244, 246);
      doc.rect(margin, y - 4, contentW, 7, 'F');
      doc.text(`${idx + 1}. ${camera.name || 'Unbenannte Kamera'}`, margin + 2, y);
      y += 5;

      const camInfo = [
        ['Standort', camera.location],
        ['Typ', camera.type],
        ['Zweck', camera.purpose],
        ['Speicherdauer', formatRetention(camera.retentionPeriod, camera.retentionCustomDays)],
        ['Konformität', `${cStats.complianceRate}%`],
        ['Hinweisschild', camera.hasSignage ? 'Ja' : 'Nein'],
        ['Öffentlicher Bereich', camera.publicArea ? 'Ja' : 'Nein'],
      ];
      camInfo.forEach(([label, value]) => {
        if (!value) return;
        checkY(6);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.text(label + ':', margin + 2, y);
        doc.setFont('helvetica', 'normal');
        const lines = doc.splitTextToSize(value, contentW - 45);
        doc.text(lines, margin + 45, y);
        y += Math.max(lines.length * 3.5, 5);
      });

      // Non-compliant checks
      const nonCompliant = camera.complianceChecks.filter(c => c.status === 'non_compliant');
      if (nonCompliant.length > 0) {
        checkY(8);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(185, 28, 28);
        doc.text('Nicht erfüllte Anforderungen:', margin + 2, y);
        doc.setTextColor(30, 30, 30);
        y += 5;
        nonCompliant.forEach(nc => {
          const item = CAMERA_CHECKLIST.find(c => c.id === nc.checkId);
          if (!item) return;
          checkY(6);
          doc.setFontSize(8);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(185, 28, 28);
          const lines = doc.splitTextToSize('• ' + item.title, contentW - 6);
          doc.text(lines, margin + 4, y);
          doc.setTextColor(30, 30, 30);
          y += lines.length * 4;
        });
      }
      y += 2;
    });
  }

  // Organizational checks
  addSection('Organisatorische Maßnahmen');
  y += 2;
  const orgNonCompliant = session.organizationalChecks.filter(c => c.status === 'non_compliant');
  const orgCompliant = session.organizationalChecks.filter(c => c.status === 'compliant');
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Konform: ${orgCompliant.length} | Nicht konform: ${orgNonCompliant.length}`, margin, y);
  y += 6;

  if (orgNonCompliant.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(185, 28, 28);
    doc.text('Nicht erfüllte organisatorische Anforderungen:', margin, y);
    doc.setTextColor(30, 30, 30);
    y += 5;
    orgNonCompliant.forEach(nc => {
      const item = ORGANIZATIONAL_CHECKLIST.find(c => c.id === nc.checkId);
      if (!item) return;
      checkY(6);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(185, 28, 28);
      const lines = doc.splitTextToSize('• ' + item.title, contentW - 4);
      doc.text(lines, margin + 2, y);
      doc.setTextColor(30, 30, 30);
      y += lines.length * 4;
    });
  }

  // Findings
  if (session.findings.length > 0) {
    addSection('Feststellungen und Maßnahmen');
    y += 2;
    const severityLabel: Record<string, string> = {
      critical: 'KRITISCH', high: 'HOCH', medium: 'MITTEL', low: 'NIEDRIG', info: 'HINWEIS'
    };
    session.findings.forEach(finding => {
      checkY(20);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text(`[${severityLabel[finding.severity]}] ${finding.title}`, margin, y);
      y += 5;
      if (finding.description) {
        doc.setFont('helvetica', 'normal');
        const lines = doc.splitTextToSize(finding.description, contentW);
        doc.text(lines, margin, y);
        y += lines.length * 4;
      }
      if (finding.recommendation) {
        doc.setFont('helvetica', 'italic');
        const lines = doc.splitTextToSize('Empfehlung: ' + finding.recommendation, contentW);
        doc.text(lines, margin, y);
        y += lines.length * 4;
      }
      y += 3;
    });
  }

  // Summary and Recommendations
  if (session.summary || session.recommendations) {
    addSection('Zusammenfassung und Empfehlungen');
    y += 2;
    if (session.summary) {
      addText('Zusammenfassung:', 9, true);
      addText(session.summary, 9);
      y += 2;
    }
    if (session.recommendations) {
      addText('Empfehlungen:', 9, true);
      addText(session.recommendations, 9);
    }
  }

  // Footer on each page
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(150, 150, 150);
    doc.text(`DSGVO Audit – ${session.organization || 'Audit'} – ${session.auditDate}`, margin, 292);
    doc.text(`Seite ${i} von ${totalPages}`, pageW - margin - 20, 292);
  }

  doc.save(`DSGVO_Audit_${session.organization || 'Export'}_${session.auditDate}.pdf`);
}

export default function ReportGenerator({ session }: Props) {
  const stats = calcSessionStats(session);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-base font-semibold text-gray-900 mb-2">Auditbericht</h3>
      <p className="text-sm text-gray-500 mb-4">
        Exportieren Sie den vollständigen DSGVO-Auditbericht als PDF oder drucken Sie ihn direkt.
      </p>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6 text-center">
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="text-xl font-bold text-gray-900">{stats.complianceRate}%</div>
          <div className="text-xs text-gray-500">Konformitätsrate</div>
        </div>
        <div className="p-3 bg-red-50 rounded-lg">
          <div className="text-xl font-bold text-red-700">{stats.nonCompliant}</div>
          <div className="text-xs text-gray-500">Nicht konform</div>
        </div>
        <div className="p-3 bg-orange-50 rounded-lg">
          <div className="text-xl font-bold text-orange-700">
            {session.findings.filter(f => f.status === 'open').length}
          </div>
          <div className="text-xs text-gray-500">Offene Feststellungen</div>
        </div>
      </div>

      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Zusammenfassung</label>
          <textarea
            value={session.summary ?? ''}
            onChange={_e => { /* read-only */ }}
            rows={3}
            readOnly
            placeholder="Zusammenfassung wird automatisch generiert oder kann manuell ergänzt werden..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-gray-50"
          />
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => generatePDF(session)}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <FileDown size={16} />
          Als PDF exportieren
        </button>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
        >
          <Printer size={16} />
          Drucken
        </button>
      </div>
    </div>
  );
}

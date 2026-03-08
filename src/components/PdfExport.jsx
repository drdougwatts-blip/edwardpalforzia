import { useState, useMemo } from 'react';
import { useDoses } from '../hooks/useDoses';
import { useClinicVisits } from '../hooks/useClinicVisits';
import { format, subDays, startOfDay, endOfDay, eachDayOfInterval, isWithinInterval } from 'date-fns';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default function PdfExport() {
  const { doses } = useDoses();
  const { visits, latestVisit } = useClinicVisits();

  const today = new Date();
  const [endDate, setEndDate] = useState(format(today, 'yyyy-MM-dd'));
  const [startDate, setStartDate] = useState(format(subDays(today, 13), 'yyyy-MM-dd'));

  const report = useMemo(() => {
    const start = startOfDay(new Date(startDate));
    const end = endOfDay(new Date(endDate));
    const interval = { start, end };
    const days = eachDayOfInterval({ start, end: startOfDay(new Date(endDate)) });

    const periodDoses = doses.filter(d => {
      const date = d.date?.toDate ? d.date.toDate() : new Date(d.date);
      return isWithinInterval(date, interval);
    });

    const reactions = periodDoses.filter(d => d.reactionSeverity !== 'none');
    const adherence = days.length > 0 ? Math.round((periodDoses.length / days.length) * 100) : 0;

    const periodVisits = visits.filter(v => {
      const date = v.date?.toDate ? v.date.toDate() : new Date(v.date);
      return isWithinInterval(date, interval);
    });

    return { start, end, days, periodDoses, reactions, adherence, periodVisits, currentDose: latestVisit?.newDose || 0 };
  }, [doses, visits, latestVisit, startDate, endDate]);

  const generatePdf = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Header
    doc.setFontSize(16);
    doc.text('Edward — Palforzia Immunotherapy Report', pageWidth / 2, 20, { align: 'center' });
    doc.setFontSize(10);
    doc.text(
      `${format(report.start, 'dd MMM yyyy')} – ${format(report.end, 'dd MMM yyyy')}  |  Generated: ${format(new Date(), 'dd MMM yyyy')}`,
      pageWidth / 2, 28, { align: 'center' }
    );

    // Summary
    doc.setFontSize(12);
    doc.text('Summary', 14, 40);
    doc.setFontSize(10);
    doc.text(`Current dose: ${report.currentDose}mg`, 14, 48);
    doc.text(`Adherence: ${report.adherence}%`, 14, 54);
    doc.text(`Doses given: ${report.periodDoses.length} / ${report.days.length} expected`, 14, 60);

    // Dose table
    let yPos = 70;
    doc.setFontSize(12);
    doc.text('Dose Log', 14, yPos);

    const tableData = report.periodDoses.map(d => {
      const date = d.date?.toDate ? d.date.toDate() : new Date(d.date);
      return [
        format(date, 'dd MMM yyyy'),
        d.time,
        `${d.doseAmount}mg`,
        d.givenBy,
        d.reactionSeverity,
        d.antihistamineGiven ? 'Yes' : 'No',
        (d.notes || '').substring(0, 40),
      ];
    });

    doc.autoTable({
      startY: yPos + 4,
      head: [['Date', 'Time', 'Dose', 'Given By', 'Reaction', 'Antihistamine', 'Notes']],
      body: tableData,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [66, 133, 244] },
    });

    yPos = doc.lastAutoTable.finalY + 10;

    // Reactions
    if (report.reactions.length > 0) {
      doc.setFontSize(12);
      doc.text('Reactions', 14, yPos);
      yPos += 6;
      doc.setFontSize(9);
      report.reactions.forEach(d => {
        const date = d.date?.toDate ? d.date.toDate() : new Date(d.date);
        const text = `${format(date, 'dd MMM')} — ${d.reactionSeverity}${d.notes ? ': ' + d.notes : ''}`;
        doc.text(text, 14, yPos);
        yPos += 5;
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }
      });
      yPos += 5;
    }

    // Clinic visits
    if (report.periodVisits.length > 0) {
      doc.setFontSize(12);
      doc.text('Clinic Visits', 14, yPos);
      yPos += 6;
      doc.setFontSize(9);
      report.periodVisits.forEach(v => {
        const date = v.date?.toDate ? v.date.toDate() : new Date(v.date);
        doc.text(`${format(date, 'dd MMM yyyy')} — ${v.previousDose}mg → ${v.newDose}mg`, 14, yPos);
        yPos += 5;
        if (v.notes) {
          doc.text(`  Notes: ${v.notes}`, 14, yPos);
          yPos += 5;
        }
      });
    }

    doc.save(`edward-palforzia-report-${format(report.start, 'yyyy-MM-dd')}-to-${format(report.end, 'yyyy-MM-dd')}.pdf`);
  };

  return (
    <div className="page-container">
      <h2>PDF Export</h2>
      <div className="filter-bar">
        <label>From:</label>
        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
        <label>To:</label>
        <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
      </div>

      <div className="export-preview">
        <h4>Report Preview</h4>
        <p>Current dose: <strong>{report.currentDose}mg</strong></p>
        <p>Adherence: <strong>{report.adherence}%</strong></p>
        <p>Doses: <strong>{report.periodDoses.length} / {report.days.length}</strong></p>
        <p>Reactions: <strong>{report.reactions.length}</strong></p>
        <p>Clinic visits: <strong>{report.periodVisits.length}</strong></p>
      </div>

      <button className="btn btn-primary btn-lg mt-3" onClick={generatePdf}>
        Download PDF Report
      </button>
    </div>
  );
}

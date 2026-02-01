import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AuditResults } from '../types';

export const exportResultsToPDF = (results: AuditResults) => {
  const doc = new jsPDF();
  
  // Calculate Grand Totals
  const grandTotalOwed = results.userSummaries.reduce((sum, u) => sum + u.totalOwed, 0);
  const grandTotalSent = results.userSummaries.reduce((sum, u) => sum + u.totalSent, 0);
  const totalBalance = grandTotalSent - grandTotalOwed;
  
  // Title Header
  doc.setFontSize(22);
  doc.setTextColor(15, 23, 42); // slate-900
  doc.setFont('helvetica', 'bold');
  doc.text('XisaabiyePro Audit Report', 14, 20);
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(`Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 14, 28);
  
  // --- Financial Portfolio Overview ---
  doc.setFillColor(248, 250, 252); // slate-50
  doc.roundedRect(14, 35, 182, 30, 2, 2, 'F');
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('FINANCIAL PORTFOLIO OVERVIEW', 18, 42);
  
  // Owed Box
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text('Total Portfolio Owed:', 20, 52);
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text(`$${grandTotalOwed.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, 20, 58);
  
  // Sent Box
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text('Total Portfolio Sent:', 85, 52);
  doc.setFontSize(12);
  doc.setTextColor(37, 99, 235); // blue-600
  doc.text(`$${grandTotalSent.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, 85, 58);
  
  // Net Balance Box
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text('Net Collection Balance:', 150, 52);
  doc.setFontSize(12);
  doc.setTextColor(totalBalance < 0 ? 220 : 22, totalBalance < 0 ? 38 : 163, totalBalance < 0 ? 38 : 74);
  doc.text(`${totalBalance < 0 ? '-' : '+'}$${Math.abs(totalBalance).toLocaleString(undefined, { minimumFractionDigits: 2 })}`, 150, 58);

  // Summary Note
  doc.setFontSize(11);
  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'italic');
  const splitNote = doc.splitTextToSize(`Executive Note: ${results.summaryNote}`, 180);
  doc.text(splitNote, 14, 75);
  
  const startY = 80 + (splitNote.length * 5);

  // Reconciliation Table
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text('Individual Payment Reconciliation', 14, startY); 
  
  autoTable(doc, {
    startY: startY + 5,
    head: [['User ID', 'Name', 'Owed (Debit)', 'Sent (Credit)', 'Balance']],
    body: [
      ...results.userSummaries.map(u => [
        u.userId,
        u.userName,
        `$${u.totalOwed.toFixed(2)}`,
        `$${u.totalSent.toFixed(2)}`,
        { 
          content: `$${u.balance.toFixed(2)}`, 
          styles: { textColor: u.balance < 0 ? [220, 38, 38] : [22, 163, 74], fontStyle: 'bold' } 
        }
      ]),
      // Footer Row
      [
        { content: 'TOTALS', colSpan: 2, styles: { fillColor: [241, 245, 249], fontStyle: 'bold', halign: 'right' } },
        { content: `$${grandTotalOwed.toFixed(2)}`, styles: { fillColor: [241, 245, 249], fontStyle: 'bold' } },
        { content: `$${grandTotalSent.toFixed(2)}`, styles: { fillColor: [241, 245, 249], fontStyle: 'bold' } },
        { 
          content: `$${totalBalance.toFixed(2)}`, 
          styles: { fillColor: [241, 245, 249], fontStyle: 'bold', textColor: totalBalance < 0 ? [220, 38, 38] : [22, 163, 74] } 
        }
      ]
    ],
    theme: 'striped',
    headStyles: { fillColor: [15, 23, 42], fontSize: 9 },
    columnStyles: {
      2: { halign: 'right' },
      3: { halign: 'right' },
      4: { halign: 'right' }
    },
    alternateRowStyles: { fillColor: [252, 252, 252] }
  });
  
  const finalY = (doc as any).lastAutoTable?.finalY || 150;
  
  // Defaulters List
  if (results.missingPayments.length > 0) {
    if (finalY > 240) doc.addPage();
    const listY = (finalY > 240) ? 20 : finalY + 15;
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(185, 28, 28); // red-700
    doc.text('Defaulters (Zero Payments Found)', 14, listY);
    
    results.missingPayments.forEach((entry, idx) => {
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(51, 65, 85);
      doc.text(`> ${entry}`, 20, listY + 8 + (idx * 6));
    });
  }
  
  // Footer with Page Numbers
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(`XisaabiyePro Financial Integrity Report - Confidential | Page ${i} of ${pageCount}`, 14, doc.internal.pageSize.height - 10);
  }
  
  doc.save(`XisaabiyePro_Report_${new Date().getTime()}.pdf`);
};
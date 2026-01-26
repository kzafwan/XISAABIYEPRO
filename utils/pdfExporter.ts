
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AuditResults } from '../types';

export const exportResultsToPDF = (results: AuditResults) => {
  const doc = new jsPDF();
  
  // Title
  doc.setFontSize(24);
  doc.setTextColor(30, 41, 59);
  doc.text('XisaabiyePro Audit Report', 14, 22);
  
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text(`Audit Date: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 14, 30);
  
  // Summary Note (English)
  doc.setFontSize(11);
  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'italic');
  const splitText = doc.splitTextToSize(`Executive Summary: ${results.summaryNote}`, 180);
  doc.text(splitText, 14, 40);
  
  // User Summary Table
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(30, 41, 59);
  doc.text('Payment Reconciliation Detail', 14, 58 + (splitText.length * 2)); 
  
  autoTable(doc, {
    startY: 64 + (splitText.length * 2),
    head: [['User ID', 'Name', 'Phone', 'Owed', 'Sent', 'Balance']],
    body: results.userSummaries.map(u => [
      u.userId,
      u.userName,
      u.phoneNumber || '-',
      `$${u.totalOwed.toFixed(2)}`,
      `$${u.totalSent.toFixed(2)}`,
      { 
        content: `$${u.balance.toFixed(2)}`, 
        styles: { textColor: u.balance < 0 ? [220, 38, 38] : [22, 163, 74], fontStyle: 'bold' } 
      }
    ]),
    theme: 'grid',
    headStyles: { fillColor: [15, 23, 42], fontSize: 9 },
    columnStyles: {
      5: { fontStyle: 'bold' }
    },
    alternateRowStyles: { fillColor: [248, 250, 252] }
  });
  
  const finalY = (doc as any).lastAutoTable?.finalY || 150;
  
  // Missing Payments
  if (results.missingPayments.length > 0) {
    doc.setFontSize(14);
    doc.setTextColor(220, 38, 38);
    doc.text('Defaulters (Unpaid List)', 14, finalY + 15);
    
    results.missingPayments.forEach((entry, idx) => {
      doc.setFontSize(10);
      doc.setTextColor(51, 65, 85);
      doc.text(`• ${entry}`, 20, finalY + 25 + (idx * 6));
    });
  }
  
  // Footer
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(`XisaabiyePro - Financial Integrity Report | Page ${i} of ${pageCount}`, 14, doc.internal.pageSize.height - 10);
  }
  
  doc.save(`XisaabiyePro_Audit_${new Date().getTime()}.pdf`);
};

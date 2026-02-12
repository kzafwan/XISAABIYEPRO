import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AuditResults } from '../types';

export const exportResultsToPDF = (results: AuditResults) => {
  const doc = new jsPDF();
  
  // Sort users: Normal first, Late payers at the bottom
  const sortedSummaries = [...results.userSummaries].sort((a, b) => {
    const aLate = a.matchedTransactions.some(tx => tx.isLate);
    const bLate = b.matchedTransactions.some(tx => tx.isLate);
    if (aLate && !bLate) return 1;
    if (!aLate && bLate) return -1;
    return 0;
  });

  const grandTotalOwed = results.userSummaries.reduce((sum, u) => sum + u.totalOwed, 0);
  const grandTotalSent = results.userSummaries.reduce((sum, u) => sum + u.totalSent, 0);
  const totalBalance = grandTotalSent - grandTotalOwed;
  
  doc.setFontSize(22);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.text('XisaabiyePro Audit Report', 14, 20);
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(`Generated: ${new Date().toLocaleDateString()} • Policy: Late Payments (After 8PM) marked red.`, 14, 28);
  
  // Overview Box
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, 35, 182, 30, 2, 2, 'F');
  
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text('Total Owed:', 20, 50);
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text(`$${grandTotalOwed.toLocaleString()}`, 20, 58);
  
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text('Total Sent:', 85, 50);
  doc.setFontSize(12);
  doc.setTextColor(37, 99, 235);
  doc.text(`$${grandTotalSent.toLocaleString()}`, 85, 58);
  
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text('Net Balance:', 150, 50);
  doc.setFontSize(12);
  doc.setTextColor(totalBalance < 0 ? 220 : 22, totalBalance < 0 ? 38 : 163, totalBalance < 0 ? 38 : 74);
  doc.text(`$${totalBalance.toLocaleString()}`, 150, 58);

  // Reconciliation Table
  const tableData: any[] = [];
  sortedSummaries.forEach(u => {
    const lateTx = u.matchedTransactions.find(tx => tx.isLate);
    const lastTime = lateTx ? lateTx.time : (u.matchedTransactions[u.matchedTransactions.length-1]?.time || '--:--');

    // Parent User Row
    tableData.push([
      u.userId,
      { content: u.userName, styles: { fontStyle: 'bold', textColor: lateTx ? [220, 38, 38] : [15, 23, 42] } },
      { content: lastTime, styles: { halign: 'center', textColor: lateTx ? [220, 38, 38] : [100, 116, 139] } },
      `$${u.totalOwed.toFixed(2)}`,
      `$${u.totalSent.toFixed(2)}`,
      { content: `$${u.balance.toFixed(2)}`, styles: { textColor: (u.balance < 0 ? [220, 38, 38] : [22, 163, 74]) as [number, number, number], fontStyle: 'bold' } }
    ]);
  });

  autoTable(doc, {
    startY: 75,
    head: [['ID', 'Full Name', 'Last/Late Time', 'Owed', 'Sent', 'Balance']],
    body: tableData,
    theme: 'striped',
    headStyles: { fillColor: [15, 23, 42], textColor: 255, halign: 'center' },
    columnStyles: {
      0: { cellWidth: 25 },
      2: { halign: 'center', cellWidth: 35 },
      3: { halign: 'right' },
      4: { halign: 'right' },
      5: { halign: 'right' }
    }
  });

  doc.save(`Audit_Report_Late_Priority_${new Date().getTime()}.pdf`);
};

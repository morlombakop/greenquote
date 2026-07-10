import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { InstallmentOffer, PdfQuoteData } from '@/lib/utils/types';

export const generateQuotePdf = (
  quote: PdfQuoteData,
  parsedOffers: InstallmentOffer[]
) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  doc.setFillColor(30, 41, 59); // Slate-800
  doc.rect(0, 0, 210, 40, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text('GreenQuote Financial', 15, 25);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('Solar Pre-Qualification Certificate', 15, 32);

  doc.setTextColor(100, 116, 139);
  doc.setFontSize(9);
  const dateStr = quote.createdAt
    ? new Date(quote.createdAt).toLocaleDateString('de-DE')
    : new Date().toLocaleDateString('de-DE');
  doc.text(`Issued Date: ${dateStr}`, 145, 20);

  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('1. Parameters Summary', 15, 55);

  autoTable(doc, {
    startY: 60,
    theme: 'plain',
    headStyles: { fontStyle: 'bold', textColor: [100, 116, 139] },
    bodyStyles: { textColor: [30, 41, 59] },
    columnStyles: {
      0: { cellWidth: 45, fontStyle: 'bold' },
      1: { cellWidth: 50 },
      2: { cellWidth: 45, fontStyle: 'bold' },
      3: { cellWidth: 50 },
    },
    body: [
      [
        'Customer Name:',
        quote.fullName,
        'System Dimension:',
        `${quote.systemSizeKw.toFixed(2)} kWp`,
      ],
      [
        'Email Address:',
        quote.email,
        'Monthly Usage:',
        `${quote.monthlyConsumptionKwh} kWh`,
      ],
      [
        'Installation Address:',
        quote.address,
        'Gross System Price:',
        `€${quote.systemPrice.toLocaleString('de-DE', { minimumFractionDigits: 2 })}`,
      ],
      [
        'Credit Risk Band:',
        `Band ${quote.riskBand}`,
        'Financing Principal:',
        `€${quote.principalAmount.toLocaleString('de-DE', { minimumFractionDigits: 2 })}`,
      ],
    ],
  });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  // @ts-expect-error - autoTable injects finalY property onto internal state
  const initialY = doc.lastAutoTable.finalY || 110;
  doc.text('2. Calculated Financing Product Options', 15, initialY + 15);

  const tableRows = parsedOffers.map((offer) => {
    const totalCost = offer.monthlyPayment * offer.termYears * 12;
    return [
      `${offer.termYears} Years (${offer.termYears * 12} Mos)`,
      `${offer.apr}%`,
      `€${offer.principalUsed.toLocaleString('de-DE', { minimumFractionDigits: 2 })}`,
      `€${offer.monthlyPayment.toLocaleString('de-DE', { minimumFractionDigits: 2 })}`,
      `€${totalCost.toLocaleString('de-DE', { minimumFractionDigits: 2 })}`,
    ];
  });

  autoTable(doc, {
    startY: initialY + 20,
    theme: 'striped',
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    head: [
      [
        'Amortization Term',
        'APR %',
        'Principal Base',
        'Monthly Installment',
        'Aggregate Total Cost',
      ],
    ],
    body: tableRows,
  });

  // @ts-expect-error ignore type error
  const finalY = doc.lastAutoTable.finalY || 200;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(148, 163, 184);
  doc.text(
    'Disclaimer: This document constitutes an initial soft-qualification estimate based on provided energy benchmarks and risk profiles.',
    15,
    finalY + 15,
    { maxWidth: 180 }
  );

  // Save document to client browser
  doc.save(
    `GreenQuote_${quote.fullName.replace(/\s+/g, '_')}_${quote.id.slice(0, 8)}.pdf`
  );
};

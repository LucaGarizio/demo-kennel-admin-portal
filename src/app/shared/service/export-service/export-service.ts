import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Injectable({ providedIn: 'root' })
export class ExportService {
  exportPDF(filename: string, rows: any[], columns: { key: string; header: string }[]) {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
    });

    doc.setFontSize(16);

    const head = [columns.map((c) => c.header)];
    const moneyFields = ['boarding_fee', 'deposit', 'outstanding_balance', 'total_due'];

    const body = rows.map((r) =>
      columns.map((c) => {
        const val = r[c.key] ?? r.raw?.[c.key] ?? '';

        if (moneyFields.includes(c.key)) {
          return this.formatEuro(val);
        }

        return val;
      })
    );

    autoTable(doc, {
      head,
      body,
      startY: 10,

      columnStyles: {
        0: { cellWidth: 30 },
        1: { cellWidth: 28 },
        2: { cellWidth: 20 },
        3: { cellWidth: 40 },
        4: { cellWidth: 40 },
        5: { cellWidth: 25 },
        6: { cellWidth: 25 },
        7: { cellWidth: 25 },
        8: { cellWidth: 28 },
      },

      styles: {
        fontSize: 11,
        cellPadding: 4,
        lineWidth: 0.3,
      },

      headStyles: {
        fillColor: [70, 130, 180],
        textColor: [255, 255, 255],
        fontSize: 12,
      },

      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },

      didParseCell: (data) => {
        data.cell.height = 10;
      },
    });

    doc.save(filename.endsWith('.pdf') ? filename : `${filename}.pdf`);
  }

  private formatEuro(value: any): string {
    const num = Number(value) || 0;
    return num.toLocaleString('it-IT', { minimumFractionDigits: 2 }) + ' €';
  }
}

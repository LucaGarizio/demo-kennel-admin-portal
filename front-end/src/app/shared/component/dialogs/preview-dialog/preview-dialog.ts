import { Component, Input, Output, EventEmitter, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';

import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

@Component({
  selector: 'app-preview-dialog',
  standalone: true,
  imports: [CommonModule, DialogModule, ButtonModule],
  templateUrl: './preview-dialog.html',
  styleUrls: ['./preview-dialog.scss'],
})
export class PreviewDialogComponent {
  @ViewChild('pdfContent') pdfContent!: ElementRef<HTMLElement>;

  @Input() visible = false;
  @Input() model!: any;
  @Input() displayDate!: Date;

  @Input() firmaUrl: string | null = null;

  @Output() visibleChange = new EventEmitter<boolean>();
  private async imageUrlToBase64(url: string): Promise<string> {
    const res = await fetch(url);
    const blob = await res.blob();

    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  private async invertImageColors(base64Url: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject();

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
          if (data[i + 3] > 10) {
            data[i] = 255 - data[i];
            data[i + 1] = 255 - data[i + 1];
            data[i + 2] = 255 - data[i + 2];
          }
        }

        ctx.putImageData(imageData, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = reject;
      img.src = base64Url;
    });
  }

  async downloadPDF_JS() {
    const element = this.pdfContent?.nativeElement as HTMLElement;
    if (!element) return;

    let firmaBase64 = this.firmaUrl ?? null;

    if (firmaBase64 && !firmaBase64.startsWith('data:')) {
      try {
        firmaBase64 = await this.imageUrlToBase64(firmaBase64);
        firmaBase64 = await this.invertImageColors(firmaBase64);
      } catch (e) {
        console.error('Errore conversione firma:', e);
        firmaBase64 = null;
      }
    }

    const canvas = await html2canvas(element, {
      scale: 3,
      useCORS: true,
    });

    const imgData = canvas.toDataURL('image/jpeg', 1.0);
    const pdf = new jsPDF('p', 'mm', 'a4');

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const margin = 10;
    const contentWidth = pdfWidth - 2 * margin;

    const ratio = canvas.width / canvas.height;
    const imgHeight = contentWidth / ratio;

    pdf.addImage(imgData, 'JPEG', margin, margin, contentWidth, imgHeight);

    if (firmaBase64) {
      const firmaWidth = 70;
      const firmaHeight = 20;

      const boxTopY = 260;
      const boxLeftX = 120;
      const offsetX = 2.5;
      const offsetY = 2.5;

      const firmaX = boxLeftX + offsetX;
      const firmaY = boxTopY + offsetY;

      try {
        pdf.addImage(firmaBase64, 'PNG', firmaX, firmaY, firmaWidth, firmaHeight);
      } catch (e) {
        console.error('Errore inserimento firma nel PDF:', e);
      }
    }
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();

    const nome = this.model?.nome || '';
    const cognome = this.model?.cognome || '';

    const filename = `Norme e regolamenti ${cognome}_${nome}_${day}-${month}-${year}.pdf`;

    pdf.save(filename);
  }
}

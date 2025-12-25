import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { CarouselModule } from 'primeng/carousel';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-documents-dialog',
  standalone: true,
  imports: [CommonModule, DialogModule, CarouselModule, ButtonModule],
  templateUrl: './documents-dialog-component.html',
  styleUrls: ['./documents-dialog-component.scss'],
})
export class DocumentsDialogComponent {
  @Input() showDocsDialog = false;
  @Input() currentDocs: string[] = [];
  @Input() currentRow: any;
  @Input() getDocumentUrl!: (row: any, fileName: string) => string;

  @Output() showDocsDialogChange = new EventEmitter<boolean>();
  @Output() downloadDocumentsPdf = new EventEmitter<void>();
}

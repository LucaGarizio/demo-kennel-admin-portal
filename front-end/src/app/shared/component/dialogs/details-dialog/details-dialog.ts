import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { Router } from '@angular/router';

@Component({
  selector: 'app-details-dialog',
  standalone: true,
  imports: [CommonModule, DialogModule, ButtonModule, CardModule],
  templateUrl: './details-dialog.html',
  styleUrls: ['./details-dialog.scss'],
})
export class DetailsDialogComponent {
  @Input() visible = false;
  @Input() owner: any = null;
  @Input() dogs: any = null;
  @Output() close = new EventEmitter<void>();

  constructor(private router: Router) {}
  onClose() {
    this.visible = false;
    this.close.emit();
  }

  goToOwner() {
    if (!this.owner) return;
    this.visible = false;
    this.router.navigate(['/proprietario', this.owner.id]);
  }

  goToDog() {
    if (!this.dogs) return;
    this.visible = false;
    this.router.navigate(['/cane', this.dogs.id]);
  }

  get dialogTitle(): string {
    if (this.owner) return 'Dettagli Proprietario';
    if (this.dogs) return 'Dettagli Cane';
    return 'Dettagli';
  }

  translateSize(size: any): string {
    if (!size) return 'Non specificata';

    const s = String(size).toLowerCase();

    const mapping: Record<string, string> = {
      small: 'Piccola',
      medium: 'Media',
      big: 'Grande',
    };

    return mapping[s] || size;
  }
}

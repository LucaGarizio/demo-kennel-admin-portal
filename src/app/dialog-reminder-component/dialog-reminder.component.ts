import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { formatDateTime } from '../shared/utils/date-utils';
import { Stay } from '../shared/types/stay.types';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-dialog-reminder',
  standalone: true,
  imports: [CommonModule, DialogModule, ButtonModule],
  templateUrl: './dialog-reminder.component.html',
})
export class DialogReminderComponent {
  @Input() visible = false;
  @Input() stay: Stay | null = null;

  @Output() visibleChange = new EventEmitter<boolean>();

  formatDateTime = formatDateTime;

  get dogNames(): string {
    if (!this.stay?.expand?.dog_ids) return '';
    return this.stay.expand.dog_ids.map((d: any) => d.name ?? d.nome).join(', ');
  }

  close(): void {
    this.visibleChange.emit(false);
  }
}

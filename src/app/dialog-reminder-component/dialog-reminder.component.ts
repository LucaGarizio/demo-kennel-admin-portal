import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { formatDateTime } from '../shared/utils/date-utils';
import { Stay } from '../shared/types/stay.types';
import { ButtonModule } from 'primeng/button';
import { DatePicker } from 'primeng/datepicker';
import { FormsModule } from '@angular/forms';

import { SelectModule } from 'primeng/select';

@Component({
  selector: 'app-dialog-reminder',
  standalone: true,
  imports: [CommonModule, DialogModule, ButtonModule, SelectModule, FormsModule],
  templateUrl: './dialog-reminder.component.html',
})
export class DialogReminderComponent {
  @Input() visible = false;
  @Input() stay: Stay | null = null;
  @Output() postponeStay = new EventEmitter<{ stayId: string; minutes: number }>();
  @Output() visibleChange = new EventEmitter<boolean>();
  formatDateTime = formatDateTime;
  postponeOptions = [
    { label: '30 minuti', value: 30 },
    { label: '1 ora', value: 60 },
    { label: '3 ore', value: 180 },
    { label: '6 ore', value: 360 },
    { label: '12 ore', value: 720 },
  ];

  selectedPostpone: number | null = null;
  get dogNames(): string {
    if (!this.stay?.expand?.dog_ids) return '';
    return this.stay.expand.dog_ids.map((d: any) => d.name ?? d.nome).join(', ');
  }

  close(): void {
    this.visibleChange.emit(false);
  }

  postpone(minutes: number): void {
    if (!this.stay || !minutes) return;

    this.postponeStay.emit({
      stayId: this.stay.id,
      minutes,
    });

    this.visibleChange.emit(false);
  }
}

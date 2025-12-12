import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { formatDateTime } from '../shared/utils/date-utils';

import { Stay } from '../shared/types/stay.types';
import { DogListRecord } from '../shared/types/dog-list.types';

@Component({
  selector: 'app-dialog-reminder',
  standalone: true,
  imports: [CommonModule, FormsModule, DialogModule, ButtonModule, DatePickerModule],
  templateUrl: './dialog-reminder.component.html',
})
export class DialogReminderComponent {
  @Input() visible = false;
  @Input() stay: Stay | null = null;
  @Input() dogs: DogListRecord[] = [];
  formatDateTime = formatDateTime;

  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() close = new EventEmitter<void>();
  @Output() postpone = new EventEmitter<Date>();

  time: Date | null = null;
  showTimePicker: boolean = false;
  onClose(): void {
    this.visible = false;
    this.visibleChange.emit(false);
    this.close.emit();
  }

  onPostpone(): void {
    if (this.time) this.postpone.emit(this.time);
    this.visible = false;
    this.visibleChange.emit(false);
  }
}

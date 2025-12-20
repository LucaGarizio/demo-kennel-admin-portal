import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule, DialogModule, ButtonModule],
  templateUrl: './confirm-dialog.html',
  styleUrls: ['./confirm-dialog.scss'],
})
export class ConfirmDialogComponent {
  @Input() title = 'Conferma';
  @Input() message = 'Sei sicuro di continuare?';
  @Input() width = '22rem';
  @Input() visible = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() confirmed = new EventEmitter<boolean>();

  onClose(result: boolean) {
    this.visible = false;
    this.visibleChange.emit(false);
    this.confirmed.emit(result);
  }
}

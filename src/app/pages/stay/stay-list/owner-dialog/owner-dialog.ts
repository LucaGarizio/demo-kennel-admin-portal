import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { Router } from '@angular/router';

@Component({
  selector: 'app-owner-dialog',
  standalone: true,
  imports: [CommonModule, DialogModule, ButtonModule, CardModule],
  templateUrl: './owner-dialog.html',
  styleUrls: ['./owner-dialog.scss'],
})
export class OwnerDialogComponent {
  @Input() visible = false;
  @Input() owner: any = null;
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
}

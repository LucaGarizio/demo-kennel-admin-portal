import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [CommonModule, ButtonModule],
  templateUrl: './page-header.component.html',
  styleUrls: ['./page-header.component.scss'],
})
export class PageHeaderComponent {
  @Input() title: string = '';
  @Input() subtitle: string | null = null;

  @Input() showCreate: boolean = false;
  @Input() createLabel: string = 'Aggiungi Record';
  @Input() showExport = false;

  @Output() export = new EventEmitter<void>();
  @Output() create = new EventEmitter<void>();
}

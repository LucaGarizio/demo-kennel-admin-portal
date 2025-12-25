import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@Component({
  selector: 'app-loading-spinner',
  imports: [CommonModule, ProgressSpinnerModule],
  templateUrl: './loading-spinner-component.html',
  styleUrl: './loading-spinner-component.scss',
})
export class LoadingSpinnerComponent {
  @Input() visible = false;
  @Input() height = '70vh';
  @Input() spinnerClass = 'w-4rem h-4rem';
  @Input() strokeWidth = '8';
  @Input() animationDuration = '.8s';
}

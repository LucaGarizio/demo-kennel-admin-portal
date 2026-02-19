import { Component, Input } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';

@Component({
  selector: 'app-terms-conditions',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './terms-conditions.html',
  styleUrls: ['./terms-conditions.scss'],
  providers: [DatePipe],
})
export class TermsConditionsComponent {
  @Input() model: any;
  @Input() displayDate!: Date;
  @Input() isPdf = false;
}

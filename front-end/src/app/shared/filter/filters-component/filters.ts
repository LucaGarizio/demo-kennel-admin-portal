import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { FiltersService } from '../filter-service/filter.service';
import { FilterConfig } from '../types/filter.types';

@Component({
  selector: 'app-filter',
  standalone: true,
  imports: [CommonModule, FormsModule, SelectModule, InputTextModule],
  templateUrl: './filters.html',
  styleUrls: ['./filters.scss'],
})
export class FilterComponent implements OnInit {
  @Input() type!: 'select' | 'text';
  @Input() label: string = '';
  @Input() placeholder: string = '';

  @Input() field?:
    | 'dog_name'
    | 'owner_name'
    | 'owner_surname'
    | 'phone_number'
    | 'microchip'
    | 'payment_type'
    | 'period';

  @Input() config: FilterConfig[] = [];

  model = {
    select: 'all',
    value: '',
  };

  constructor(private filtersS: FiltersService) {}

  ngOnInit() {
    if (this.type === 'select' && this.field) {
      this.filtersS.set(this.field, this.model.select);
    }
  }

  update() {
    if (this.type === 'select' && this.field) {
      this.filtersS.set(this.field, this.model.select);
      return;
    }

    if (this.type === 'text' && this.field) {
      this.filtersS.set(this.field, this.model.value);
    }
  }
}

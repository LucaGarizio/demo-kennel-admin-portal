import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { FiltersService } from '../filter-service/filter.service';
import { FilterConfig } from '../types/filter.types';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-filter',
  standalone: true,
  imports: [CommonModule, FormsModule, SelectModule, InputTextModule],
  templateUrl: './filters.html',
  styleUrls: ['./filters.scss'],
})
export class FilterComponent implements OnInit, OnDestroy {
  @Input() type!: 'select' | 'text';
  @Input() label: string = '';
  @Input() placeholder: string = '';

  @Input() field?: string;

  @Input() config: FilterConfig[] = [];

  model = {
    select: 'all',
    value: '',
  };

  private sub?: Subscription;

  constructor(private filtersS: FiltersService) {}

  ngOnInit() {
    this.sub = this.filtersS.watch().subscribe((state: any) => {
      if (this.field && state[this.field] !== undefined) {
        if (this.type === 'select') {
          this.model.select = state[this.field];
        } else {
          this.model.value = state[this.field];
        }
      }
    });
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

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }
}

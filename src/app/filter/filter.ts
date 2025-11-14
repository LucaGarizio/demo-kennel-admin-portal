// import { Component } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { InputTextModule } from 'primeng/inputtext';
// import { ButtonModule } from 'primeng/button';
// import { FilterService } from '../../services/filter.service';
// // import { DropdownModule } from 'primeng/dropdown';

// @Component({
//   selector: 'app-filters',
//   standalone: true,
//   imports: [CommonModule, FormsModule, InputTextModule, ButtonModule],
//   templateUrl: './filter.html',
//   styleUrls: ['./filter.scss'],
// })
// export class FiltersComponent {
//   // filters = this.filterService.filters;

//   booleanOptions = [
//     { label: 'Tutti', value: null },
//     { label: 'Sì', value: true },
//     { label: 'No', value: false },
//   ];

//   constructor(private filterService: FilterService) {}

//   onChange() {
//     this.filterService.updateFilters(this.filters);
//   }

//   reset() {
//     this.filterService.reset();
//     this.filters = this.filterService.filters;
//   }
// }

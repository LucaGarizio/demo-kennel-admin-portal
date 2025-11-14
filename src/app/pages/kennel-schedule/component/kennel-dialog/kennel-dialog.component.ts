import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { MultiSelectModule } from 'primeng/multiselect';
import { PocketbaseService } from '../../../../../services/pocketbase.service';
import { toPocketDate } from '../../../../shared/utils/date-utils';

@Component({
  selector: 'app-kennel-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DialogModule,
    ButtonModule,
    DatePickerModule,
    SelectModule,
    MultiSelectModule,
  ],
  templateUrl: './kennel-dialog.html',
  styleUrls: ['./kennel-dialog.scss'],
})
export class KennelDialogComponent {
  @Input() showDialog = false;
  @Input() dialogTitle = 'Assegna cane';
  @Input() pendingBox: any = null;
  @Input() pendingDay = '';
  @Input() availableDogs: any[] = [];
  @Input() availableBoxes: any[] = [];
  @Input() editingOccupationId: string | null = null;

  @Output() confirm = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();

  startDate: Date | null = null;
  endDate: Date | null = null;
  selectedDog: any = null;
  selectedDogs: any[] = [];

  constructor(private pb: PocketbaseService) {}
  async confirmDialog() {
    if (!this.startDate || !this.endDate || !this.pendingBox) return;

    try {
      const localKey = this.pendingDay.split('T')[0] || this.pendingDay;
      const existing = await this.pb.getAll('occupations', 50, {
        filter: `box.id = "${this.pendingBox.id}" && arrival_date <= "${localKey} 23:59:59" && departure_date >= "${localKey} 00:00:00"`,
        expand: 'dog,box',
      });

      if (this.pendingBox.double) {
        const selectedIds = (this.selectedDogs || []).map((d) => d.id);
        const existingIds = existing.map((o) => o.expand?.['dog']?.id);

        // 1️⃣ Elimina i cani non più selezionati
        for (const occ of existing) {
          const dogId = occ.expand?.['dog']?.id;
          if (dogId && !selectedIds.includes(dogId)) {
            await this.pb.deleteRecord('occupations', occ.id);
          }
        }

        // 2️⃣ Crea i nuovi cani che non erano presenti
        for (const d of selectedIds) {
          if (!existingIds.includes(d)) {
            const record = {
              dog: d,
              box: this.pendingBox.id,
              arrival_date: toPocketDate(this.startDate),
              departure_date: toPocketDate(this.endDate),
            };
            await this.pb.createRecord('occupations', record);
          }
        }
      } else {
        if (!this.selectedDog) return;
        const record = {
          dog: this.selectedDog.id,
          box: this.pendingBox.id,
          arrival_date: toPocketDate(this.startDate),
          departure_date: toPocketDate(this.endDate),
        };
        if (this.editingOccupationId) {
          await this.pb.updateRecord('occupations', this.editingOccupationId, record);
        } else {
          await this.pb.createRecord('occupations', record);
        }
      }

      this.confirm.emit();
    } catch (err) {
      console.error('Errore durante il salvataggio:', err);
    }
  }

  async deleteAssignment() {
    if (!this.pendingBox || !this.pendingDay) return;

    try {
      const localKey = this.pendingDay.split('T')[0] || this.pendingDay;
      const occupations = await this.pb.getAll('occupations', 50, {
        filter: `box.id = "${this.pendingBox.id}" && arrival_date <= "${localKey} 23:59:59" && departure_date >= "${localKey} 00:00:00"`,
      });

      if (occupations.length === 0) {
        console.warn('Nessuna occupazione da eliminare.');
        this.close.emit();
        return;
      }

      for (const occ of occupations) {
        await this.pb.deleteRecord('occupations', occ.id);
      }

      console.log(`🗑️ Eliminati ${occupations.length} record di assegnazione`);
      this.confirm.emit();
    } catch (err) {
      console.error('❌ Errore durante l’eliminazione:', err);
    }
  }

  canConfirm(): boolean {
    if (!this.pendingBox || !this.startDate || !this.endDate) return false;
    return this.pendingBox.double
      ? this.selectedDogs && this.selectedDogs.length > 0
      : !!this.selectedDog;
  }

  async ngOnChanges() {
    if (!this.pendingBox || !this.pendingDay) return;

    this.startDate = new Date(this.pendingDay);
    this.endDate = null;
    this.selectedDog = null;
    this.selectedDogs = [];
    this.editingOccupationId = null;

    // verifica se c’è un’occupazione esistente
    const localKey = this.pendingDay.split('T')[0] || this.pendingDay;
    const occs = await this.pb.getAll('occupations', 2, {
      filter: `box.id = "${this.pendingBox.id}" && arrival_date <= "${localKey} 23:59:59" && departure_date >= "${localKey} 00:00:00"`,
      expand: 'dog,box',
    });

    if (occs.length > 0) {
      this.dialogTitle = 'Modifica assegnazione';
      const dogs = occs.map((o) => o.expand?.['dog']).filter(Boolean);
      const first = occs[0];
      this.editingOccupationId = first.id;

      if (this.pendingBox.double) {
        this.selectedDogs = this.availableDogs.filter((d) => dogs.some((g) => g.id === d.id));
      } else {
        this.selectedDog = this.availableDogs.find((d) => d.id === dogs[0]?.id) || dogs[0] || null;
      }

      const parseDate = (s?: string) => (s ? new Date(s.split(/[T\s]/)[0]) : null);
      this.startDate = parseDate(first['arrival_date']) || new Date(this.pendingDay);
      this.endDate = parseDate(first['departure_date']) || new Date(this.pendingDay);
    } else {
      this.dialogTitle = 'Assegna cane';
    }
  }
}

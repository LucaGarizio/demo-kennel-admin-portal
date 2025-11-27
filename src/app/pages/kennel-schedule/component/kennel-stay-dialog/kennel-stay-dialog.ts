import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { MultiSelectModule } from 'primeng/multiselect';
import { PocketbaseService } from '../../../../../services/pocketbase.service';
import { toPocketDate, parsePbDate, normalizeDate } from '../../../../shared/utils/date-utils';
import { ConfirmDialogComponent } from '../../../../confirm-dialog/confirm-dialog';

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
    ConfirmDialogComponent,
  ],
  templateUrl: './kennel-stay-dialog.html',
  styleUrls: ['./kennel-stay-dialog.scss'],
})
export class KennelDialogComponent {
  @Input() showDialog = false;
  @Input() dialogTitle = 'Assegna cane';
  @Input() pendingBox: any = null;
  @Input() pendingDay = '';
  @Input() availableDogs: any[] = [];
  @Input() availableBoxes: any[] = [];
  @Input() editingOccupationId: string | null = null;
  @Input() availableAreas: any[] = [];

  @Output() confirm = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();
  @Output() requestMove = new EventEmitter<any>();

  startDate: Date | null = null;
  endDate: Date | null = null;

  selectedDog: any = null;
  selectedDogs: any[] = [];
  selectedArea: any = null;
  filteredBoxes: any[] = [];
  showConflictDialog = false;
  conflictDog: any = null;
  conflictOccupation: any = null;
  conflictMessage = '';

  constructor(private pb: PocketbaseService) {}

  private get localDate(): string {
    return this.pendingDay.split('T')[0];
  }

  private buildRangeFilter(): string {
    return `
      arrival_date <= "${this.localDate} 23:59:59" &&
      departure_date >= "${this.localDate} 00:00:00"
    `;
  }

  async confirmDialog() {
    if (!this.startDate || !this.pendingBox) return;

    if (!this.pendingBox.double && this.selectedDog) {
      const occ = await this.findCurrentBoxOccupation();
      if (occ && this.isConflict(occ)) {
        this.openConflictDialog(occ);
        return;
      }
    }
    if (!this.endDate) return;
    await this.saveCurrentAssignment();
  }

  private async findCurrentBoxOccupation() {
    return (
      await this.pb.getAll('occupations', 10, {
        filter: `box.id="${this.pendingBox.id}" && ${this.buildRangeFilter()}`,
        expand: 'dog,box',
      })
    )[0];
  }

  private isConflict(occ: any): boolean {
    const presentDog = occ.expand?.['dog'];
    return presentDog?.id !== this.selectedDog?.id;
  }

  // private async saveCurrentAssignment() {
  //   const payload = {
  //     arrival_date: toPocketDate(this.startDate!),
  //     departure_date: toPocketDate(this.endDate!),
  //   };

  //   try {
  //     this.pendingBox.double
  //       ? await this.assignDoubleBox(payload)
  //       : await this.assignSingleBox(payload);

  //     this.confirm.emit();
  //   } catch (err) {
  //     console.error('Errore durante salvataggio:', err);
  //   }
  // }

  private async saveCurrentAssignment() {
    const payload = {
      arrival_date: toPocketDate(this.startDate!),
      departure_date: toPocketDate(this.endDate!),
    };

    try {
      if (this.pendingBox.double) {
        await this.assignDoubleBox(payload);
      } else {
        await this.assignSingleBox(payload);
      }

      // ---- AGGIORNA LO STAY DEL/I CANI ----
      if (this.pendingBox.double) {
        // box doppio: aggiorno TUTTI i cani selezionati
        for (const d of this.selectedDogs) {
          const stays = await this.pb.getAll('stays', 10, {
            filter: `dog_ids.id = "${d.id}"`,
          });

          if (stays.length) {
            await this.pb.updateRecord('stays', stays[0].id, {
              id_area: this.pendingBox.expand?.area?.id ?? null,
              id_box: this.pendingBox.id,
            });
          }
        }
      } else {
        // box singolo
        const stays = await this.pb.getAll('stays', 10, {
          filter: `dog_ids.id = "${this.selectedDog.id}"`,
        });

        if (stays.length) {
          await this.pb.updateRecord('stays', stays[0].id, {
            id_area: this.pendingBox.expand?.area?.id ?? null,
            id_box: this.pendingBox.id,
          });
        }
      }

      this.confirm.emit();
    } catch (err) {
      console.error('Errore durante salvataggio:', err);
    }
  }

  private async assignSingleBox(payload: any) {
    if (!this.selectedDog) return;

    const dogId = this.selectedDog.id;

    const existing = await this.pb.getAll('occupations', 40, {
      filter: `dog.id="${dogId}" && ${this.buildRangeFilter()}`,
    });

    for (const occ of existing) {
      await this.pb.deleteRecord('occupations', occ.id);
    }

    await this.pb.createRecord('occupations', {
      dog: dogId,
      box: this.pendingBox.id,
      ...payload,
    });
  }

  private async assignDoubleBox(payload: any) {
    const boxId = this.pendingBox.id;
    const selectedIds = this.selectedDogs.map((d) => d.id);

    const existing = await this.pb.getAll('occupations', 50, {
      filter: `box.id="${boxId}"`,
      expand: 'dog',
    });

    const map = new Map(existing.map((o) => [o.expand?.['dog']?.id, o]));

    for (const dogId of selectedIds) {
      const occ = map.get(dogId);
      const body = { dog: dogId, box: boxId, ...payload };

      occ
        ? await this.pb.updateRecord('occupations', occ.id, body)
        : await this.pb.createRecord('occupations', body);
    }

    for (const occ of existing) {
      const dogId = occ.expand?.['dog']?.id;
      if (dogId && !selectedIds.includes(dogId)) {
        await this.pb.deleteRecord('occupations', occ.id);
      }
    }
  }

  openConflictDialog(occ: any) {
    this.conflictDog = occ.expand?.['dog'];
    this.conflictOccupation = occ;

    this.conflictMessage = `Il box è già occupato da <b>${this.conflictDog?.name}</b>.
    <br><br>
    Vuoi spostarlo in un altro box?`;
    this.showConflictDialog = true;
  }

  async onConflictChoice(accept: boolean) {
    this.showConflictDialog = false;
    if (!accept) return;

    this.requestMove.emit({
      conflictOccupation: this.conflictOccupation,
      conflictDog: this.conflictDog,
      targetDog: this.selectedDog,
      targetBox: this.pendingBox,
      targetStart: this.startDate,
      targetEnd: this.endDate,
    });
  }

  async deleteAssignment() {
    const occs = await this.pb.getAll('occupations', 50, {
      filter: `box.id="${this.pendingBox.id}" && ${this.buildRangeFilter()}`,
    });

    for (const occ of occs) {
      await this.pb.deleteRecord('occupations', occ.id);
    }
    this.confirm.emit();
  }

  canConfirm(): boolean {
    if (!this.pendingBox || !this.startDate || !this.endDate) return false;
    return this.pendingBox.double ? this.selectedDogs.length > 0 : !!this.selectedDog;
  }

  async ngOnChanges() {
    if (!this.pendingBox || !this.pendingDay) return;
    this.resetState();
    this.selectedArea = this.pendingBox?.expand?.area || null;
    this.filterBoxes();
    const occs = await this.pb.getAll('occupations', 5, {
      filter: `box.id="${this.pendingBox.id}" && ${this.buildRangeFilter()}`,
      expand: 'dog,box',
    });

    if (occs.length === 0) {
      this.dialogTitle = 'Assegna cane';
      return;
    }
    this.setEditState(occs);
  }

  private resetState() {
    this.startDate = new Date(this.pendingDay);
    this.endDate = null;
    this.selectedDog = null;
    this.selectedDogs = [];
    this.editingOccupationId = null;
  }

  private setEditState(occs: any[]) {
    this.dialogTitle = 'Modifica assegnazione';

    const dogs = occs.map((o) => o.expand?.['dog']).filter(Boolean);
    const first = occs[0];

    this.editingOccupationId = first.id;

    if (this.pendingBox.double) {
      this.selectedDogs = this.availableDogs.filter((d) => dogs.some((g) => g.id === d.id));
    } else {
      this.selectedDog = this.availableDogs.find((d) => d.id === dogs[0]?.id) || dogs[0] || null;
    }
    this.startDate = parsePbDate(first.arrival_date) || new Date(this.pendingDay);
    this.endDate = parsePbDate(first.departure_date) || new Date(this.pendingDay);
  }

  filterBoxes() {
    if (!this.selectedArea) {
      this.filteredBoxes = this.availableBoxes;
    } else {
      this.filteredBoxes = this.availableBoxes.filter(
        (b) => b.expand?.area?.id === this.selectedArea.id
      );
    }
  }
}

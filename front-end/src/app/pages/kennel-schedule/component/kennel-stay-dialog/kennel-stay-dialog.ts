import { Component, effect, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { MultiSelectModule } from 'primeng/multiselect';
import { PocketbaseService } from '../../../../shared/service/pocket-base-services/pocketbase.service';
import { toPocketDate, parsePbDate, normalizeDate } from '../../../../shared/utils/date-utils';
import { ConfirmDialogComponent } from '../../../../shared/component/dialogs/confirm-dialog/confirm-dialog';

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
  showDialog = input(false);
  pendingBox = input<any>(null);
  pendingDay = input('');
  availableDogs = input<any[]>([]);
  availableBoxes = input<any[]>([]);
  availableAreas = input<any[]>([]);

  confirm = output<void>();
  close = output<void>();
  requestMove = output<any>();
  
  dialogTitle = signal('Assegna cane');
  editingOccupationId: string | null = null;

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
  isMultiMode = false;

  localBox: any = null;

  constructor(private pb: PocketbaseService) {
    effect(async () => {
      if (!this.showDialog()) return;
      const box = this.pendingBox();
      const day = this.pendingDay();
      if (!box || !day) return;
      this.resetState();

      this.filteredBoxes = this.availableBoxes().map((b) => ({
        ...b,
        label: this.formatBoxLabel(b),
      }));

      this.isMultiMode = !!box?.double;
      this.selectedArea = box?.expand?.area || null;
      this.filterBoxes();
      
      this.localBox = this.filteredBoxes.find((b) => b.id === box.id) || null;

      const occs = await this.pb.getAll('occupations', 5, {
        filter: `box.id="${box.id}" && ${this.buildRangeFilter()}`,
        expand: 'dog,box',
      });

      if (occs.length === 0) {
        this.dialogTitle.set('Assegna cane');
        return;
      }
      this.setEditState(occs);
    });
  }

  private get localDate(): string {
    return this.pendingDay().split('T')[0];
  }

  private buildRangeFilter(): string {
    return `
      arrival_date <= "${this.localDate} 23:59:59" &&
      departure_date >= "${this.localDate} 00:00:00"
    `;
  }

  async confirmDialog() {
    if (!this.startDate || !this.localBox) return;

    if (!this.localBox.double && this.selectedDog) {
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
        filter: `box.id="${this.localBox.id}" && ${this.buildRangeFilter()}`,
        expand: 'dog,box',
      })
    )[0];
  }

  private isConflict(occ: any): boolean {
    const presentDog = occ.expand?.['dog'];
    return presentDog?.id !== this.selectedDog?.id;
  }

  private async saveCurrentAssignment() {
    if (!this.startDate || !this.endDate || !this.localBox) return;

    const payload = {
      arrival_date: toPocketDate(this.startDate),
      departure_date: toPocketDate(this.endDate),
    };

    try {
      if (this.isMultiMode) {
        await this.assignDoubleBox(payload);
        for (const d of this.selectedDogs) {
          const stays = await this.pb.getAll('stays', 10, {
            filter: `dog_ids.id = "${d.id}"`,
          });

          if (stays.length) {
            await this.pb.updateRecord('stays', stays[0].id, {
              id_area: this.localBox.expand?.area?.id ?? null,
              id_box: this.localBox.id,
            });
          }
        }
      } else {
        if (!this.selectedDog) return;

        await this.assignSingleBox(payload);

        const stays = await this.pb.getAll('stays', 10, {
          filter: `dog_ids.id = "${this.selectedDog.id}"`,
        });

        if (stays.length) {
          await this.pb.updateRecord('stays', stays[0].id, {
            id_area: this.localBox.expand?.area?.id ?? null,
            id_box: this.localBox.id,
          });
        }
      }

      this.confirm.emit();
    } catch (err) {
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
      box: this.localBox.id,
      ...payload,
    });
  }

  private async assignDoubleBox(payload: any) {
    const boxId = this.localBox.id;
    const selectedIds = this.selectedDogs.map((d) => d.id);

    for (const dogId of selectedIds) {
      const existingForDog = await this.pb.getAll('occupations', 50, {
        filter: `dog.id="${dogId}" && ${this.buildRangeFilter()}`,
      });

      for (const occ of existingForDog) {
        await this.pb.deleteRecord('occupations', occ.id);
      }
    }

    for (const dogId of selectedIds) {
      await this.pb.createRecord('occupations', {
        dog: dogId,
        box: boxId,
        ...payload,
      });
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
      targetBox: this.localBox || this.pendingBox(),
      targetStart: this.startDate,
      targetEnd: this.endDate,
    });
  }

  async deleteAssignment() {
    if (!this.localBox) return;
    const occs = await this.pb.getAll('occupations', 50, {
      filter: `box.id="${this.localBox.id}" && ${this.buildRangeFilter()}`,
    });

    for (const occ of occs) {
      await this.pb.deleteRecord('occupations', occ.id);
    }
    this.confirm.emit();
  }

  canConfirm(): boolean {
    if (!this.localBox || !this.startDate || !this.endDate) return false;
    return this.isMultiMode ? this.selectedDogs.length > 0 : !!this.selectedDog;
  }

  private resetState() {
    this.startDate = new Date(this.pendingDay());
    this.endDate = null;
    this.selectedDog = null;
    this.selectedDogs = [];
    this.editingOccupationId = null;
  }

  private setEditState(occs: any[]) {
    this.dialogTitle.set('Modifica assegnazione');

    const dogs = occs.map((o) => o.expand?.['dog']).filter(Boolean);
    const first = occs[0];

    this.editingOccupationId = first.id;

    if (this.pendingBox().double) {
      this.selectedDogs = this.availableDogs().filter((d) => dogs.some((g) => g.id === d.id));
    } else {
      this.selectedDog = this.availableDogs().find((d) => d.id === dogs[0]?.id) || dogs[0] || null;
    }
    this.startDate = parsePbDate(first.arrival_date) || new Date(this.pendingDay());
    this.endDate = parsePbDate(first.departure_date) || new Date(this.pendingDay());
  }

  filterBoxes() {
    const mapBox = (b: any) => ({ ...b, label: this.formatBoxLabel(b) });

    if (!this.selectedArea) {
      this.filteredBoxes = this.availableBoxes().map(mapBox);
    } else {
      this.filteredBoxes = this.availableBoxes()
        .filter((b) => b.expand?.area?.id === this.selectedArea.id)
        .map(mapBox);
    }
  }

  private formatBoxLabel(b: any): string {
    const parts: string[] = [];
    if (b.covered) parts.push('coperto');
    if (b.double) parts.push('doppio');
    if (parts.length === 0) return b.number;
    return `${b.number} (${parts.join(', ')})`;
  }
}

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { PocketbaseService } from '../../../../../services/pocketbase.service';
import { toPocketDate, normalizeDate, formatYmdLocal } from '../../../../shared/utils/date-utils';

interface Dog {
  id: string;
  name: string;
}

interface Box {
  id: string;
  number: string;
  area?: {
    id: string;
    nome_area: string;
  } | null;
}

interface Occupation {
  id: string;
  dog: string;
  box: string;
  arrival_date: string;
  departure_date: string;
}

@Component({
  selector: 'app-kennel-move-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, DialogModule, ButtonModule, DatePickerModule, SelectModule],
  templateUrl: './kennel-move-dialog.html',
  styleUrls: ['./kennel-move-dialog.scss'],
})
export class KennelMoveDialogComponent {
  @Input() show = false;
  @Input() conflictOccupation: Occupation | null = null;
  @Input() conflictDog: Dog | null = null;
  @Input() availableBoxes: Box[] = [];
  @Input() availableAreas: any[] = [];
  @Input() targetBox: Box | null = null;
  @Input() targetDog: Dog | null = null;
  @Input() targetStart: Date | null = null;
  @Input() targetEnd: Date | null = null;

  @Output() close = new EventEmitter<void>();
  @Output() moved = new EventEmitter<void>();

  selectedArea: any = null;
  filteredBoxes: Box[] = [];
  newBox: Box | null = null;
  newStart: Date | null = null;
  newEnd: Date | null = null;

  constructor(private pb: PocketbaseService) {}

  ngOnChanges() {
    if (!this.conflictOccupation || !this.targetBox) return;
    this.selectedArea = this.targetBox?.area || null;
    this.filterBoxes();
    this.newStart = normalizeDate(this.conflictOccupation.arrival_date);
    this.newEnd = normalizeDate(this.conflictOccupation.departure_date);
    this.newBox = null;
  }

  get canSubmit(): boolean {
    return !!(this.newBox && this.newStart && this.newEnd);
  }

  // async confirmMove() {
  //   if (!this.canSubmit || !this.conflictOccupation || !this.conflictDog) return;

  //   try {
  //     await this.pb.updateRecord('occupations', this.conflictOccupation.id, {
  //       dog: this.conflictDog.id,
  //       box: this.newBox!.id,
  //       arrival_date: toPocketDate(this.newStart!),
  //       departure_date: toPocketDate(this.newEnd!),
  //     });

  //     if (this.targetDog && this.targetStart && this.targetEnd) {
  //       const startKey = formatYmdLocal(this.targetStart);
  //       const endKey = formatYmdLocal(this.targetEnd);

  //       const existingTarget = await this.pb.getAll('occupations', 20, {
  //         filter: `
  //           dog.id = "${this.targetDog.id}" &&
  //           arrival_date <= "${endKey} 23:59:59" &&
  //           departure_date >= "${startKey} 00:00:00"
  //         `,
  //       });

  //       for (const occ of existingTarget) {
  //         await this.pb.deleteRecord('occupations', occ.id);
  //       }

  //       await this.pb.createRecord('occupations', {
  //         dog: this.targetDog.id,
  //         box: this.targetBox!.id,
  //         arrival_date: toPocketDate(this.targetStart),
  //         departure_date: toPocketDate(this.targetEnd),
  //       });
  //     }

  //     this.moved.emit();
  //   } catch (err) {
  //     console.error('Errore durante il move:', err);
  //   }
  // }

  async confirmMove() {
    if (!this.canSubmit || !this.conflictOccupation || !this.conflictDog) return;

    try {
      // 1. Aggiorna la OCCUPATION PRINCIPALE
      await this.pb.updateRecord('occupations', this.conflictOccupation.id, {
        dog: this.conflictDog.id,
        box: this.newBox!.id,
        arrival_date: toPocketDate(this.newStart!),
        departure_date: toPocketDate(this.newEnd!),
      });

      // 1b. AGGIORNA LO STAY COLLEGATO AL CANE
      const stays = await this.pb.getAll('stays', 10, {
        filter: `dog_ids.id = "${this.conflictDog.id}"`,
      });

      if (stays.length) {
        await this.pb.updateRecord('stays', stays[0].id, {
          id_area: this.newBox?.area?.id ?? null,
          id_box: this.newBox?.id ?? null,
        });
      }

      // 2. GESTIONE TARGET DOG (spostamento cane destinazione)
      if (this.targetDog && this.targetStart && this.targetEnd) {
        const startKey = formatYmdLocal(this.targetStart);
        const endKey = formatYmdLocal(this.targetEnd);

        const existingTarget = await this.pb.getAll('occupations', 20, {
          filter: `
          dog.id = "${this.targetDog.id}" &&
          arrival_date <= "${endKey} 23:59:59" &&
          departure_date >= "${startKey} 00:00:00"
        `,
        });

        for (const occ of existingTarget) {
          await this.pb.deleteRecord('occupations', occ.id);
        }

        // 2b. CREA OCCUPATION TARGET
        const newOcc = await this.pb.createRecord('occupations', {
          dog: this.targetDog.id,
          box: this.targetBox!.id,
          arrival_date: toPocketDate(this.targetStart),
          departure_date: toPocketDate(this.targetEnd),
        });

        // 2c. AGGIORNA LO STAY DEL TARGET DOG
        const targetStays = await this.pb.getAll('stays', 10, {
          filter: `dog_ids.id = "${this.targetDog.id}"`,
        });

        if (targetStays.length) {
          await this.pb.updateRecord('stays', targetStays[0].id, {
            id_area: this.targetBox?.area?.id ?? null,
            id_box: this.targetBox?.id ?? null,
          });
        }
      }

      this.moved.emit();
    } catch (err) {
      console.error('Errore durante il move:', err);
    }
  }

  filterBoxes() {
    if (!this.selectedArea) {
      this.filteredBoxes = this.availableBoxes;
    } else {
      this.filteredBoxes = this.availableBoxes.filter((b) => b.area?.id === this.selectedArea.id);
    }
  }
}

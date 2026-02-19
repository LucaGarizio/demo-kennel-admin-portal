import { Component, effect, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { PocketbaseService } from '../../../../shared/service/pocket-base-services/pocketbase.service';
import { toPocketDate, normalizeDate, formatYmdLocal } from '../../../../shared/utils/date-utils';

interface Dog {
  id: string;
  name: string;
}

interface Box {
  id: string;
  number: string;
  covered?: boolean;
  double?: boolean;
  label?: string;
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
  show = input(false);
  conflictOccupation = input<Occupation | null>(null);
  conflictDog = input<Dog | null>(null);
  availableBoxes = input<Box[]>([]);
  availableAreas = input<any[]>([]);
  targetBox = input<Box | null>(null);
  targetDog = input<Dog | null>(null);
  targetStart = input<Date | null>(null);
  targetEnd = input<Date | null>(null);

  close = output<void>();
  moved = output<void>();

  selectedArea: any = null;
  filteredBoxes: Box[] = [];
  newBox: Box | null = null;
  newStart: Date | null = null;
  newEnd: Date | null = null;

  constructor(private pb: PocketbaseService) {
    effect(() => {
      const conflictOcc = this.conflictOccupation();
      const targetB = this.targetBox();
      if (!conflictOcc || !targetB) return;

      this.filteredBoxes = this.availableBoxes().map((b) => ({
        ...b,
        label: this.formatBoxLabel(b),
      }));

      this.selectedArea = targetB.area || null;
      this.filterBoxes();
      this.newStart = normalizeDate(conflictOcc.arrival_date);
      this.newEnd = normalizeDate(conflictOcc.departure_date);
      
      const matchedBox = this.filteredBoxes.find(b => b.id === targetB.id) || null;
      this.newBox = matchedBox;
    });
  }

  get canSubmit(): boolean {
    return !!(this.newBox && this.newStart && this.newEnd);
  }

  async confirmMove() {
    const conflictOcc = this.conflictOccupation();
    const conflictD = this.conflictDog();

    if (!this.canSubmit || !conflictOcc || !conflictD) return;

    try {
      await this.pb.updateRecord('occupations', conflictOcc.id, {
        dog: conflictD.id,
        box: this.newBox!.id,
        arrival_date: toPocketDate(this.newStart!),
        departure_date: toPocketDate(this.newEnd!),
      });

      const stays = await this.pb.getAll('stays', 10, {
        filter: `dog_ids.id = "${conflictD.id}"`,
      });

      if (stays.length) {
        await this.pb.updateRecord('stays', stays[0].id, {
          id_area: this.newBox?.area?.id ?? null,
          id_box: this.newBox?.id ?? null,
        });
      }
      if (this.targetDog() && this.targetStart() && this.targetEnd()) {
        const startKey = formatYmdLocal(this.targetStart()!);
        const endKey = formatYmdLocal(this.targetEnd()!);
        const tDog = this.targetDog()!;

        const existingTarget = await this.pb.getAll('occupations', 20, {
          filter: `
          dog.id = "${tDog.id}" &&
          arrival_date <= "${endKey} 23:59:59" &&
          departure_date >= "${startKey} 00:00:00"
        `,
        });

        for (const occ of existingTarget) {
          await this.pb.deleteRecord('occupations', occ.id);
        }

        const newOcc = await this.pb.createRecord('occupations', {
          dog: tDog.id,
          box: this.targetBox()!.id,
          arrival_date: toPocketDate(this.targetStart()!),
          departure_date: toPocketDate(this.targetEnd()!),
        });

        const targetStays = await this.pb.getAll('stays', 10, {
          filter: `dog_ids.id = "${tDog.id}"`,
        });

        if (targetStays.length) {
          await this.pb.updateRecord('stays', targetStays[0].id, {
            id_area: this.targetBox()?.area?.id ?? null,
            id_box: this.targetBox()?.id ?? null,
          });
        }
      }

      this.moved.emit();
    } catch (err) {
      // Handled globally
    }
  }

  filterBoxes() {
    const mapBox = (b: Box) => ({ ...b, label: this.formatBoxLabel(b) });
      
    if (!this.selectedArea) {
      this.filteredBoxes = this.availableBoxes().map(mapBox);
    } else {
      this.filteredBoxes = this.availableBoxes()
        .filter((b) => b.area?.id === this.selectedArea.id)
        .map(mapBox);
    }
  }

  private formatBoxLabel(b: Box): string {
    const parts: string[] = [];
    if (b.covered) parts.push('coperto');
    if (b.double) parts.push('doppio');
    if (parts.length === 0) return b.number;
    return `${b.number} (${parts.join(', ')})`;
  }
}

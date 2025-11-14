import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TabsModule } from 'primeng/tabs';
import { TableModule } from 'primeng/table';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { KennelTableComponent } from './component/kennel-table/kennel-table.component';
import { KennelDialogComponent } from './component/kennel-dialog/kennel-dialog.component';
import { KennelCalendarService } from './services/kennel-calendar.service';
import { KennelDataService } from './services/kennel-data.service';
import { KennelRow } from './types';

@Component({
  selector: 'app-kennel-schedule',
  standalone: true,
  imports: [
    CommonModule,
    TabsModule,
    TableModule,
    ProgressSpinnerModule,
    KennelTableComponent,
    KennelDialogComponent,
  ],
  templateUrl: './kennel-schedule.html',
  styleUrls: ['./kennel-schedule.scss'],
  providers: [KennelCalendarService, KennelDataService],
})
export class KennelScheduleComponent implements OnInit {
  areas: any[] = [];
  selectedArea: any = null;
  rows: KennelRow[] = [];
  boxes: any[] = [];
  data: Record<string, Record<string, string>> = {};
  loading = false;
  editingOccupationId: string | null = null;

  // 👇 aggiungi questi campi
  availableBoxes: any[] = [];
  availableDogs: any[] = [];

  showDialog = false;
  pendingBox: any = null;
  pendingDay = '';
  selectedDog: any = null;
  selectedDogs: any[] = [];

  constructor(private calendar: KennelCalendarService, private dataService: KennelDataService) {}

  async ngOnInit() {
    this.loading = true;
    this.rows = this.calendar.generateRowsForYear(new Date().getFullYear());
    this.areas = await this.dataService.getAreas();
    if (this.areas.length) await this.loadAreaData(this.areas[0]);
    this.loading = false;
  }

  async loadAreaData(area: any) {
    this.loading = true;
    const result = await this.dataService.loadAreaData(area.id, this.rows);
    this.selectedArea = result.area;
    this.boxes = result.boxes;
    this.data = result.data;
    this.loading = false;
  }

  onAreaChange(areaId: string) {
    const area = this.areas.find((a) => a.id === areaId);
    if (area) this.loadAreaData(area);
  }

  async onSelectCell(event: { day: string; box: any }) {
    if (!event?.box || !event?.day) return;

    this.pendingDay = event.day;
    this.pendingBox = event.box;
    this.availableBoxes = this.boxes;
    this.availableDogs = await this.dataService.getDogs();

    this.showDialog = true;
  }

  async onConfirmDialog() {
    this.showDialog = false;
    await this.loadAreaData(this.selectedArea);
  }
}

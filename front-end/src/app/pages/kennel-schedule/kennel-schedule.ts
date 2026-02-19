import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TabsModule } from 'primeng/tabs';
import { TableModule } from 'primeng/table';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { KennelTableComponent } from './component/kennel-table/kennel-table/kennel-table.component';
import { KennelDialogComponent } from './component/kennel-stay-dialog/kennel-stay-dialog';
import { KennelMoveDialogComponent } from './component/kennel-move-dialog/kennel-move-dialog';
import { KennelCalendarService } from './services/kennel-calendar.service';
import { KennelDataService } from './services/kennel-data.service';
import { KennelRow } from './types';
import { DatePickerModule } from 'primeng/datepicker';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { LoadingSpinnerComponent } from '../../shared/component/loading-spinner/loading-spinner-component';

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
    KennelMoveDialogComponent,
    DatePickerModule,
    FormsModule,
    LoadingSpinnerComponent,
  ],
  templateUrl: './kennel-schedule.html',
  styleUrls: ['./kennel-schedule.scss'],
  providers: [KennelCalendarService, KennelDataService],
})
export class KennelScheduleComponent implements OnInit {
  areas = signal<any[]>([]);
  selectedArea = signal<any>(null);
  rows = signal<KennelRow[]>([]);
  boxes = signal<any[]>([]);
  data = signal<Record<string, Record<string, string>>>({});
  loading = signal(false);
  allBoxes = signal<any[]>([]);
  availableBoxes = signal<any[]>([]);
  availableDogs = signal<any[]>([]);

  showDialog = signal(false);
  pendingBox = signal<any>(null);
  pendingDay = signal('');

  showMoveDialog = signal(false);
  moveDialogData = signal<any>(null);
  selectedYearDate = signal<Date>(new Date());
  expandedMonthKey = signal<string | null>(null);

  constructor(
    private calendar: KennelCalendarService,
    private dataService: KennelDataService,
    private route: ActivatedRoute
  ) {}

  async ngOnInit() {
    this.loading.set(true);
    this.rows.set(this.calendar.generateRowsForYear(new Date().getFullYear()));
    this.areas.set(await this.dataService.getAreas());
    this.allBoxes.set(await this.dataService.getAllBoxes());
    if (this.areas().length) await this.loadAreaData(this.areas()[0]);
    this.loading.set(false);
  }

  async loadAreaData(area: any) {
    this.loading.set(true);
    const result = await this.dataService.loadAreaData(area.id, this.rows());
    this.selectedArea.set(result.area);
    this.boxes.set(result.boxes);
    this.data.set(result.data);
    this.loading.set(false);
  }

  onAreaChange(areaId: string) {
    const area = this.areas().find((a) => a.id === areaId);
    if (area) this.loadAreaData(area);
  }

  async onSelectCell(event: { day: string; box: any }) {
    if (!event?.box || !event?.day) return;

    this.pendingDay.set(event.day);
    this.pendingBox.set(event.box);
    this.availableBoxes.set(this.boxes());
    this.availableDogs.set(await this.dataService.getDogs());

    this.showDialog.set(true);
  }

  async onConfirmDialog() {
    this.showDialog.set(false);
    await this.loadAreaData(this.selectedArea());
  }

  openMoveDialog(payload: any) {
    this.moveDialogData.set(payload);
    this.showMoveDialog.set(true);
  }

  async onMoveCompleted() {
    this.showMoveDialog.set(false);
    this.showDialog.set(false);
    await this.loadAreaData(this.selectedArea());
  }

  async onYearSelected(date: Date) {
    if (!date) return;
    const year = date.getFullYear();
    this.selectedYearDate.set(date);
    this.loading.set(true);
    this.rows.set(this.calendar.generateRowsForYear(year));
    if (this.selectedArea()) {
      await this.loadAreaData(this.selectedArea());
    }

    this.loading.set(false);
  }
}

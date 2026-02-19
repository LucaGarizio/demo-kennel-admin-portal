import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { Router } from '@angular/router';
import { PocketbaseService } from '../../shared/service/pocket-base-services/pocketbase.service';
import { StayListRecord } from '../../shared/types/stay-list.types';
import { StayListService } from '../../shared/service/stay-service/stay-list.service';
import { formatYmdLocal } from '../../shared/utils/date-utils';
import { PageHeaderComponent } from '../../shared/component/page-header/page-headercomponent';
import { LoadingSpinnerComponent } from '../../shared/component/loading-spinner/loading-spinner-component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    TableModule,
    PageHeaderComponent,
    LoadingSpinnerComponent
  ],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss'],
})
export class DashboardComponent implements OnInit {
  loading = signal(false);
  
  todayArrivals = signal<StayListRecord[]>([]);
  todayDepartures = signal<StayListRecord[]>([]);
  totalPresence = signal(0);

  stats = computed(() => [
    { 
      label: 'Arrivi di Oggi', 
      value: this.todayArrivals().length, 
      icon: 'pi pi-sign-in', 
      color: '#4caf50',
      description: 'Cani in entrata'
    },
    { 
      label: 'Partenze di Oggi', 
      value: this.todayDepartures().length, 
      icon: 'pi pi-sign-out', 
      color: '#ff9800',
      description: 'Cani in uscita'
    },
    { 
      label: 'Presenze Attuali', 
      value: this.totalPresence(), 
      icon: 'pi pi-home', 
      color: '#2196f3',
      description: 'Cani nei box'
    }
  ]);

  constructor(
    private pb: PocketbaseService,
    private stayService: StayListService,
    private router: Router
  ) {}

  async ngOnInit() {
    await this.loadDashboardData();
  }

  async loadDashboardData() {
    this.loading.set(true);
    try {
      const today = formatYmdLocal(new Date());
      
      // Load arrivals for today
      const arrivals = await this.stayService.loadStays(`arrival_date >= "${today} 00:00:00" && arrival_date <= "${today} 23:59:59"`);
      this.todayArrivals.set(arrivals);

      // Load departures for today OR past un-picked-up stays
      const departures = await this.stayService.loadStays(
        `(departure_date >= "${today} 00:00:00" && departure_date <= "${today} 23:59:59") || (departure_date < "${today} 00:00:00" && is_picked_up = false)`
      );
      this.todayDepartures.set(departures);

      // Presence: occupations active now
      const currentOccs = await this.pb.pb.collection('occupations').getList(1, 1, {
        filter: `arrival_date <= "${today} 23:59:59" && departure_date >= "${today} 00:00:00"`,
      });
      this.totalPresence.set(currentOccs.totalItems);

    } catch (err) {
      // Handled globally
    } finally {
      this.loading.set(false);
    }
  }

  goToStay(id: string) {
    this.router.navigate(['/soggiorno', id]);
  }

  goToKennel() {
    this.router.navigate(['/box']);
  }
}

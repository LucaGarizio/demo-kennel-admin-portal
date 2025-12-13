import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';

import { NavbarComponent } from './navbar/navbar';
import { DialogReminderComponent } from './dialog-reminder-component/dialog-reminder.component';
import { PocketbaseService } from './shared/service/pocket-base-services/pocketbase.service';
import { Stay } from './shared/types/stay.types';
import { normalizeDate } from './shared/utils/date-utils';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent, DialogReminderComponent],
  templateUrl: './app.html',
})
export class App {
  isLoginPage = false;

  reminderStays: Stay[] = [];
  private reminderTimer: any;
  private alreadyNotified = new Set<string>();

  showReminder: boolean[] = [];
  reminderQueue: Stay[] = [];
  currentStay: Stay | null = null;
  dialogVisible = false;
  constructor(private router: Router, private pb: PocketbaseService) {
    this.router.events.pipe(filter((e) => e instanceof NavigationEnd)).subscribe((e: any) => {
      const url = e.urlAfterRedirects;
      this.isLoginPage = url === '/' || url === '/kiosk' || url.startsWith('/kiosk');
    });

    this.loadStaysWithReminder();
  }
  ngOnInit() {
    this.startReminderWatcher();
  }

  ngOnDestroy() {
    if (this.reminderTimer) {
      clearInterval(this.reminderTimer);
    }
  }
  startReminderWatcher() {
    this.loadStaysWithReminder();
    this.reminderTimer = setInterval(() => {
      this.loadStaysWithReminder();
    }, 30_000);
  }

  tryOpenNext() {
    if (this.dialogVisible) return;
    const next = this.reminderQueue.shift();
    if (!next) return;

    this.currentStay = next;
    this.dialogVisible = true;
  }

  async loadStaysWithReminder() {
    try {
      const stays = (await this.pb.getAll('stays', 200, {
        expand: 'dog_ids',
        requestKey: null,
      })) as unknown as Stay[];

      const newlyValid: Stay[] = [];

      for (const s of stays) {
        const ok =
          !!s.notes &&
          s.notes.trim() !== '' &&
          this.isWithin2Minutes(s.departure_date) &&
          !this.alreadyNotified.has(s.id);

        if (ok) {
          this.alreadyNotified.add(s.id);
          newlyValid.push(s);
        }
      }

      if (newlyValid.length > 0) {
        this.reminderQueue.push(...newlyValid);
        this.tryOpenNext();
      }
    } catch (err) {
      console.error('❌ Errore loadStaysWithReminder', err);
    }
  }

  onDialogClosed() {
    this.dialogVisible = false;
    this.currentStay = null;
    this.tryOpenNext();
  }

  isWithin24Hours(dateStr: string): boolean {
    if (!dateStr) return false;

    const target = new Date(dateStr);
    const now = new Date();

    const diffMs = target.getTime() - now.getTime();
    const diffHours = diffMs / 1000 / 60 / 60;

    return diffHours > 0 && diffHours <= 24;
  }

  isWithin2Minutes(dateStr: string): boolean {
    if (!dateStr) return false;
    const targetDate = normalizeDate(dateStr);
    if (!targetDate) return false;

    const target = targetDate.getTime();
    const now = Date.now();

    const diffMinutes = Math.abs(target - now) / 1000 / 60;

    console.log('⏱ DIFF MINUTES', diffMinutes);

    return diffMinutes <= 27;
  }
}

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';

import { NavbarComponent } from './navbar/navbar';
import { DialogReminderComponent } from './dialog-reminder-component/dialog-reminder.component';
import { PocketbaseService } from './shared/service/pocket-base-services/pocketbase.service';
import { Stay } from './shared/types/stay.types';
import { normalizeDate, toPocketDateTime } from './shared/utils/date-utils';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent, DialogReminderComponent],
  templateUrl: './app.html',
})
export class App {
  isLoginPage = false;

  private reminderTimer: any;
  private alreadyNotified = new Set<string>();
  private authCheckTimer: any;

  reminderQueue: Stay[] = [];
  currentStay: Stay | null = null;
  dialogVisible = false;

  constructor(private router: Router, private pb: PocketbaseService) {
    const initialUrl = this.router.url;
    this.isLoginPage =
      initialUrl === '/' || initialUrl === '/kiosk' || initialUrl.startsWith('/kiosk');
    this.router.events.pipe(filter((e) => e instanceof NavigationEnd)).subscribe((e: any) => {
      const url = e.urlAfterRedirects;
      this.isLoginPage = url === '/' || url === '/kiosk' || url.startsWith('/kiosk');
      this.updateReminderWatcher();
    });

    this.pb.pb.authStore.onChange(() => {
      this.updateReminderWatcher();
    });

    this.updateReminderWatcher();
    this.authCheckTimer = setInterval(() => {
      this.updateReminderWatcher();
    }, 10_000);
  }

  private updateReminderWatcher() {
    if (this.pb.isAuth && !this.isLoginPage) {
      this.startReminderWatcher();
    } else {
      this.stopReminderWatcher();
    }
  }

  stopReminderWatcher() {
    if (this.reminderTimer) {
      clearInterval(this.reminderTimer);
      this.reminderTimer = null;
    }

    this.reminderQueue = [];
    this.currentStay = null;
    this.dialogVisible = false;
  }

  ngOnDestroy() {
    if (this.reminderTimer) {
      clearInterval(this.reminderTimer);
    }
  }

  /* =========================
   *   WATCHER
   * ========================= */

  startReminderWatcher() {
    this.loadStaysWithReminder();
    this.reminderTimer = setInterval(() => {
      this.loadStaysWithReminder();
    }, 20_000);
  }

  async loadStaysWithReminder() {
    if (!this.pb.isAuth) return;

    try {
      const stays = (await this.pb.getAll('stays', 200, {
        expand: 'dog_ids',
        requestKey: null,
      })) as unknown as Stay[];

      const now = Date.now();
      const newlyValid: Stay[] = [];

      for (const s of stays) {
        if (!s.notes || s.notes.trim() === '') continue;
        if (this.alreadyNotified.has(s.id)) continue;

        if (s.postpone_at) {
          const pDate = normalizeDate(s.postpone_at);
          if (pDate && now >= pDate.getTime()) {
            this.alreadyNotified.add(s.id);
            newlyValid.push(s);
            continue;
          }
        }

        if (!s.reminder) {
          const dep = normalizeDate(s.departure_date);
          if (!dep) continue;

          const depTime = dep.getTime();
          const threshold24h = depTime - 24 * 60 * 60 * 1000;

          if (now >= threshold24h && now <= depTime) {
            this.alreadyNotified.add(s.id);
            newlyValid.push(s);
          }
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

  async tryOpenNext() {
    if (this.dialogVisible) return;

    const next = this.reminderQueue.shift();
    if (!next) return;

    if (!next.reminder) next.reminder = true;
    if (next.postpone_at) next.postpone_at = null;

    this.currentStay = next;
    this.dialogVisible = true;

    const updates: any = {};
    if (next.reminder === true) updates.reminder = true;
    updates.postpone_at = null;

    await this.pb.updateRecord('stays', next.id, updates);
  }

  onDialogClosed() {
    this.dialogVisible = false;
    this.currentStay = null;
    this.tryOpenNext();
  }

  /* =========================
   *   POSTICIPO
   * ========================= */
  async onPostpone(event: { stayId: string; minutes: number }) {
    const stay = this.currentStay;
    if (!stay || stay.id !== event.stayId) return;

    const baseDate = new Date();

    baseDate.setMinutes(baseDate.getMinutes() + event.minutes);

    const newPostponeAt = toPocketDateTime(baseDate);
    if (!newPostponeAt) return;

    await this.pb.updateRecord('stays', stay.id, {
      postpone_at: newPostponeAt,
    });

    this.alreadyNotified.delete(stay.id);

    this.dialogVisible = false;
    this.currentStay = null;
    this.tryOpenNext();
  }
}

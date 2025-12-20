import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';

import { NavbarComponent } from './navbar/navbar';
import { DialogReminderComponent } from './dialogs/dialog-reminder-component/dialog-reminder.component';
import { PocketbaseService } from './shared/service/pocket-base-services/pocketbase.service';
import { ReminderService } from './shared/service/reminder/reminder.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent, DialogReminderComponent],
  templateUrl: './app.html',
})
export class App implements OnDestroy {
  isLoginPage = false;
  private authCheckTimer: any;

  constructor(
    private router: Router,
    private pb: PocketbaseService,
    public reminder: ReminderService
  ) {
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
      this.reminder.startReminderWatcher();
    } else {
      this.reminder.stopReminderWatcher();
    }
  }

  ngOnDestroy() {
    this.reminder.stopReminderWatcher();
    if (this.authCheckTimer) {
      clearInterval(this.authCheckTimer);
    }
  }
}

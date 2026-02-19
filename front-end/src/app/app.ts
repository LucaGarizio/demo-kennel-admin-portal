import { Component, OnDestroy, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';

import { NavbarComponent } from './navbar/navbar';
import { DialogReminderComponent } from './shared/component/dialogs/dialog-reminder-component/dialog-reminder.component';
import { PocketbaseService } from './shared/service/pocket-base-services/pocketbase.service';
import { ReminderService } from './shared/service/reminder/reminder.service';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent, DialogReminderComponent, ToastModule],
  templateUrl: './app.html',
})
export class App implements OnDestroy {
  readonly isLoginPage = signal(false);

  constructor(
    private router: Router,
    private pb: PocketbaseService,
    public reminder: ReminderService
  ) {
    const initialUrl = this.router.url;
    this.isLoginPage.set(
      initialUrl === '/' || initialUrl === '/kiosk' || initialUrl.startsWith('/kiosk')
    );

    this.router.events.pipe(filter((e) => e instanceof NavigationEnd)).subscribe((e: any) => {
      const url = e.urlAfterRedirects;
      this.isLoginPage.set(url === '/' || url === '/kiosk' || url.startsWith('/kiosk'));
    });

    effect(() => {
      if (this.pb.isAuth() && !this.isLoginPage()) {
        this.reminder.startReminderWatcher();
      } else {
        this.reminder.stopReminderWatcher();
      }
    });
  }

  ngOnDestroy() {
    this.reminder.stopReminderWatcher();
  }
}

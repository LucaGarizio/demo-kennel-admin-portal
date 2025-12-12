// import { Component } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { Router, NavigationEnd, RouterOutlet } from '@angular/router';
// import { filter } from 'rxjs/operators';
// import { NavbarComponent } from './navbar/navbar';

// @Component({
//   selector: 'app-root',
//   standalone: true,
//   imports: [CommonModule, RouterOutlet, NavbarComponent],
//   templateUrl: './app.html',
//   styleUrls: ['./app.scss'],
// })
// export class App {
//   isLoginPage = false;

//   constructor(private router: Router) {
//     this.router.events
//       .pipe(filter((event) => event instanceof NavigationEnd))
//       .subscribe((event: any) => {
//         this.isLoginPage = event.urlAfterRedirects === '/' || event.url === '/';
//       });
//   }
// }
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';

import { NavbarComponent } from './navbar/navbar';
import { DialogReminderComponent } from './dialog-reminder-component/dialog-reminder.component';
import { PocketbaseService } from './shared/service/pocket-base-services/pocketbase.service';
import { DogListRecord } from './shared/types/dog-list.types';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent, DialogReminderComponent],
  templateUrl: './app.html',
})
export class App {
  isLoginPage = false;

  dogs: DogListRecord[] = [];
  stay: any = null;

  showReminder: boolean[] = [];

  constructor(private router: Router, private pb: PocketbaseService) {
    this.router.events.pipe(filter((e) => e instanceof NavigationEnd)).subscribe((e: any) => {
      const url = e.urlAfterRedirects;

      this.isLoginPage = url === '/' || url === '/firma-attesa' || url.startsWith('/firma');
    });

    this.loadDogsWithNotes();
  }

  async loadDogsWithNotes() {
    try {
      console.log('>>> CARICO CANI E STAY REALI...');
      const dogRecords = await this.pb.getAll('dogs', 200, { requestKey: null });
      const stayRecords = await this.pb.getAll('stays', 200, { requestKey: null });

      console.log('>>> Stay trovati:', stayRecords);

      const dogs = dogRecords.map((r: any) => ({
        id: r.id,
        name: r.name,
        extra: r.extra,
        raw: r,
      })) as DogListRecord[];

      const dogsWithNotes = dogs.filter((d) => d.extra && d.extra.trim() !== '');

      if (dogsWithNotes.length === 0) return;

      const dogsFinal = dogsWithNotes
        .map((dog) => {
          const stay = stayRecords.find((s: any) => s.dog_ids?.includes(dog.id));

          if (!stay) return null;

          const show = this.isWithin24Hours(stay['departure_date']);

          return {
            dog,
            stay,
            show,
          };
        })
        .filter((x) => x !== null);

      console.log('>>> Risultato finale:', dogsFinal);

      // 6) salvo per la vista
      this.dogs = dogsFinal.map((x) => x!.dog);
      this.stay = dogsFinal.map((x) => x!.stay);
      this.showReminder = dogsFinal.map((x) => x!.show);
    } catch (err) {
      console.error('!!! ERRORE CARICAMENTO CANI/STAY:', err);
    }
  }

  isWithin24Hours(dateStr: string): boolean {
    if (!dateStr) return false;

    const d = new Date(dateStr);
    const now = new Date();

    const diffMs = d.getTime() - now.getTime();
    const diffHours = diffMs / 1000 / 60 / 60;

    return diffHours > 0 && diffHours <= 24;
  }
}

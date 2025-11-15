// import { Routes } from '@angular/router';
// import { Login } from './pages/login/login';
// import { List } from './pages/animal-table/animal-list';
// import { Owner } from './pages/owner/owner';
// import { OwnerCreateComponent } from './pages/owner-create/owner-create';
// import { AnimalCreateComponent } from './pages/animal-create/animal-create';
// import { AuthGuard } from './auth.guard';
// import { KennelScheduleComponent } from './pages/kennel-schedule/kennel-schedule';

// export const routes: Routes = [
//   { path: '', component: Login },
//   { path: 'lista-cani', component: List, canActivate: [AuthGuard] },
//   { path: 'box', component: KennelScheduleComponent, canActivate: [AuthGuard] },
//   { path: 'lista-proprietari', component: Owner, canActivate: [AuthGuard] },
//   { path: 'proprietario/creazione', component: OwnerCreateComponent, canActivate: [AuthGuard] },
//   { path: 'cane/creazione', component: AnimalCreateComponent, canActivate: [AuthGuard] },
//   { path: 'proprietario/:id', component: Owner, canActivate: [AuthGuard] },
// ];

import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { List } from './pages/animal-table/animal-list';
import { Owner } from './pages/owner/owner';
import { OwnerCreateComponent } from './pages/owner-create/owner-create';
import { AnimalCreateComponent } from './pages/animal-create/animal-create';
import { StayList } from './pages/stay-list/stay-list';
import { StayCreateComponent } from './stay-create/stay-create';
import { AuthGuard } from './auth.guard';
import { KennelScheduleComponent } from './pages/kennel-schedule/kennel-schedule';

export const routes: Routes = [
  { path: '', component: Login },

  // Cani
  { path: 'lista-cani', component: List, canActivate: [AuthGuard] },
  { path: 'cane/creazione', component: AnimalCreateComponent, canActivate: [AuthGuard] },

  // Proprietari
  { path: 'lista-proprietari', component: Owner, canActivate: [AuthGuard] },
  { path: 'proprietario/creazione', component: OwnerCreateComponent, canActivate: [AuthGuard] },
  { path: 'proprietario/:id', component: Owner, canActivate: [AuthGuard] },

  // Soggiorni (NUOVO)
  { path: 'lista-soggiorni', component: StayList, canActivate: [AuthGuard] },
  { path: 'soggiorno/creazione', component: StayCreateComponent, canActivate: [AuthGuard] },
  { path: 'soggiorno/:id', component: StayCreateComponent, canActivate: [AuthGuard] },

  // Box (Calendario)
  { path: 'box', component: KennelScheduleComponent, canActivate: [AuthGuard] },
];

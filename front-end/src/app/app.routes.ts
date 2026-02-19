import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { DogList } from './pages/dog/dog-list/dog-list';
import { OwnerList } from './pages/owner/owner-list/owner-list';
import { OwnerManageComponent } from './pages/owner/owner-manage/owner-manage';
import { DogManageComponent } from './pages/dog/dog-manage/dog-manage';
import { StayList } from './pages/stay/stay-list/stay-list';
import { StayManageComponent } from './pages/stay/stay-manage/stay-manage';
import { AuthGuard } from './auth.guard';
import { KennelScheduleComponent } from './pages/kennel-schedule/kennel-schedule';
import { SignaturePage } from './pages/signature-page/signature-page';
import { SignatureWaiting } from './pages/signature-waiting/signature-waiting';

export const routes: Routes = [
  { path: '', component: Login },

  { path: 'lista-cani', component: DogList, canActivate: [AuthGuard] },
  { path: 'cane/:id', component: DogManageComponent, canActivate: [AuthGuard] },

  { path: 'lista-proprietari', component: OwnerList, canActivate: [AuthGuard] },
  { path: 'proprietario/:id', component: OwnerManageComponent, canActivate: [AuthGuard] },

  { path: 'lista-soggiorni', component: StayList, canActivate: [AuthGuard] },
  { path: 'soggiorno/:id', component: StayManageComponent, canActivate: [AuthGuard] },

  { path: 'box', component: KennelScheduleComponent, canActivate: [AuthGuard] },
  { path: 'kiosk', component: SignatureWaiting },
  { path: 'kiosk/:sessionId', component: SignaturePage },
];

import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { DogList } from './pages/dog/dog-list/dog-list';
import { OwnerList } from './pages/owner/owner-list/owner-list';
import { OwnerCreateComponent } from './pages/owner/owner-create/owner-create';
import { DogCreateComponent } from './pages/dog/dog-create/dog-create';
import { StayList } from './pages/stay/stay-list/stay-list';
import { StayCreateComponent } from './pages/stay/stay-create/stay-create';
import { StayEditComponent } from './pages/stay/stay-edit/stay-edit';
import { AuthGuard } from './auth.guard';
import { KennelScheduleComponent } from './pages/kennel-schedule/kennel-schedule';
import { OwnerEditComponent } from './pages/owner/owner-edit/owner-edit';
import { DogEditComponent } from './pages/dog/dog-edit/dog-edit';
import { SignaturePage } from './signature-page/signature-page';
import { SignatureWaiting } from './signature-waiting/signature-waiting';

export const routes: Routes = [
  { path: '', component: Login },

  { path: 'lista-cani', component: DogList, canActivate: [AuthGuard] },
  { path: 'cane/creazione', component: DogCreateComponent, canActivate: [AuthGuard] },
  { path: 'cane/:id', component: DogEditComponent, canActivate: [AuthGuard] },

  { path: 'lista-proprietari', component: OwnerList, canActivate: [AuthGuard] },
  { path: 'proprietario/creazione', component: OwnerCreateComponent, canActivate: [AuthGuard] },
  { path: 'proprietario/:id', component: OwnerEditComponent, canActivate: [AuthGuard] },

  { path: 'lista-soggiorni', component: StayList, canActivate: [AuthGuard] },
  { path: 'soggiorno/creazione', component: StayCreateComponent, canActivate: [AuthGuard] },
  { path: 'soggiorno/:id', component: StayEditComponent, canActivate: [AuthGuard] },

  { path: 'box', component: KennelScheduleComponent, canActivate: [AuthGuard] },
  { path: 'kiosk', component: SignatureWaiting },
  { path: 'kiosk/:sessionId', component: SignaturePage },
];

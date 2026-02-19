import { Routes } from '@angular/router';
import { AuthGuard } from './auth.guard';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./pages/login/login').then(m => m.Login) },
  { path: 'dashboard', loadComponent: () => import('./pages/dashboard/dashboard').then(m => m.DashboardComponent), canActivate: [AuthGuard] },

  { path: 'lista-cani', loadComponent: () => import('./pages/dog/dog-list/dog-list').then(m => m.DogList), canActivate: [AuthGuard] },
  { path: 'cane/:id', loadComponent: () => import('./pages/dog/dog-manage/dog-manage').then(m => m.DogManageComponent), canActivate: [AuthGuard] },

  { path: 'lista-proprietari', loadComponent: () => import('./pages/owner/owner-list/owner-list').then(m => m.OwnerList), canActivate: [AuthGuard] },
  { path: 'proprietario/:id', loadComponent: () => import('./pages/owner/owner-manage/owner-manage').then(m => m.OwnerManageComponent), canActivate: [AuthGuard] },

  { path: 'lista-soggiorni', loadComponent: () => import('./pages/stay/stay-list/stay-list').then(m => m.StayList), canActivate: [AuthGuard] },
  { path: 'soggiorno/:id', loadComponent: () => import('./pages/stay/stay-manage/stay-manage').then(m => m.StayManageComponent), canActivate: [AuthGuard] },

  { path: 'box', loadComponent: () => import('./pages/kennel-schedule/kennel-schedule').then(m => m.KennelScheduleComponent), canActivate: [AuthGuard] },
  { path: 'kiosk', loadComponent: () => import('./pages/signature-waiting/signature-waiting').then(m => m.SignatureWaiting) },
  { path: 'kiosk/:sessionId', loadComponent: () => import('./pages/signature-page/signature-page').then(m => m.SignaturePage) },
];

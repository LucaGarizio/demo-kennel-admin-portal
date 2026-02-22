import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenubarModule } from 'primeng/menubar';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, MenubarModule, RouterModule],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.scss'],
})
export class NavbarComponent implements OnInit {
  items: MenuItem[] | undefined;

  ngOnInit() {
    this.items = [
      { label: 'Dashboard', icon: 'pi pi-home', routerLink: '/dashboard', styleClass: 'nav-link' },
      { label: 'Proprietari', icon: 'pi pi-users', routerLink: '/lista-proprietari', styleClass: 'nav-link' },
      { label: 'Cani', icon: 'pi pi-heart', routerLink: '/lista-cani', styleClass: 'nav-link' },
      { label: 'Soggiorni', icon: 'pi pi-calendar', routerLink: '/lista-soggiorni', styleClass: 'nav-link' },
      { label: 'Box', icon: 'pi pi-box', routerLink: '/box', styleClass: 'nav-link' }
    ];
  }
}

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { FloatLabelModule } from 'primeng/floatlabel';
import { Router } from '@angular/router';
import { PocketbaseService } from '../../../services/pocketbase.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, InputTextModule, ButtonModule, CardModule, FloatLabelModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss'],
})
export class Login {
  email = '';
  password = '';
  loading = false;

  constructor(private pb: PocketbaseService, private router: Router) {}

  async onLogin() {
    if (!this.email || !this.password) return;
    this.loading = true;
    try {
      await this.pb.login(this.email, this.password);
      this.router.navigate(['/lista-cani']);
    } catch (err) {
      console.error('Errore login:', err);
    } finally {
      this.loading = false;
    }
  }
}

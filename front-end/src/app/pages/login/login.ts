import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { FloatLabelModule } from 'primeng/floatlabel';
import { PasswordModule } from 'primeng/password';
import { Router } from '@angular/router';
import { PocketbaseService } from '../../shared/service/pocket-base-services/pocketbase.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    InputTextModule,
    ButtonModule,
    CardModule,
    FloatLabelModule,
    PasswordModule,
  ],
  templateUrl: './login.html',
  styleUrls: ['./login.scss'],
})
export class Login {
  email = signal('');
  password = signal('');
  loading = signal(false);
  showPassword = signal(false);

  constructor(private pb: PocketbaseService, private router: Router) {}

  async onLogin() {
    if (!this.email() || !this.password()) return;
    this.loading.set(true);
    try {
      await this.pb.login(this.email(), this.password());
      this.router.navigate(['/lista-proprietari']);
    } catch (err) {
      console.error('Errore login:', err);
    } finally {
      this.loading.set(false);
    }
  }
}

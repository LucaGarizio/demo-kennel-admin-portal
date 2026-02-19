import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { PocketbaseService } from '../../shared/service/pocket-base-services/pocketbase.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-signature-waiting',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './signature-waiting.html',
  styleUrls: ['./signature-waiting.scss'],
})
export class SignatureWaiting {
  isFading = signal(false);
  showSuccess = signal(false);
  successTimeout: any;

  constructor(private pb: PocketbaseService, private router: Router) {}

  ngOnInit() {
    if (sessionStorage.getItem('signature_done') === '1') {
      this.showSuccess.set(true);

      sessionStorage.removeItem('signature_done');

      setTimeout(() => {
        this.showSuccess.set(false);
      }, 3000);
    }

    this.pb.pb.collection('sign_session').subscribe('*', (e) => {
      const record = e.record;
      if (!record) return;

      const sessionId = record['session_id'];
      if (!sessionId) return;

      if (record['signature']) return;

      this.isFading.set(true);

      setTimeout(() => {
        this.router.navigate(['/kiosk', sessionId]);
      }, 500);
    });
  }

  private showSuccessMessage() {
    this.showSuccess.set(true);

    clearTimeout(this.successTimeout);
    this.successTimeout = setTimeout(() => {
      this.showSuccess.set(false);
    }, 3000);
  }
}

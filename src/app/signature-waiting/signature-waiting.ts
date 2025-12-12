import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { PocketbaseService } from '../shared/service/pocket-base-services/pocketbase.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-signature-waiting',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './signature-waiting.html',
  styleUrls: ['./signature-waiting.scss'],
})
// export class SignatureWaiting {
//   constructor(private pb: PocketbaseService, private router: Router) {}

//   ngOnInit() {
//     console.log('🔵 FIRMA-ATTESA: avvio realtime listener...');

//     this.pb.pb.collection('sign_session').subscribe('*', (e) => {
//       console.log('🟡 EVENTO REALTIME ARRIVATO:', e);

//       const record = e.record;
//       if (!record) return;

//       console.log('📌 RECORD RICEVUTO:', record);

//       const sessionId = record['session_id'];

//       if (sessionId) {
//         console.log('🟢 REDIRECT ALLA SESSIONE:', sessionId);
//         this.router.navigate(['/firma', sessionId]);
//       }
//     });
//   }
export class SignatureWaiting {
  isFading = false;

  constructor(private pb: PocketbaseService, private router: Router) {}

  ngOnInit() {
    console.log('🔵 FIRMA-ATTESA: avvio realtime listener...');

    this.pb.pb.collection('sign_session').subscribe('*', (e) => {
      console.log('🟡 EVENTO REALTIME ARRIVATO:', e);

      const record = e.record;
      if (!record) return;

      const sessionId = record['session_id'];
      if (!sessionId) return;

      console.log('🟢 FADE-OUT E REDIRECT ALLA SESSIONE:', sessionId);

      this.isFading = true;

      setTimeout(() => {
        this.router.navigate(['/firma', sessionId]);
      }, 500); // durata stessa della transition
    });
  }
}

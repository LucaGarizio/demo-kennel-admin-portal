import { Component, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PocketbaseService } from '../shared/service/pocket-base-services/pocketbase.service';
import { ButtonDirective } from 'primeng/button';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-signature-page',
  standalone: true,
  imports: [CommonModule, ButtonDirective, ButtonModule],
  templateUrl: './signature-page.html',
  styleUrls: ['./signature-page.scss'],
})
export class SignaturePage implements AfterViewChecked {
  model: any = null;
  loading = true;
  today = new Date();

  @ViewChild('signatureCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  private ctx!: CanvasRenderingContext2D;
  private canvasInitialized = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private pb: PocketbaseService
  ) {}

  // -------------------------------------------------------------
  // LOAD SESSIONE
  // -------------------------------------------------------------
  async ngOnInit() {
    const sessionId = this.route.snapshot.paramMap.get('sessionId');
    if (!sessionId) return;

    try {
      const session = await this.pb.pb
        .collection('sign_session')
        .getFirstListItem(`session_id="${sessionId}"`);

      this.model = session['model_json'];
      this.model._pbId = session.id;

      this.loading = false;
    } catch (err) {
      console.error('Errore nel recupero sessione:', err);
    }
  }

  // -------------------------------------------------------------
  // INIZIALIZZA CANVAS QUANDO ESISTE NEL DOM
  // -------------------------------------------------------------
  ngAfterViewChecked() {
    if (!this.canvasInitialized && !this.loading && this.canvasRef) {
      this.initCanvas();
      this.canvasInitialized = true;
    }
  }

  private initCanvas() {
    const canvas = this.canvasRef?.nativeElement;

    if (!canvas) {
      console.error('Canvas non trovato');
      return;
    }

    canvas.width = 300;
    canvas.height = 90;

    this.ctx = canvas.getContext('2d')!;
    this.ctx.strokeStyle = '#ffffff';
    this.ctx.lineWidth = 2;

    console.log('Canvas inizializzato correttamente');
  }

  // -------------------------------------------------------------
  // FIRMA AUTOMATICA
  // -------------------------------------------------------------
  autoSign() {
    if (!this.ctx) return;

    const canvas = this.canvasRef.nativeElement;
    const ctx = this.ctx;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.beginPath();
    ctx.moveTo(20, 60);

    ctx.bezierCurveTo(40, 20, 80, 80, 120, 30);
    ctx.bezierCurveTo(150, 10, 200, 70, 250, 40);

    ctx.stroke();
  }

  // -------------------------------------------------------------
  // SALVA FIRMA E REINDIRIZZA
  // -------------------------------------------------------------

  // async onConfirm() {
  //   console.log('1) Conferma cliccata');

  //   const canvas = this.canvasRef?.nativeElement;
  //   if (!canvas) {
  //     console.error('Canvas non disponibile');
  //     return;
  //   }

  //   const blob = await new Promise<Blob | null>((resolve) => {
  //     canvas.toBlob(resolve, 'image/png');
  //   });

  //   console.log('2) Blob generato:', blob);

  //   if (!blob) {
  //     console.error('Errore conversione blob');
  //     return;
  //   }

  //   const file = new File([blob], 'firma.png', { type: 'image/png' });

  //   const pbId = this.model?._pbId;
  //   console.log('3) PB ID:', pbId);

  //   if (!pbId) {
  //     console.error('ID PocketBase mancante');
  //     return;
  //   }

  //   try {
  //     console.log('4) Aggiorno sign_session…');

  //     const session = await this.pb.pb.collection('sign_session').update(pbId, {
  //       signature: file,
  //       stato: 'completed',
  //     });

  //     console.log('5) Risposta SIGN_SESSION:', session);

  //     // ⭐⭐⭐ QUI LA PARTE FONDAMENTALE ⭐⭐⭐
  //     const ownerId = session['model_json']?.id; // <-- l'id del proprietario viene dal modello salvato
  //     console.log('OWNER DA AGGIORNARE:', ownerId);

  //     if (ownerId) {
  //       console.log('6) Aggiorno OWNER con firma…');

  //       const ownerUpdate = await this.pb.pb.collection('owner').update(ownerId, {
  //         signature: file,
  //       });

  //       console.log('OWNER aggiornato:', ownerUpdate);
  //     } else {
  //       console.warn('ATTENZIONE: ownerId non trovato nel model_json.');
  //     }

  //     console.log('7) Reindirizzo…');
  //     this.router.navigate(['/firma-attesa']);
  //   } catch (err) {
  //     console.error('ERRORE PocketBase:', err);
  //   }
  // }

  // async onConfirm() {
  //   console.log('1) Conferma cliccata');

  //   const canvas = this.canvasRef?.nativeElement;
  //   if (!canvas) return;

  //   const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
  //   if (!blob) return;

  //   const file = new File([blob], 'firma.png', { type: 'image/png' });

  //   const sessionId = this.model?._pbId;
  //   if (!sessionId) {
  //     console.error('ID sign_session mancante');
  //     return;
  //   }

  //   try {
  //     console.log('2) Aggiorno sign_session…');

  //     const session = await this.pb.pb.collection('sign_session').update(sessionId, {
  //       signature: file,
  //       stato: 'completed',
  //     });

  //     console.log('3) SESSION AGGIORNATA', session);

  //     const ownerId = session['model_json']?.id;
  //     if (!ownerId) {
  //       console.error('ownerId non trovato dentro model_json');
  //       return;
  //     }

  //     console.log('4) Aggiorno owner…');

  //     const updatedOwner = await this.pb.pb.collection('owner').update(ownerId, {
  //       signature: file,
  //     });

  //     console.log('5) OWNER aggiornato:', updatedOwner);

  //     this.router.navigate(['/firma-attesa']);
  //   } catch (err) {
  //     console.error('ERRORE PocketBase:', err);
  //   }
  // }

  async onConfirm() {
    console.log('1) Conferma cliccata');

    const canvas = this.canvasRef?.nativeElement;
    if (!canvas) {
      console.error('Canvas non disponibile');
      return;
    }

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, 'image/png');
    });

    console.log('2) Blob generato:', blob);

    if (!blob) {
      console.error('Errore conversione blob');
      return;
    }

    const file = new File([blob], 'firma.png', { type: 'image/png' });

    const sessionId = this.model?._pbId;
    if (!sessionId) {
      console.error('ID sign_session mancante');
      return;
    }

    try {
      console.log('3) Aggiorno sign_session con firma…');

      const updatedSession = await this.pb.pb.collection('sign_session').update(sessionId, {
        signature: file,
        stato: 'completed',
      });

      console.log('4) SESSIONE AGGIORNATA:', updatedSession);

      // NON CERCARE ownerId QUI — L’OWNER ANCORA NON ESISTE
      console.log('5) Firma salvata nella sessione. Redirect…');

      this.router.navigate(['/firma-attesa']);
    } catch (err) {
      console.error('ERRORE PocketBase:', err);
    }
  }
}

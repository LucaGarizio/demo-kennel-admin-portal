import { Component, ViewChild, ElementRef, AfterViewChecked, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PocketbaseService } from '../../shared/service/pocket-base-services/pocketbase.service';
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
  model = signal<any>(null);
  loading = signal(true);
  displayDate = signal<Date>(new Date());

  @ViewChild('signatureCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  private ctx!: CanvasRenderingContext2D;
  private canvasInitialized = false;
  private drawing = false;
  private lastX = 0;
  private lastY = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private pb: PocketbaseService
  ) {}

  async ngOnInit() {
    const sessionId = this.route.snapshot.paramMap.get('sessionId');
    if (!sessionId) {
      return;
    }

    try {
      const session = await this.pb.pb
        .collection('sign_session')
        .getFirstListItem(`session_id="${sessionId}"`);
      this.model.set(session['model_json']);
      this.model()._pbId = session.id;
      if (this.model()?.created) {
        this.displayDate.set(new Date(this.model().created));
      } else {
        this.displayDate.set(new Date());
      }

      this.loading.set(false);
    } catch (err) {
      // Handled globally
    }
  }

  ngAfterViewChecked() {
    if (!this.canvasInitialized && !this.loading() && this.canvasRef) {
      this.initCanvas();
      this.canvasInitialized = true;
      this.loadSignatureFromModel();
    }
  }

  private getCanvasCoords(e: any) {
    const canvas = this.canvasRef.nativeElement;
    const rect = canvas.getBoundingClientRect();

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }

  private initCanvas() {
    const canvas = this.canvasRef.nativeElement;

    canvas.width = 300;
    canvas.height = 90;

    this.ctx = canvas.getContext('2d')!;
    this.ctx.strokeStyle = '#ffffff';
    this.ctx.lineWidth = 2;
    this.ctx.lineCap = 'round';

    canvas.addEventListener('mousedown', (e) => this.startDraw(e));
    canvas.addEventListener('mousemove', (e) => this.draw(e));
    canvas.addEventListener('mouseup', () => this.endDraw());
    canvas.addEventListener('mouseleave', () => this.endDraw());

    canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.startDraw(e.touches[0]);
    });

    canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      this.draw(e.touches[0]);
    });
    canvas.addEventListener('touchend', () => this.endDraw());
  }

  private startDraw(e: any) {
    this.drawing = true;

    const pos = this.getCanvasCoords(e);
    this.lastX = pos.x;
    this.lastY = pos.y;
  }

  private draw(e: any) {
    if (!this.drawing) return;

    const pos = this.getCanvasCoords(e);

    this.ctx.beginPath();
    this.ctx.moveTo(this.lastX, this.lastY);
    this.ctx.lineTo(pos.x, pos.y);
    this.ctx.stroke();

    this.lastX = pos.x;
    this.lastY = pos.y;
  }

  private endDraw() {
    this.drawing = false;
  }

  async onConfirm() {
    const canvas = this.canvasRef.nativeElement;

    const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, 'image/png'));
    if (!blob) return;

    const file = new File([blob], 'firma.png', { type: 'image/png' });

    const sessionId = this.model()?._pbId;
    if (!sessionId) return;

    await this.pb.pb.collection('sign_session').update(sessionId, {
      signature: file,
      stato: 'completed',
    });

    sessionStorage.setItem('signature_done', '1');
    this.router.navigate(['/kiosk']);
  }

  clearSignature() {
    const canvas = this.canvasRef.nativeElement;
    this.ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  private async loadSignatureFromModel() {
    if (!this.model()?.signature) {
      return;
    }
    const ownerRecord = {
      id: this.model().id,
      collectionName: 'owner',
    } as any;

    const url = this.pb.pb.getFileUrl(ownerRecord, this.model().signature);
    const blob = await fetch(url).then((r) => r.blob());
    const objectUrl = URL.createObjectURL(blob);

    const img = new Image();
    img.onload = () => {
      this.ctx.clearRect(0, 0, 300, 90);
      this.ctx.drawImage(img, 0, 0, 300, 90);
      URL.revokeObjectURL(objectUrl);
    };
    img.src = objectUrl;
  }
}

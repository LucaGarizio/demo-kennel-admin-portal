// // // import { Component, EventEmitter, Input, Output } from '@angular/core';
// // // import { CommonModule } from '@angular/common';
// // // import { FormsModule } from '@angular/forms';
// // // import { ButtonModule } from 'primeng/button';
// // // import { InputTextModule } from 'primeng/inputtext';
// // // import { DatePickerModule } from 'primeng/datepicker';
// // // import { SelectModule } from 'primeng/select';
// // // import { CardModule } from 'primeng/card';
// // // import { MultiSelectModule } from 'primeng/multiselect';
// // // import { FileUpload } from 'primeng/fileupload';
// // // import { HttpClientModule } from '@angular/common/http';
// // // import { PocketbaseService } from '../shared/service/pocket-base-services/pocketbase.service';
// // // import { Router } from '@angular/router';

// // // @Component({
// // //   selector: 'app-index-form',
// // //   standalone: true,
// // //   imports: [
// // //     CommonModule,
// // //     FormsModule,
// // //     ButtonModule,
// // //     InputTextModule,
// // //     DatePickerModule,
// // //     SelectModule,
// // //     CardModule,
// // //     MultiSelectModule,
// // //     FileUpload,
// // //     HttpClientModule,
// // //   ],
// // //   templateUrl: './index-form.html',
// // //   styleUrls: ['./index-form.scss'],
// // // })
// // // export class IndexFormComponent {
// // //   @Input() type: 'owner' | 'dogs' | 'stay' = 'owner';
// // //   @Input() model: any = {};
// // //   @Input() vaxOptions: any[] = [];
// // //   @Input() pauraOptions: any[] = [];
// // //   @Input() sexOptions: any[] = [];
// // //   @Input() tagliaOptions: any[] = [];
// // //   @Input() rettaOptions: any[] = [];
// // //   @Input() ownerOptions: any[] = [];
// // //   @Input() dogOptions: any[] = [];
// // //   @Input() areaOptions: any[] = [];
// // //   @Input() boxOptions: any[] = [];
// // //   tenderOptions = [
// // //     { label: 'Contanti', value: 'cash' },
// // //     { label: 'Pagamento elettronico', value: 'electronic' },
// // //   ];

// // //   @Output() save = new EventEmitter<any>();
// // //   @Output() ownerChange = new EventEmitter<string>();
// // //   @Output() filesSelected = new EventEmitter<File[]>();
// // //   @Output() deleteDocument = new EventEmitter<string>();
// // //   @Output() areaChange = new EventEmitter<{ index: number; area: string | null }>();
// // //   @Output() boxChange = new EventEmitter<{ index: number; box: string | null }>();

// // //   @Output() dogsChange = new EventEmitter<string[]>();
// // //   @Output() arrivalChange = new EventEmitter<Date>();
// // //   @Output() departureChange = new EventEmitter<Date>();
// // //   @Output() depositChange = new EventEmitter<void>();
// // //   today = new Date();

// // //   existingFiles: File[] = [];
// // //   private previousDocs: string[] = [];
// // //   uploadNeeded = false;
// // //   signatureUrl: string | null = null;

// // //   constructor(private pb: PocketbaseService, private router: Router) {}
// // //   // async ngOnChanges() {
// // //   //   if (this.model?.documents?.length) {
// // //   //     this.existingFiles = await this.loadExistingFiles();
// // //   //     this.uploadNeeded = false;
// // //   //   } else {
// // //   //     this.uploadNeeded = false;
// // //   //   }

// // //   //   this.previousDocs = [...(this.model?.documents ?? [])];
// // //   // }

// // //   async ngOnChanges() {
// // //     if (this.model?.signature) {
// // //       this.signatureUrl = this.pb.pb.files.getUrl(this.model, this.model.signature);
// // //     } else {
// // //       this.signatureUrl = null;
// // //     }

// // //     // resto del tuo codice già presente
// // //     if (this.model?.documents?.length) {
// // //       this.existingFiles = await this.loadExistingFiles();
// // //       this.uploadNeeded = false;
// // //     } else {
// // //       this.uploadNeeded = false;
// // //     }

// // //     this.previousDocs = [...(this.model?.documents ?? [])];
// // //   }

// // //   get firmaUrl(): string | null {
// // //     if (!this.model?.signature) return null;
// // //     return this.pb.pb.files.getUrl(this.model, this.model.signature);
// // //   }

// // //   onFilesPicked(files: File[]) {
// // //     this.filesSelected.emit(files);
// // //     this.uploadNeeded = true;
// // //   }

// // //   onDeleteDocument(doc: string) {
// // //     this.deleteDocument.emit(doc);
// // //     this.uploadNeeded = false;
// // //   }
// // //   getFileUrl(model: any, file: string) {
// // //     return this.pb.pb.files.getUrl(model, file);
// // //   }

// // //   async loadExistingFiles(): Promise<File[]> {
// // //     const result: File[] = [];
// // //     for (const name of this.model.documents) {
// // //       const url = `/api/files/owner/${this.model.id}/${name}`;
// // //       const blob = await fetch(url).then((r) => r.blob());
// // //       const file = new File([blob], name, { type: blob.type });
// // //       result.push(file);
// // //     }
// // //     return result;
// // //   }

// // //   onSubmit() {
// // //     this.save.emit(this.model);
// // //   }

// // //   getUrl(name: string) {
// // //     return `/api/files/owner/${this.model.id}/${name}`;
// // //   }

// // //   ngAfterViewInit() {
// // //     document.addEventListener(
// // //       'click',
// // //       (e) => {
// // //         const target = e.target as HTMLElement;

// // //         const removeBtn = target.closest('[data-pc-name="pcfileremovebutton"]');
// // //         if (removeBtn) {
// // //           const fileItem = removeBtn.closest('.p-fileupload-file');
// // //           const nameEl = fileItem?.querySelector('.p-fileupload-file-name');
// // //           const filename = nameEl?.textContent?.trim();
// // //           if (!filename) return;
// // //           if (Array.isArray(this.model.documents)) {
// // //             this.model.documents = this.model.documents.filter((d: string) => d !== filename);
// // //           }
// // //           this.deleteDocument.emit(filename);
// // //           this.uploadNeeded = false;
// // //         }
// // //       },
// // //       true
// // //     );
// // //   }

// // //   getDogName(id: string): string {
// // //     return this.dogOptions.find((d) => d.id === id)?.nome ?? '';
// // //   }

// // //   getEmptyMessage(index: number): string {
// // //     const cane = this.model.cani[index];

// // //     if (!cane.id_area) {
// // //       return "Seleziona un'area per vedere i box disponibili";
// // //     }

// // //     if (cane.boxOptions.length === 0) {
// // //       return "Nessun box disponibile per quest'area";
// // //     }

// // //     return '';
// // //   }

// // //   // async requestSign() {
// // //   //   // 1. salvi il modello in una sessione firma
// // //   //   const session = await this.pb.createSignSession(this.model);

// // //   //   // 2. ottieni l'id SESSIONE
// // //   //   const sessionId = session['session_id'];

// // //   //   // 3. MOSTRI SUL TABLET LA PAGINA DI FIRMA
// // //   //   // (in seguito la aprirà il tablet, NON il PC)
// // //   //   console.log('SESSIONE FIRMA CREATA:', sessionId);
// // //   // }
// // //   async requestSign() {
// // //     const session = await this.pb.createSignSession(this.model);
// // //     const sessionId = session['session_id'];

// // //     console.log('SESSIONE FIRMA:', sessionId);

// // //     // POLLING ogni 2s finché la firma appare
// // //     const interval = setInterval(async () => {
// // //       const updated = await this.pb.pb.collection('owner').getOne(this.model.id);

// // //       if (updated['signature']) {
// // //         this.model.signature = updated['signature'];
// // //         clearInterval(interval);
// // //       }
// // //     }, 2000);
// // //   }
// // // }

// // import { Component, EventEmitter, Input, Output, ChangeDetectorRef } from '@angular/core';
// // import { CommonModule } from '@angular/common';
// // import { FormsModule } from '@angular/forms';
// // import { ButtonModule } from 'primeng/button';
// // import { InputTextModule } from 'primeng/inputtext';
// // import { DatePickerModule } from 'primeng/datepicker';
// // import { SelectModule } from 'primeng/select';
// // import { CardModule } from 'primeng/card';
// // import { MultiSelectModule } from 'primeng/multiselect';
// // import { FileUpload } from 'primeng/fileupload';
// // import { HttpClientModule } from '@angular/common/http';
// // import { PocketbaseService } from '../shared/service/pocket-base-services/pocketbase.service';
// // import { Router } from '@angular/router';

// // @Component({
// //   selector: 'app-index-form',
// //   standalone: true,
// //   imports: [
// //     CommonModule,
// //     FormsModule,
// //     ButtonModule,
// //     InputTextModule,
// //     DatePickerModule,
// //     SelectModule,
// //     CardModule,
// //     MultiSelectModule,
// //     FileUpload,
// //     HttpClientModule,
// //   ],
// //   templateUrl: './index-form.html',
// //   styleUrls: ['./index-form.scss'],
// // })
// // export class IndexFormComponent {
// //   @Input() type: 'owner' | 'dogs' | 'stay' = 'owner';
// //   @Input() model: any = {};
// //   @Input() vaxOptions: any[] = [];
// //   @Input() pauraOptions: any[] = [];
// //   @Input() sexOptions: any[] = [];
// //   @Input() tagliaOptions: any[] = [];
// //   @Input() rettaOptions: any[] = [];
// //   @Input() ownerOptions: any[] = [];
// //   @Input() dogOptions: any[] = [];
// //   @Input() areaOptions: any[] = [];
// //   @Input() boxOptions: any[] = [];

// //   tenderOptions = [
// //     { label: 'Contanti', value: 'cash' },
// //     { label: 'Pagamento elettronico', value: 'electronic' },
// //   ];

// //   @Output() save = new EventEmitter<any>();
// //   @Output() ownerChange = new EventEmitter<string>();
// //   @Output() filesSelected = new EventEmitter<File[]>();
// //   @Output() deleteDocument = new EventEmitter<string>();
// //   @Output() areaChange = new EventEmitter<{ index: number; area: string | null }>();
// //   @Output() boxChange = new EventEmitter<{ index: number; box: string | null }>();
// //   @Output() dogsChange = new EventEmitter<string[]>();
// //   @Output() arrivalChange = new EventEmitter<Date>();
// //   @Output() departureChange = new EventEmitter<Date>();
// //   @Output() depositChange = new EventEmitter<void>();

// //   today = new Date();
// //   existingFiles: File[] = [];
// //   uploadNeeded = false;

// //   signatureUrl: string | null = null;

// //   constructor(
// //     private pb: PocketbaseService,
// //     private router: Router,
// //     private cdr: ChangeDetectorRef
// //   ) {}

// //   // ---------------------------------------------
// //   // RICARICA MODELLO (DOCUMENTI + FIRMA)
// //   // ---------------------------------------------
// //   // async ngOnChanges() {
// //   //   // Ricarica firma con anti-cache
// //   //   if (this.model?.signature) {
// //   //     this.signatureUrl = this.getFileUrl(this.model, this.model.signature);
// //   //   } else {
// //   //     this.signatureUrl = null;
// //   //   }

// //   //   // Ricarica documenti
// //   //   if (this.model?.documents?.length) {
// //   //     this.existingFiles = await this.loadExistingFiles();
// //   //   } else {
// //   //     this.existingFiles = [];
// //   //   }

// //   //   this.uploadNeeded = false;
// //   // }

// //   async ngOnChanges() {
// //     if (this.model?.signature) {
// //       this.signatureUrl = this.getFileUrl(this.model, this.model.signature);
// //     } else {
// //       this.signatureUrl = null;
// //     }

// //     if (this.model?.documents?.length) {
// //       this.existingFiles = await this.loadExistingFiles();
// //     } else {
// //       this.existingFiles = [];
// //     }

// //     this.uploadNeeded = false;
// //   }

// //   // ---------------------------------------------
// //   // FILE FIRMA (URL con anti-cache)
// //   // ---------------------------------------------
// //   // getFileUrl(model: any, file: string) {
// //   //   const url = this.pb.pb.files.getUrl(model, file);
// //   //   return `${url}?v=${Date.now()}`;
// //   // }

// //   getFileUrl(model: any, file: string) {
// //     const base = this.pb.pb.files.getUrl(model, file);
// //     return `${base}?v=${Date.now()}`;
// //   }

// //   get firmaUrl(): string | null {
// //     if (!this.model?.signature) return null;
// //     return this.getFileUrl(this.model, this.model.signature);
// //   }

// //   // ---------------------------------------------
// //   // DOCUMENTI
// //   // ---------------------------------------------
// //   async loadExistingFiles(): Promise<File[]> {
// //     const files: File[] = [];
// //     for (const name of this.model.documents) {
// //       const url = `/api/files/owner/${this.model.id}/${name}`;
// //       const blob = await fetch(url).then((r) => r.blob());
// //       files.push(new File([blob], name, { type: blob.type }));
// //     }
// //     return files;
// //   }

// //   onFilesPicked(files: File[]) {
// //     this.filesSelected.emit(files);
// //     this.uploadNeeded = true;
// //   }

// //   onDeleteDocument(doc: string) {
// //     this.deleteDocument.emit(doc);
// //     this.uploadNeeded = false;
// //   }

// //   // ---------------------------------------------
// //   // SUBMIT
// //   // ---------------------------------------------
// //   // onSubmit() {
// //   //   this.save.emit(this.model);
// //   // }
// //   onSubmit() {
// //   if (!this.model.signature) {
// //     alert("Serve la firma prima di salvare il proprietario.");
// //     return;
// //   }

// //   this.save.emit(this.model); // salva owner con firma
// // }

// //   // ---------------------------------------------
// //   // LETTURA NOME CANE
// //   // ---------------------------------------------
// //   getDogName(id: string): string {
// //     return this.dogOptions.find((d) => d.id === id)?.nome ?? '';
// //   }

// //   getEmptyMessage(index: number): string {
// //     const cane = this.model.cani[index];
// //     if (!cane.id_area) return "Seleziona un'area per vedere i box disponibili";
// //     if (cane.boxOptions.length === 0) return "Nessun box disponibile per quest'area";
// //     return '';
// //   }

// //   // ---------------------------------------------
// //   // LISTENER DELETE FILE NEL DOM
// //   // ---------------------------------------------
// //   ngAfterViewInit() {
// //     document.addEventListener(
// //       'click',
// //       (e) => {
// //         const target = e.target as HTMLElement;
// //         const removeBtn = target.closest('[data-pc-name="pcfileremovebutton"]');
// //         if (!removeBtn) return;

// //         const item = removeBtn.closest('.p-fileupload-file');
// //         const nameEl = item?.querySelector('.p-fileupload-file-name');
// //         const filename = nameEl?.textContent?.trim();
// //         if (!filename) return;

// //         if (Array.isArray(this.model.documents)) {
// //           this.model.documents = this.model.documents.filter((d: string) => d !== filename);
// //         }

// //         this.deleteDocument.emit(filename);
// //         this.uploadNeeded = false;
// //       },
// //       true
// //     );
// //   }

// //   // ---------------------------------------------
// //   // RICHIESTA FIRMA + POLLING
// //   // ---------------------------------------------
// //   // async requestSign() {
// //   //   console.log('%c[RICHIESTA FIRMA] Avvio sessione…', 'color: #00bcd4; font-weight: bold');

// //   //   const session = await this.pb.createSignSession(this.model);
// //   //   const sessionId = session['session_id'];

// //   //   console.log('%c[SESSIONE FIRMA CREATA]', 'color: #00bcd4; font-weight: bold', sessionId);
// //   //   console.log('%c[START POLLING] Controllo firma ogni 2s…', 'color: #ffa000; font-weight: bold');

// //   //   let cycle = 0;

// //   //   const interval = setInterval(async () => {
// //   //     cycle++;
// //   //     console.log(`%c[POLLING #${cycle}] Recupero owner ${this.model.id}…`, 'color: #ffa000');

// //   //     let updated: any;
// //   //     try {
// //   //       updated = await this.pb.pb.collection('owner').getOne(this.model.id);
// //   //       console.log('%c[PB RESPONSE]', 'color: #9c27b0; font-weight: bold', updated);
// //   //     } catch (err) {
// //   //       console.error('[ERRORE PB GETONE]', err);
// //   //       return;
// //   //     }

// //   //     if (!updated) {
// //   //       console.warn('%c[NONE UPDATED] Nessun dato ritornato', 'color: orange');
// //   //       return;
// //   //     }

// //   //     // ---- CHECK FIRMA ----
// //   //     console.log('%c[FIRMA TROVATA?]', 'color: #2196f3; font-weight: bold', updated['signature']);

// //   //     if (updated['signature']) {
// //   //       console.log(
// //   //         '%c[FIRMA RICEVUTA]',
// //   //         'color: #4caf50; font-weight: bold',
// //   //         updated['signature']
// //   //       );

// //   //       this.model.signature = updated['signature'];

// //   //       this.signatureUrl = this.getFileUrl(updated, updated['signature']);
// //   //       console.log('%c[NUOVO URL FIRMA]', 'color: #4caf50', this.signatureUrl);

// //   //       console.log('%c[UI UPDATE] detectChanges()', 'color: #4caf50');
// //   //       this.cdr.detectChanges();

// //   //       console.log('%c[STOP POLLING] Firma trovata', 'color: red; font-weight: bold');
// //   //       clearInterval(interval);
// //   //     } else {
// //   //       console.log('%c[FIRMA NON ANCORA PRESENTE]', 'color: #f44336;');
// //   //     }
// //   //   }, 2000);
// //   // }

// //   async requestSign() {
// //     console.log('%c[RICHIEDI FIRMA] Creo sessione firma…', 'color:#00bcd4; font-weight:bold');

// //     // 1️⃣ Clono tutti i dati del form, anche se non salvati
// //     const payload = JSON.parse(JSON.stringify(this.model));
// //     console.log('[MODELLO INVIATO ALLA FIRMA]', payload);

// //     // 2️⃣ Creo la sign_session contenente il modello completo
// //     const session = await this.pb.pb.collection('sign_session').create({
// //       session_id: crypto.randomUUID(),
// //       model_json: payload,
// //       signature: null,
// //       stato: 'pending',
// //     });

// //     const sessionId = session.id;
// //     console.log('[SESSIONE FIRMA CREATA]', sessionId);

// //     // 3️⃣ Apro la pagina di firma sul tablet / altro device
// //     window.open(`/firma/${sessionId}`, '_blank');

// //     // 4️⃣ Avvio polling su sign_session (NON owner)
// //     this.startPollingSignature(sessionId);
// //   }

// //   private startPollingSignature(sessionId: string) {
// //     console.log('%c[START POLLING] Controllo firma ogni 2s…', 'color:#ffa000');

// //     let cycle = 0;

// //     const interval = setInterval(async () => {
// //       cycle++;
// //       console.log(`[POLL #${cycle}] Controllo sign_session ${sessionId}`);

// //       try {
// //         const session = await this.pb.pb.collection('sign_session').getOne(sessionId);
// //         console.log('[SESSIONE LETTA]', session);

// //         if (!session.signature) {
// //           console.log('%cFirma non ancora presente', 'color:#f44336');
// //           return;
// //         }

// //         console.log('%c[FIRMA TROVATA]', 'color:#4caf50; font-weight:bold', session.signature);

// //         // 1️⃣ aggiorno il modello del form
// //         this.model.signature = session.signature;

// //         // 2️⃣ aggiorno URL firma
// //         this.signatureUrl = this.getFileUrl(session, session.signature);

// //         // 3️⃣ aggiorno UI
// //         this.cdr.detectChanges();

// //         console.log('%c[STOP POLLING] Firma ricevuta', 'color:red; font-weight:bold');
// //         clearInterval(interval);
// //       } catch (err) {
// //         console.error('[ERRORE POLLING SIGN_SESSION]', err);
// //       }
// //     }, 2000);
// //   }
// // }

// // import { Component, EventEmitter, Input, Output, ChangeDetectorRef } from '@angular/core';
// // import { CommonModule } from '@angular/common';
// // import { FormsModule } from '@angular/forms';
// // import { ButtonModule } from 'primeng/button';
// // import { InputTextModule } from 'primeng/inputtext';
// // import { DatePickerModule } from 'primeng/datepicker';
// // import { SelectModule } from 'primeng/select';
// // import { CardModule } from 'primeng/card';
// // import { MultiSelectModule } from 'primeng/multiselect';
// // import { FileUpload } from 'primeng/fileupload';
// // import { HttpClientModule } from '@angular/common/http';
// // import { PocketbaseService } from '../shared/service/pocket-base-services/pocketbase.service';
// // import { Router } from '@angular/router';

// // @Component({
// //   selector: 'app-index-form',
// //   standalone: true,
// //   imports: [
// //     CommonModule,
// //     FormsModule,
// //     ButtonModule,
// //     InputTextModule,
// //     DatePickerModule,
// //     SelectModule,
// //     CardModule,
// //     MultiSelectModule,
// //     FileUpload,
// //     HttpClientModule,
// //   ],
// //   templateUrl: './index-form.html',
// //   styleUrls: ['./index-form.scss'],
// // })
// // export class IndexFormComponent {
// //   @Input() type: 'owner' | 'dogs' | 'stay' = 'owner';
// //   @Input() model: any = {};

// //   @Input() vaxOptions: any[] = [];
// //   @Input() pauraOptions: any[] = [];
// //   @Input() sexOptions: any[] = [];
// //   @Input() tagliaOptions: any[] = [];
// //   @Input() rettaOptions: any[] = [];
// //   @Input() ownerOptions: any[] = [];
// //   @Input() dogOptions: any[] = [];
// //   @Input() areaOptions: any[] = [];
// //   @Input() boxOptions: any[] = [];

// //   tenderOptions = [
// //     { label: 'Contanti', value: 'cash' },
// //     { label: 'Pagamento elettronico', value: 'electronic' },
// //   ];

// //   @Output() save = new EventEmitter<any>();
// //   @Output() ownerChange = new EventEmitter<string>();
// //   @Output() filesSelected = new EventEmitter<File[]>();
// //   @Output() deleteDocument = new EventEmitter<string>();
// //   @Output() areaChange = new EventEmitter<{ index: number; area: string | null }>();
// //   @Output() boxChange = new EventEmitter<{ index: number; box: string | null }>();
// //   @Output() dogsChange = new EventEmitter<string[]>();
// //   @Output() arrivalChange = new EventEmitter<Date>();
// //   @Output() departureChange = new EventEmitter<Date>();
// //   @Output() depositChange = new EventEmitter<void>();

// //   today = new Date();
// //   existingFiles: File[] = [];
// //   uploadNeeded = false;

// //   signatureUrl: string | null = null;

// //   constructor(
// //     private pb: PocketbaseService,
// //     private router: Router,
// //     private cdr: ChangeDetectorRef
// //   ) {}

// //   // ---------------------------------------------
// //   // RICARICO MODELLO (documenti + firma)
// //   // ---------------------------------------------
// //   async ngOnChanges() {
// //     if (this.model?.['signature']) {
// //       this.signatureUrl = this.getFileUrl(this.model, this.model['signature']);
// //     } else {
// //       this.signatureUrl = null;
// //     }

// //     if (this.model?.documents?.length) {
// //       this.existingFiles = await this.loadExistingFiles();
// //     } else {
// //       this.existingFiles = [];
// //     }

// //     this.uploadNeeded = false;
// //   }

// //   // ---------------------------------------------
// //   // URL FIRMA
// //   // ---------------------------------------------
// //   getFileUrl(model: any, file: string) {
// //     return this.pb.pb.files.getUrl(model, file);
// //   }

// //   get firmaUrl(): string | null {
// //     if (!this.model?.['signature']) return null;
// //     return this.getFileUrl(this.model, this.model['signature']);
// //   }

// //   // ---------------------------------------------
// //   // DOCUMENTI
// //   // ---------------------------------------------
// //   async loadExistingFiles(): Promise<File[]> {
// //     const files: File[] = [];
// //     for (const name of this.model.documents) {
// //       const url = `/api/files/owner/${this.model.id}/${name}`;
// //       const blob = await fetch(url).then((r) => r.blob());
// //       files.push(new File([blob], name, { type: blob.type }));
// //     }
// //     return files;
// //   }

// //   onFilesPicked(files: File[]) {
// //     this.filesSelected.emit(files);
// //     this.uploadNeeded = true;
// //   }

// //   onDeleteDocument(doc: string) {
// //     this.deleteDocument.emit(doc);
// //     this.uploadNeeded = false;
// //   }

// //   // ---------------------------------------------
// //   // SALVA (solo dopo firma)
// //   // ---------------------------------------------
// //   onSubmit() {
// //     if (!this.model['signature']) {
// //       alert('Serve la firma prima di salvare il proprietario.');
// //       return;
// //     }

// //     this.save.emit(this.model);
// //   }

// //   // ---------------------------------------------
// //   // SUPPORTO UI
// //   // ---------------------------------------------
// //   getDogName(id: string): string {
// //     return this.dogOptions.find((d) => d.id === id)?.nome ?? '';
// //   }

// //   getEmptyMessage(index: number): string {
// //     const cane = this.model.cani[index];
// //     if (!cane.id_area) return "Seleziona un'area per vedere i box disponibili";
// //     if (cane.boxOptions.length === 0) return "Nessun box disponibile per quest'area";
// //     return '';
// //   }

// //   ngAfterViewInit() {
// //     document.addEventListener(
// //       'click',
// //       (e) => {
// //         const target = e.target as HTMLElement;
// //         const removeBtn = target.closest('[data-pc-name="pcfileremovebutton"]');
// //         if (!removeBtn) return;

// //         const item = removeBtn.closest('.p-fileupload-file');
// //         const nameEl = item?.querySelector('.p-fileupload-file-name');
// //         const filename = nameEl?.textContent?.trim();
// //         if (!filename) return;

// //         if (Array.isArray(this.model.documents)) {
// //           this.model.documents = this.model.documents.filter((d: string) => d !== filename);
// //         }

// //         this.deleteDocument.emit(filename);
// //         this.uploadNeeded = false;
// //       },
// //       true
// //     );
// //   }

// //   // ---------------------------------------------
// //   // RICHIESTA FIRMA (usa dati NON salvati)
// //   // ---------------------------------------------
// //   async requestSign() {
// //     console.log('%c[RICHIEDI FIRMA] Creo sessione firma…', 'color:#00bcd4; font-weight:bold');

// //     // 1️⃣ clono modello e genero id temporaneo
// //     const payload = JSON.parse(JSON.stringify(this.model));

// //     if (!payload.tempId) {
// //       payload.tempId = crypto.randomUUID(); // <<< ID TEMPORANEO
// //     }

// //     // 2️⃣ creo la sessione firma
// //     const session = await this.pb.pb.collection('sign_session').create({
// //       session_id: crypto.randomUUID(),
// //       model_json: payload,
// //       signature: null,
// //       stato: 'pending',
// //     });

// //     const sessionId = session.id;

// //     console.log('[SESSIONE FIRMA CREATA]', sessionId, payload);

// //     // 3️⃣ aggiorno anche il model locale con tempId
// //     this.model.tempId = payload.tempId;

// //     // 4️⃣ parte polling
// //     this.startPollingSignature(sessionId);
// //   }

// //   // ---------------------------------------------
// //   // POLLING SOLO SU sign_session
// //   // ---------------------------------------------
// //   private startPollingSignature(sessionId: string) {
// //     console.log('[START POLLING FIRMA]');

// //     const interval = setInterval(async () => {
// //       try {
// //         const session = await this.pb.pb.collection('sign_session').getOne(sessionId);
// //         console.log('[SESSIONE]', session);

// //         const sign = session['signature'];

// //         if (!sign) {
// //           console.log('Firma NON presente');
// //           return;
// //         }

// //         console.log('FIRMA TROVATA:', sign);

// //         // 1️⃣ COPIO LA FIRMA DENTRO OWNER
// //         const updatedOwner = await this.pb.pb.collection('owner').update(this.model.id, {
// //           signature: sign,
// //         });

// //         // 2️⃣ AGGIORNO MODELLO LOCALE
// //         this.model['signature'] = updatedOwner['signature'];

// //         // 3️⃣ COSTRUISCO URL CORRETTO
// //         const url = this.pb.pb.files.getUrl(updatedOwner, updatedOwner['signature']);

// //         // 4️⃣ UPDATE UI
// //         setTimeout(() => {
// //           this.signatureUrl = url;
// //           this.cdr.detectChanges();
// //         }, 0);

// //         console.log('[STOP POLLING]');
// //         clearInterval(interval);
// //       } catch (e) {
// //         console.error('[ERRORE POLLING]', e);
// //       }
// //     }, 2000);
// //   }
// // }

// import {
//   Component,
//   EventEmitter,
//   Input,
//   Output,
//   ChangeDetectorRef,
//   OnChanges,
// } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { ButtonModule } from 'primeng/button';
// import { InputTextModule } from 'primeng/inputtext';
// import { DatePickerModule } from 'primeng/datepicker';
// import { SelectModule } from 'primeng/select';
// import { CardModule } from 'primeng/card';
// import { MultiSelectModule } from 'primeng/multiselect';
// import { FileUpload } from 'primeng/fileupload';
// import { HttpClientModule } from '@angular/common/http';
// import { PocketbaseService } from '../shared/service/pocket-base-services/pocketbase.service';
// import { Router } from '@angular/router';

// // -----------------------------------------------------
// // INDEX SIGNATURE per pb.files.getUrl()
// // -----------------------------------------------------
// interface PBFiles {
//   getUrl(record: any, fileName: string): string;
// }

// @Component({
//   selector: 'app-index-form',
//   standalone: true,
//   imports: [
//     CommonModule,
//     FormsModule,
//     ButtonModule,
//     InputTextModule,
//     DatePickerModule,
//     SelectModule,
//     CardModule,
//     MultiSelectModule,
//     FileUpload,
//     HttpClientModule,
//   ],
//   templateUrl: './index-form.html',
//   styleUrls: ['./index-form.scss'],
// })
// export class IndexFormComponent implements OnChanges {
//   @Input() type: 'owner' | 'dogs' | 'stay' = 'owner';
//   @Input() model: any = {};

//   @Input() vaxOptions: any[] = [];
//   @Input() pauraOptions: any[] = [];
//   @Input() sexOptions: any[] = [];
//   @Input() tagliaOptions: any[] = [];
//   @Input() rettaOptions: any[] = [];
//   @Input() ownerOptions: any[] = [];
//   @Input() dogOptions: any[] = [];
//   @Input() areaOptions: any[] = [];
//   @Input() boxOptions: any[] = [];

//   tenderOptions = [
//     { label: 'Contanti', value: 'cash' },
//     { label: 'Pagamento elettronico', value: 'electronic' },
//   ];

//   @Output() save = new EventEmitter<any>();
//   @Output() ownerChange = new EventEmitter<string>();
//   @Output() filesSelected = new EventEmitter<File[]>();
//   @Output() deleteDocument = new EventEmitter<string>();
//   @Output() areaChange = new EventEmitter<{ index: number; area: string | null }>();
//   @Output() boxChange = new EventEmitter<{ index: number; box: string | null }>();
//   @Output() dogsChange = new EventEmitter<string[]>();
//   @Output() arrivalChange = new EventEmitter<Date>();
//   @Output() departureChange = new EventEmitter<Date>();
//   @Output() depositChange = new EventEmitter<void>();

//   today = new Date();
//   existingFiles: File[] = [];
//   uploadNeeded = false;

//   signatureUrl: string | null = null;

//   constructor(
//     private pb: PocketbaseService,
//     private router: Router,
//     private cdr: ChangeDetectorRef
//   ) {}

//   // -----------------------------------------------------
//   // RICARICO MODELLO (firma + documenti)
//   // -----------------------------------------------------
//   async ngOnChanges() {
//     if (this.model?.['signature']) {
//       this.signatureUrl = this.getFileUrl(this.model, this.model['signature']);
//     } else {
//       this.signatureUrl = null;
//     }

//     if (this.model?.documents?.length) {
//       this.existingFiles = await this.loadExistingFiles();
//     } else {
//       this.existingFiles = [];
//     }

//     this.uploadNeeded = false;
//   }

//   // -----------------------------------------------------
//   // URL FIRMA (versione corretta con index signature)
//   // -----------------------------------------------------
//   getFileUrl(model: any, file: string) {
//     if (!model || !file) return '';
//     return this.pb.pb.getFileUrl(model, file);
//   }

//   get firmaUrl(): string | null {
//     if (!this.model?.['signature']) return null;
//     return this.getFileUrl(this.model, this.model['signature']);
//   }

//   // -----------------------------------------------------
//   // DOCUMENTI
//   // -----------------------------------------------------
//   async loadExistingFiles(): Promise<File[]> {
//     const files: File[] = [];
//     for (const name of this.model.documents) {
//       const url = `/api/files/owner/${this.model.id}/${name}`;
//       const blob = await fetch(url).then((r) => r.blob());
//       files.push(new File([blob], name, { type: blob.type }));
//     }
//     return files;
//   }

//   onFilesPicked(files: File[]) {
//     this.filesSelected.emit(files);
//     this.uploadNeeded = true;
//   }

//   onDeleteDocument(doc: string) {
//     this.deleteDocument.emit(doc);
//     this.uploadNeeded = false;
//   }

//   // -----------------------------------------------------
//   // SALVATAGGIO OWNER (richiede firma)
//   // -----------------------------------------------------
//   onSubmit() {
//     // if (!this.model['signature']) {
//     //   alert('Serve la firma prima di salvare il proprietario.');
//     //   return;
//     // }

//     this.save.emit(this.model);
//   }

//   // -----------------------------------------------------
//   // UI SUPPORT
//   // -----------------------------------------------------
//   getDogName(id: string): string {
//     return this.dogOptions.find((d) => d.id === id)?.nome ?? '';
//   }

//   getEmptyMessage(index: number): string {
//     const cane = this.model.cani[index];
//     if (!cane.id_area) return "Seleziona un'area per vedere i box disponibili";
//     if (cane.boxOptions.length === 0) return "Nessun box disponibile per quest'area";
//     return '';
//   }

//   ngAfterViewInit() {
//     document.addEventListener(
//       'click',
//       (e) => {
//         const target = e.target as HTMLElement;
//         const removeBtn = target.closest('[data-pc-name="pcfileremovebutton"]');
//         if (!removeBtn) return;

//         const item = removeBtn.closest('.p-fileupload-file');
//         const nameEl = item?.querySelector('.p-fileupload-file-name');
//         const filename = nameEl?.textContent?.trim();
//         if (!filename) return;

//         if (Array.isArray(this.model.documents)) {
//           this.model.documents = this.model.documents.filter((d: string) => d !== filename);
//         }

//         this.deleteDocument.emit(filename);
//         this.uploadNeeded = false;
//       },
//       true
//     );
//   }

//   // -----------------------------------------------------
//   // RICHIESTA FIRMA
//   // -----------------------------------------------------
//   async requestSign() {
//     console.log('[RICHIEDI FIRMA] Creo sessione...');

//     const payload = JSON.parse(JSON.stringify(this.model));

//     if (!payload.tempId) {
//       payload.tempId = crypto.randomUUID();
//     }

//     const session = await this.pb.pb.collection('sign_session').create({
//       session_id: crypto.randomUUID(),
//       model_json: payload,
//       signature: null,
//       stato: 'pending',
//     });

//     const sessionId = session.id;

//     console.log('[SESSIONE FIRMA CREATA]', sessionId);

//     this.model.tempId = payload.tempId;
//     this.startPollingSignature(sessionId);
//   }

//   // -----------------------------------------------------
//   // POLLING FIRMA (COPIA SU OWNER + MOSTRA)
//   // -----------------------------------------------------
//   private startPollingSignature(sessionId: string) {
//     console.log('[START POLLING FIRMA]');

//     const interval = setInterval(async () => {
//       try {
//         const session = await this.pb.pb.collection('sign_session').getOne(sessionId);
//         const sign = session['signature'];

//         if (!sign) {
//           console.log('Firma NON presente');
//           return;
//         }

//         console.log('FIRMA TROVATA:', sign);

//         // aggiorna il modello locale
//         this.model['signature'] = sign;

//         // URL corretto (PocketBase v11)
//         const url = this.pb.pb.getFileUrl(session, sign);

//         setTimeout(() => {
//           this.signatureUrl = url;
//           console.log('URL FINALE:', url);
//           this.cdr.detectChanges();
//         }, 0);

//         console.log('[STOP POLLING]');
//         clearInterval(interval);
//       } catch (err) {
//         console.error('[ERRORE POLLING]', err);
//       }
//     }, 2000);
//   }

//   get debugSignatureUrl() {
//     const url = this.getFileUrl(this.model, this.model.signature);
//     console.log('URL FIRMA:', url);
//     return url;
//   }
// }

import {
  Component,
  EventEmitter,
  Input,
  Output,
  ChangeDetectorRef,
  OnChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { CardModule } from 'primeng/card';
import { MultiSelectModule } from 'primeng/multiselect';
import { FileUpload } from 'primeng/fileupload';

import { HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';

import { PocketbaseService } from '../shared/service/pocket-base-services/pocketbase.service';

// -----------------------------------------------------
// INDEX SIGNATURE per pb.files.getUrl()
// -----------------------------------------------------
interface PBFiles {
  getUrl(record: any, fileName: string): string;
}

@Component({
  selector: 'app-index-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    DatePickerModule,
    SelectModule,
    CardModule,
    MultiSelectModule,
    FileUpload,
    HttpClientModule,
  ],
  templateUrl: './index-form.html',
  styleUrls: ['./index-form.scss'],
})
export class IndexFormComponent implements OnChanges {
  @Input() type: 'owner' | 'dogs' | 'stay' = 'owner';
  @Input() model: any = {};

  @Input() vaxOptions: any[] = [];
  @Input() pauraOptions: any[] = [];
  @Input() sexOptions: any[] = [];
  @Input() tagliaOptions: any[] = [];
  @Input() rettaOptions: any[] = [];

  @Input() ownerOptions: any[] = [];
  @Input() dogOptions: any[] = [];
  @Input() areaOptions: any[] = [];
  @Input() boxOptions: any[] = [];

  tenderOptions = [
    { label: 'Contanti', value: 'cash' },
    { label: 'Pagamento elettronico', value: 'electronic' },
  ];

  @Output() save = new EventEmitter<any>();
  @Output() ownerChange = new EventEmitter<string>();
  @Output() filesSelected = new EventEmitter<File[]>();
  @Output() deleteDocument = new EventEmitter<string>();
  @Output() areaChange = new EventEmitter<{ index: number; area: string | null }>();
  @Output() boxChange = new EventEmitter<{ index: number; box: string | null }>();
  @Output() dogsChange = new EventEmitter<string[]>();
  @Output() arrivalChange = new EventEmitter<Date>();
  @Output() departureChange = new EventEmitter<Date>();
  @Output() depositChange = new EventEmitter<void>();

  today = new Date();
  existingFiles: File[] = [];
  uploadNeeded = false;
  signatureUrl: string | null = null;

  constructor(
    private pb: PocketbaseService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  // -----------------------------------------------------
  // RICARICO MODELLO (firma + documenti)
  // -----------------------------------------------------
  async ngOnChanges() {
    if (this.model?.['signature']) {
      this.signatureUrl = this.getFileUrl(this.model, this.model['signature']);
    } else {
      this.signatureUrl = null;
    }

    if (this.model?.documents?.length) {
      this.existingFiles = await this.loadExistingFiles();
    } else {
      this.existingFiles = [];
    }

    this.uploadNeeded = false;
  }

  // -----------------------------------------------------
  // URL FIRMA (versione corretta con index signature)
  // -----------------------------------------------------
  getFileUrl(model: any, file: string) {
    if (!model || !file) return '';
    return this.pb.pb.getFileUrl(model, file);
  }

  get firmaUrl(): string | null {
    console.log('MODEL:', this.model);
    console.log('ID:', this.model?.id);
    console.log('SIGNATURE:', this.model?.signature);

    if (!this.model?.id || !this.model?.signature) return null;
    return this.pb.pb.getFileUrl(this.model, this.model.signature);
  }

  // -----------------------------------------------------
  // DOCUMENTI
  // -----------------------------------------------------
  async loadExistingFiles(): Promise<File[]> {
    const files: File[] = [];

    for (const name of this.model.documents) {
      const url = `/api/files/owner/${this.model.id}/${name}`;
      const blob = await fetch(url).then((r) => r.blob());

      files.push(new File([blob], name, { type: blob.type }));
    }

    return files;
  }

  onFilesPicked(files: File[]) {
    this.filesSelected.emit(files);
    this.uploadNeeded = true;
  }

  onDeleteDocument(doc: string) {
    this.deleteDocument.emit(doc);
    this.uploadNeeded = false;
  }

  // -----------------------------------------------------
  // SALVATAGGIO OWNER (richiede firma)
  // -----------------------------------------------------
  onSubmit() {
    this.save.emit(this.model);
  }

  // -----------------------------------------------------
  // UI SUPPORT
  // -----------------------------------------------------
  getDogName(id: string): string {
    return this.dogOptions.find((d) => d.id === id)?.nome ?? '';
  }

  getEmptyMessage(index: number): string {
    const cane = this.model.cani[index];

    if (!cane.id_area) {
      return "Seleziona un'area per vedere i box disponibili";
    }

    if (cane.boxOptions.length === 0) {
      return "Nessun box disponibile per quest'area";
    }

    return '';
  }

  ngAfterViewInit() {
    document.addEventListener(
      'click',
      (e) => {
        const target = e.target as HTMLElement;
        const removeBtn = target.closest('[data-pc-name="pcfileremovebutton"]');
        if (!removeBtn) return;

        const item = removeBtn.closest('.p-fileupload-file');
        const nameEl = item?.querySelector('.p-fileupload-file-name');
        const filename = nameEl?.textContent?.trim();

        if (!filename) return;

        if (Array.isArray(this.model.documents)) {
          this.model.documents = this.model.documents.filter((d: string) => d !== filename);
        }

        this.deleteDocument.emit(filename);
        this.uploadNeeded = false;
      },
      true
    );
  }

  // -----------------------------------------------------
  // RICHIESTA FIRMA
  // -----------------------------------------------------
  async requestSign() {
    console.log('[RICHIEDI FIRMA] Creo sessione...');

    const payload = JSON.parse(JSON.stringify(this.model));

    if (!payload.tempId) {
      payload.tempId = crypto.randomUUID();
    }

    const session = await this.pb.pb.collection('sign_session').create({
      session_id: crypto.randomUUID(),
      model_json: payload,
      signature: null,
      stato: 'pending',
    });

    const sessionId = session.id;
    console.log('[SESSIONE FIRMA CREATA]', sessionId);

    this.model.tempId = payload.tempId;
    this.startPollingSignature(sessionId);
  }

  // -----------------------------------------------------
  // POLLING FIRMA (COPIA SU OWNER + MOSTRA)
  // -----------------------------------------------------
  // private startPollingSignature(sessionId: string) {
  //   console.log('[START POLLING FIRMA]');

  //   const interval = setInterval(async () => {
  //     try {
  //       const session = await this.pb.pb.collection('sign_session').getOne(sessionId);

  //       const sign = session['signature'];

  //       if (!sign) {
  //         console.log('Firma NON presente');
  //         return;
  //       }

  //       console.log('FIRMA TROVATA:', sign);

  //       // aggiorna il modello locale
  //       this.model['signature'] = sign;

  //       // URL corretto (PocketBase v11)
  //       const url = this.pb.pb.getFileUrl(session, sign);

  //       setTimeout(() => {
  //         this.signatureUrl = url;
  //         console.log('URL FINALE:', url);
  //         this.cdr.detectChanges();
  //       }, 0);

  //       console.log('[STOP POLLING]');
  //       clearInterval(interval);
  //     } catch (err) {
  //       console.error('[ERRORE POLLING]', err);
  //     }
  //   }, 2000);
  // }

  private startPollingSignature(sessionId: string) {
    console.log('[START POLLING FIRMA]');

    const interval = setInterval(async () => {
      try {
        const session = await this.pb.pb.collection('sign_session').getOne(sessionId);

        const sign = session['signature']; // nome file es: firma_xxx.png

        if (!sign) {
          console.log('Firma NON presente');
          return;
        }

        console.log('FIRMA TROVATA NELLA SIGN_SESSION:', sign);

        const urlSignSession = this.pb.pb.getFileUrl(session, sign);

        const blob = await fetch(urlSignSession).then((r) => r.blob());
        const file = new File([blob], sign, { type: blob.type });

        const updatedOwner = await this.pb.pb.collection('owner').update(this.model.id, {
          signature: file,
        });

        console.log('OWNER AGGIORNATO CON FIRMA:', updatedOwner['signature']);

        this.model.signature = updatedOwner['signature'];

        const url = this.pb.pb.getFileUrl(updatedOwner, updatedOwner['signature']);

        setTimeout(() => {
          this.signatureUrl = url;
          console.log('URL FINALE:', url);
          this.cdr.detectChanges();
        }, 0);

        console.log('[STOP POLLING]');
        clearInterval(interval);
      } catch (err) {
        console.error('[ERRORE POLLING]', err);
      }
    }, 2000);
  }

  get debugSignatureUrl() {
    const url = this.getFileUrl(this.model, this.model.signature);
    console.log('URL FIRMA:', url);
    return url;
  }
}

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentsDialogComponent } from './documents-dialog-component';

describe('DocumentsDialogComponent', () => {
  let component: DocumentsDialogComponent;
  let fixture: ComponentFixture<DocumentsDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DocumentsDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DocumentsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

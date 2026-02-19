import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreviewDialogComponent } from './preview-dialog';

describe('PreviewDialogComponent', () => {
  let component: PreviewDialogComponent;
  let fixture: ComponentFixture<PreviewDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PreviewDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PreviewDialogComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('model', {});
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

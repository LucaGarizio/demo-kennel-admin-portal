import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreviewDialog } from './preview-dialog';

describe('PreviewDialog', () => {
  let component: PreviewDialog;
  let fixture: ComponentFixture<PreviewDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PreviewDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PreviewDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { SignaturePage } from './signature-page';

describe('SignaturePage', () => {
  let component: SignaturePage;
  let fixture: ComponentFixture<SignaturePage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SignaturePage],
      providers: [provideRouter([])]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SignaturePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

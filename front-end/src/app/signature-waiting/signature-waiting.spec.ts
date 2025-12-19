import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SignatureWaiting } from './signature-waiting';

describe('SignatureWaiting', () => {
  let component: SignatureWaiting;
  let fixture: ComponentFixture<SignatureWaiting>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SignatureWaiting]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SignatureWaiting);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

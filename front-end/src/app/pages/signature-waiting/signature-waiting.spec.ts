import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';

import { SignatureWaiting } from './signature-waiting';

import { MessageService } from 'primeng/api';

describe('SignatureWaiting', () => {
  let component: SignatureWaiting;
  let fixture: ComponentFixture<SignatureWaiting>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SignatureWaiting],
      providers: [provideHttpClient(), provideRouter([]), MessageService]
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

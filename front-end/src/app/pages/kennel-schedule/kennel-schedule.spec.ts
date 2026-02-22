import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KennelScheduleComponent } from './kennel-schedule';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';

import { MessageService } from 'primeng/api';

describe('KennelScheduleComponent', () => {
  let component: KennelScheduleComponent;
  let fixture: ComponentFixture<KennelScheduleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KennelScheduleComponent],
      providers: [provideHttpClient(), provideRouter([]), MessageService]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KennelScheduleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

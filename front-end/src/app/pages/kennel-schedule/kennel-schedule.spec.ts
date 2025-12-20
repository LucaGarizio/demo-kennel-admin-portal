import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KennelSchedule } from './kennel-schedule';

describe('KennelSchedule', () => {
  let component: KennelSchedule;
  let fixture: ComponentFixture<KennelSchedule>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KennelSchedule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KennelSchedule);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

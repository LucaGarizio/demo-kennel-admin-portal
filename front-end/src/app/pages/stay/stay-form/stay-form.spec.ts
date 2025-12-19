import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StayForm } from './stay-form';

describe('StayForm', () => {
  let component: StayForm;
  let fixture: ComponentFixture<StayForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StayForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StayForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

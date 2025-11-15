import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StayCreate } from './stay-create';

describe('StayCreate', () => {
  let component: StayCreate;
  let fixture: ComponentFixture<StayCreate>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StayCreate]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StayCreate);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

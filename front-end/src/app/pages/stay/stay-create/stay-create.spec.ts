import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StayCreateComponent } from './stay-create';

describe('StayCreateComponent', () => {
  let component: StayCreateComponent;
  let fixture: ComponentFixture<StayCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StayCreateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StayCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

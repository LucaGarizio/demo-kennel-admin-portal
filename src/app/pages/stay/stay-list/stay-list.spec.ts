import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StayList } from './stay-list';

describe('StayList', () => {
  let component: StayList;
  let fixture: ComponentFixture<StayList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StayList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StayList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

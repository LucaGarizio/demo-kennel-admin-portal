import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Owner } from './owner';

describe('Owner', () => {
  let component: Owner;
  let fixture: ComponentFixture<Owner>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Owner]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Owner);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

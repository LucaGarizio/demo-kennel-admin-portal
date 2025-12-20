import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DogsForm } from './dogs-form';

describe('DogsForm', () => {
  let component: DogsForm;
  let fixture: ComponentFixture<DogsForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DogsForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DogsForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

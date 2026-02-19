import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DogsFormComponent } from './dogs-form';

describe('DogsFormComponent', () => {
  let component: DogsFormComponent;
  let fixture: ComponentFixture<DogsFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DogsFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DogsFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

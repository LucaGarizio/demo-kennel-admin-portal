import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OwnerCreate } from './owner-create';

describe('OwnerCreate', () => {
  let component: OwnerCreate;
  let fixture: ComponentFixture<OwnerCreate>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OwnerCreate]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OwnerCreate);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

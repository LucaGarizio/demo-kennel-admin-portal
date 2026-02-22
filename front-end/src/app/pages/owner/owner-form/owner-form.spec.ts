import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OwnerFormComponent } from './owner-form';

import { MessageService } from 'primeng/api';

describe('OwnerFormComponent', () => {
  let component: OwnerFormComponent;
  let fixture: ComponentFixture<OwnerFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OwnerFormComponent],
      providers: [MessageService]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OwnerFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

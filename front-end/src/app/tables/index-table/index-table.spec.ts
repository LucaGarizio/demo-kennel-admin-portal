import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IndexTableComponent } from './index-table';

describe('IndexTableComponent', () => {
  let component: IndexTableComponent;
  let fixture: ComponentFixture<IndexTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IndexTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IndexTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

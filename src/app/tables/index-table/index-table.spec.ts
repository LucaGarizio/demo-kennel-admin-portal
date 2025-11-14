import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IndexTable } from './index-table';

describe('IndexTable', () => {
  let component: IndexTable;
  let fixture: ComponentFixture<IndexTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IndexTable]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IndexTable);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

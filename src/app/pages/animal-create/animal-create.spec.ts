import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AnimalCreateComponent } from './animal-create';

describe('AnimalCreateComponent', () => {
  let component: AnimalCreateComponent;
  let fixture: ComponentFixture<AnimalCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnimalCreateComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AnimalCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

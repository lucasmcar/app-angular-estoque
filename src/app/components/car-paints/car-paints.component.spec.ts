import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CarPaintsComponent } from './car-paints.component';

describe('CarPaintsComponent', () => {
  let component: CarPaintsComponent;
  let fixture: ComponentFixture<CarPaintsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CarPaintsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CarPaintsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

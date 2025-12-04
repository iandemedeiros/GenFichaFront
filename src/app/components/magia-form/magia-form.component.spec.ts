import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MagiaFormComponent } from './magia-form.component';

describe('MagiaFormComponent', () => {
  let component: MagiaFormComponent;
  let fixture: ComponentFixture<MagiaFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MagiaFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MagiaFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MagiaListComponent } from './magia-list.component';

describe('MagiaListComponent', () => {
  let component: MagiaListComponent;
  let fixture: ComponentFixture<MagiaListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MagiaListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MagiaListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

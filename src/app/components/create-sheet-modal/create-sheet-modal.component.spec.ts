import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateSheetModalComponent } from './create-sheet-modal.component';

describe('CreateSheetModalComponent', () => {
  let component: CreateSheetModalComponent;
  let fixture: ComponentFixture<CreateSheetModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateSheetModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateSheetModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

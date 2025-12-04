import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HabilidadeListComponent } from './habilidade-list.component';

describe('HabilidadeListComponent', () => {
  let component: HabilidadeListComponent;
  let fixture: ComponentFixture<HabilidadeListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HabilidadeListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HabilidadeListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

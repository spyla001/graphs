import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SunBurstComponent } from './sun-burst.component';

describe('SunBurstComponent', () => {
  let component: SunBurstComponent;
  let fixture: ComponentFixture<SunBurstComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SunBurstComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SunBurstComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

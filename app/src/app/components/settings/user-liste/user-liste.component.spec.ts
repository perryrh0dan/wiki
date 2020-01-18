import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserListeComponent } from './user-liste.component';

describe('UserListeComponent', () => {
  let component: UserListeComponent;
  let fixture: ComponentFixture<UserListeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserListeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserListeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private darkThemeSubject: BehaviorSubject<boolean>;
  public isDarkTheme: Observable<boolean>;

  public constructor() {
    this.darkThemeSubject = new BehaviorSubject<boolean>(false);
    this.isDarkTheme = this.darkThemeSubject.asObservable();
  }

  public setDarkTheme(isDarkTheme: boolean): void {
    this.darkThemeSubject.next(isDarkTheme);
  }

  public toggleTheme(): void {
    this.darkThemeSubject.next(!this.darkThemeSubject.value);
  }
}

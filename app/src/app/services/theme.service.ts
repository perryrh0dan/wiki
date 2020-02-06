import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { AuthenticationService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private darkThemeSubject: BehaviorSubject<boolean>;
  public isDarkTheme: Observable<boolean>;

  public constructor(
    private authService: AuthenticationService,
  ) {
    this.darkThemeSubject = new BehaviorSubject<boolean>(false);
    this.isDarkTheme = this.darkThemeSubject.asObservable();

    this.authService.currentUser.subscribe((x) => {
      this.darkThemeSubject.next(x.settings ? x.settings.darkTheme : {})
    })
  }

  private setDarkTheme(isDarkTheme: boolean): void {
    this.darkThemeSubject.next(isDarkTheme);
    this.authService.updateSettings('darkTheme', isDarkTheme).subscribe(() => { })
  }

  public toggleTheme(): void {
    this.setDarkTheme(!this.darkThemeSubject.value)
  }
}

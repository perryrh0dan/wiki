import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { AuthenticationService } from './auth.service';
import { ProfileService } from './profile.service';
import { User } from '../models/user';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private settings: any;

  private darkThemeSubject: BehaviorSubject<boolean>;
  public isDarkTheme: Observable<boolean>;

  public constructor(
    private authService: AuthenticationService,
    private profileService: ProfileService,
  ) {
    this.darkThemeSubject = new BehaviorSubject<boolean>(false);
    this.isDarkTheme = this.darkThemeSubject.asObservable();

    this.authService.currentUser.subscribe((x) => {
      this.settings = x.settings ? x.settings : {}
      this.setDarkTheme(this.settings.darkTheme)
    })
  }

  private setDarkTheme(isDarkTheme: boolean): void {
    this.profileService.updateSettings(this.settings, 'darkTheme', isDarkTheme).subscribe(() => {
      this.darkThemeSubject.next(isDarkTheme);
    })
  }

  public toggleTheme(): void {
    this.setDarkTheme(!this.darkThemeSubject.value)
  }
}

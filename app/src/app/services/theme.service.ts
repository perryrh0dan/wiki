import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { AuthenticationService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class ThemeService implements OnDestroy {
  private userSubscription: Subscription;
  private darkThemeSubject: BehaviorSubject<boolean>;
  public isDarkTheme: Observable<boolean>;

  public constructor(
    private authService: AuthenticationService,
  ) {
    this.darkThemeSubject = new BehaviorSubject<boolean>(false);
    this.isDarkTheme = this.darkThemeSubject.asObservable();

    this.userSubscription = this.authService.currentUser.subscribe((user) => {
      if (user) {
        this.darkThemeSubject.next(user.settings ? user.settings.darkTheme : {})
      }
    })
  }

  public ngOnDestroy() {
    this.userSubscription.unsubscribe()
  }

  private setDarkTheme(isDarkTheme: boolean): void {
    this.darkThemeSubject.next(isDarkTheme);
    this.authService.updateSettings('darkTheme', isDarkTheme).subscribe(() => { })
  }

  public toggleTheme(): void {
    this.setDarkTheme(!this.darkThemeSubject.value)
  }
}

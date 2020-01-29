import { Component, OnInit, OnDestroy } from '@angular/core';

import { AuthenticationService } from './services/auth.service';
import { SidebarService } from './services/sidebar.service';
import { SiteService, sites } from './services/site.service';

import { trigger, transition, style, animate } from '@angular/animations';
import { Subscription } from 'rxjs';
import { buttonEnterAnimation } from './animations/button.animation';

import { faBars, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { User } from './models/user';
import { ThemeService } from './services/theme.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  animations: [
    trigger('blurEnterAnimation', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('250ms', style({ opacity: 1 })),
      ]),
      transition(':leave', [
        style({ opacity: 1 }),
        animate('250ms', style({ opacity: 0 })),
      ]),
    ]),
    buttonEnterAnimation,
  ],
})
export class AppComponent implements OnInit, OnDestroy {
  public faBars: IconDefinition = faBars;

  private blurVisibleSubscription: Subscription
  private sidebarStateSubscription: Subscription
  private siteStateSubscription: Subscription
  private themeSubscription: Subscription

  public user: User;
  public isDarkTheme: boolean = false;
  public sitesStatus: typeof sites = sites;
  public blurVisible: boolean;
  public sidebarState: string;
  public state: sites;

  public constructor(
    private authenticationService: AuthenticationService,
    private sidebarService: SidebarService,
    private siteService: SiteService,
    private themeService: ThemeService,
  ) { }

  public ngOnInit(): void {
    this.authenticationService.currentUser.subscribe(user => this.user = user);
    this.siteStateSubscription = this.siteService.state.subscribe(state => {
      this.state = state;
    });
    this.sidebarStateSubscription = this.sidebarService.state.subscribe(state => this.sidebarState = state.toString());
    this.blurVisibleSubscription = this.sidebarService.blurVisible.subscribe(blur => this.blurVisible = blur);
    this.themeSubscription = this.themeService.isDarkTheme.subscribe(dark => this.isDarkTheme = dark);
  }

  public ngOnDestroy(): void {
    this.blurVisibleSubscription.unsubscribe();
    this.sidebarStateSubscription.unsubscribe();
    this.siteStateSubscription.unsubscribe();
    this.themeSubscription.unsubscribe();
  }

  public closeSidebar(): void {
    this.sidebarService.closeSidebar();
  }

  public openSidebar(): void {
    this.sidebarService.openSidebar();
  }
}

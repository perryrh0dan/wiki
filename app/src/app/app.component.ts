import { Component, OnInit, OnDestroy } from '@angular/core';

import { AuthenticationService } from './services/auth.service'
import { SidebarService } from './services/sidebar.service';
import { SiteService, sites } from './services/site.service';

import { trigger, transition, style, animate } from '@angular/animations';
import { Subscription } from 'rxjs';
import { buttonEnterAnimation } from './animations/button.animation';

import { faBars } from '@fortawesome/free-solid-svg-icons'
import { User } from './models/user';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less'],
  animations: [
    trigger('blurEnterAnimation', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('250ms', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        style({ opacity: 1 }),
        animate('250ms', style({ opacity: 0 }))
      ])
    ]),
    buttonEnterAnimation
  ]
})
export class AppComponent implements OnInit, OnDestroy {
  faBars = faBars

  private _blurVisibleSubscription: Subscription
  private _sidebarStateSubscription: Subscription
  private _siteStateSubscription: Subscription

  user: User;
  wasInside: Boolean;
  sidebarVisible: Boolean = false;
  sitesStatus: typeof sites = sites;
  blurVisible: Boolean;
  sidebarState: string;
  public state: sites;

  constructor(
    private authenticationService: AuthenticationService,
    private sidebarService: SidebarService,
    private siteService: SiteService
  ) { }

  ngOnInit() {
    this.authenticationService.currentUser.subscribe(user => this.user = user)
    this._siteStateSubscription = this.siteService.state.subscribe(state => {
      this.state = state
    })
    this._sidebarStateSubscription = this.sidebarService.state.subscribe(state => this.sidebarState = state.toString())
    this._blurVisibleSubscription = this.sidebarService.blurVisible.subscribe(blur => this.blurVisible = blur);
  }

  ngOnDestroy() {
    this._blurVisibleSubscription.unsubscribe();
    this._sidebarStateSubscription.unsubscribe();
    this._siteStateSubscription.unsubscribe();
  }

  closeSidebar() {
    this.sidebarService.closeSidebar();
  }

  openSidebar() {
    this.sidebarService.openSidebar()
  }
}

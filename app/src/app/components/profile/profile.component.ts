import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthenticationService } from 'src/app/services/auth.service';
import { ProfileService } from 'src/app/services/profile.service';
import { User } from 'src/app/models/user';
import { sites, SiteService } from 'src/app/services/site.service';
import { Subscription } from 'rxjs';

import { faUser } from '@fortawesome/free-solid-svg-icons'
import { NotificationService } from 'src/app/services/notification.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.less']
})
export class ProfileComponent implements OnInit, OnDestroy {
  faUser = faUser

  private userSubscription: Subscription
  public user = new User()
  public password = ""
  public repPassword = ""

  constructor(
    private authService: AuthenticationService,
    private siteService: SiteService,
    private profileService: ProfileService,
    private notificationService: NotificationService
  ) {
    this.siteService.setState(sites.profile)
  }

  ngOnInit() {
    this.userSubscription = this.authService.currentUser.subscribe(data => {
      this.user = data
    })
  }

  ngOnDestroy() {
    this.userSubscription.unsubscribe();
  }

  public save(): void {
    if (this.password) {
      if (this.password !== this.repPassword) {
        this.profileService.change(this.user.name, this.password).subscribe(() => {
          this.notificationService.success('Saved successful', '')
          this.authService.reloadUser()
        })
      } else {
        this.notificationService.error('Password does not match', '')
      }
    } else {
      this.profileService.change(this.user.name).subscribe(() => {
        this.notificationService.success('Saved successful', '')
        this.authService.reloadUser()
      })
    }
  }

  public cancel(): void {

  }
}

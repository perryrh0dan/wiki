import { Component, OnInit, HostListener, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { AuthenticationService } from 'src/app/services/auth.service';
import { NotificationService } from 'src/app/services/notification.service';
import { SiteService, sites } from 'src/app/services/site.service';
import { Subscription } from 'rxjs';

import { publicKeyCredentialToJSON, preformatGetAssertReq } from 'src/app/helper/webauthn';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.less']
})
export class LoginComponent implements OnInit, OnDestroy {
  private subscription: Subscription

  email: string;
  password: string;

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private authService: AuthenticationService,
    private notifyService: NotificationService,
    private siteService: SiteService
  ) {
    this.siteService.setState(sites.login)
  }

  ngOnInit() {
    this.subscription = this.authService.currentUser.subscribe(user => {
      if (user) {
        this.router.navigate(['home'])
      }
    })
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  login() {
    let returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    this.authService.login(this.email, this.password).subscribe(
      data => {
        this.router.navigate([returnUrl]);
      },
      error => {
        this.notifyService.error("Wrong credentials", "")
      },
    )
  }

  webauthnLogin() {
    let returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    this.authService.webauthnLogin(this.email).subscribe(response => {
      const publicKey = preformatGetAssertReq(response);
      return navigator.credentials.get({ publicKey }).then(response => {
        let getAssertionResponse = publicKeyCredentialToJSON(response);
        this.authService.webauthnLoginResponse(getAssertionResponse).subscribe((response: any) => {
          if (response.email !== undefined) {
            this.router.navigate([returnUrl]);
          } else {
            this.notifyService.error("Wrong credentials", "")
          }
        })
      },
        error => {
          this.notifyService.error(error, '')
        })
    },
      error => {
        this.notifyService.error(error, '')
      })
  }

  @HostListener('keydown', ['$event'])
  public onKeyDown(e) {
    if (e.key === 'Enter') {
      e.preventDefault()
      this.login()
    }
  }
}

/// <reference types="@types/webappsec-credential-management" />

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { AdminService } from 'src/app/services/admin.service';
import { User } from 'src/app/models/user';
import { Role } from 'src/app/models/role';
import { NotificationService } from 'src/app/services/notification.service';
import { LoadingService } from 'src/app/services/loading.service';
import { SiteService, sites } from 'src/app/services/site.service';
import { AuthenticationService } from 'src/app/services/auth.service';

import { publicKeyCredentialToJSON, preformatMakeCredReq } from 'src/app/helper/webauthn';

import { faUser, faPlusSquare, faMinusCircle } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss'],
})
export class UserComponent implements OnInit {
  faUser = faUser
  faPlusSquare = faPlusSquare
  faMinusCircle = faMinusCircle

  user: User
  roles: Role[]

  constructor(
    private activatedRoute: ActivatedRoute,
    private adminService: AdminService,
    private router: Router,
    private notifyService: NotificationService,
    private loadingService: LoadingService,
    private siteService: SiteService,
    private authService: AuthenticationService,
  ) {
    this.siteService.setState(sites.settings);
  }

  ngOnInit() {
    this.activatedRoute.params.subscribe(params => {
      this.adminService.getUser(params.id).subscribe(
        data => {
          this.user = data;
        },
        error => {
          this.router.navigate(['settings/users']);
        },
      );
    });
    this.adminService.getRoles().subscribe(data => this.roles = data);
  }

  reloadUser() {
    this.adminService.getUser(this.user._id).subscribe(
      data => {
        this.user = data;
      },
      error => {
        this.router.navigate(['settings/users']);
      },
    );
  }

  addRoleRow() {
    this.user.roles.push(this.roles[0]._id);
  }

  removeRoleRow(i) {
    this.user.roles.splice(i, 1);
  }

  removeAuthenticator(authenticator) {
    this.loadingService.start();
    this.authService.webauthnUnregister(this.user._id, authenticator.credID).subscribe(
      result => {
        this.loadingService.stop();
        this.notifyService.success('Successfull deleted authenticator', '');
        this.reloadUser();
      },
      error => {
        this.loadingService.stop();
        this.notifyService.error(error, '');
      });
  }

  save() {
    this.loadingService.start();
    this.adminService.editUser(this.user).subscribe(() => {
      this.loadingService.stop();
      this.notifyService.success('User was updated successfull', '');
    }, error => {
      this.loadingService.stop();
      this.notifyService.error(error, '');
    });
  }

  cancel() {
    this.router.navigate(['settings/users']);
  }

  delete() {
    this.loadingService.start();
    this.adminService.deleteUser(this.user._id).subscribe(() => {
      this.loadingService.stop();
      this.notifyService.success('User was deleted successfull', '');
      this.router.navigate(['settings/users']);
    }, error => {
      this.loadingService.stop();
      this.notifyService.error(error, '');
    });
  }

  async webauthnRegister() {
    this.loadingService.start();
    this.authService.webauthnRegister(this.user._id).subscribe(response => {
      let publicKey = preformatMakeCredReq(response);
      this.loadingService.stop();
      return navigator.credentials.create({ publicKey }).then(response => {
        const makeCredResponse = publicKeyCredentialToJSON(response);
        this.loadingService.start();
        return this.authService.webauthnRegisterResponse(makeCredResponse).subscribe(
          (response: any) => {
            this.notifyService.success('Successfull added a new authenticator', '');
            this.reloadUser();
            this.loadingService.stop();
          },
          error => {
            this.notifyService.error('An Error occured', '');
            this.loadingService.stop();
          });
      }).catch(error => {
        console.log(error);
      });
    });
  }
}

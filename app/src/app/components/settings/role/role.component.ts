import { Component, OnInit } from '@angular/core';
import { AdminService } from 'src/app/services/admin.service';
import { ActivatedRoute, Router } from '@angular/router';

import { Role } from 'src/app/models/role';
import { NotificationService } from 'src/app/services/notification.service';
import { LoadingService } from 'src/app/services/loading.service';
import { SiteService, sites } from 'src/app/services/site.service';

import { faLock, faPlusSquare, faMinusCircle } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-role',
  templateUrl: './role.component.html',
  styleUrls: ['./role.component.less'],
})
export class RoleComponent implements OnInit {
  faLock = faLock
  faPlusSquare = faPlusSquare
  faMinusCircle = faMinusCircle

  public role: Role
  public permissionsOpt = [{
    value: 'read',
    display: 'Read Only',
  }, {
    value: 'write',
    display: 'Read and Write',
  }, {
    value: 'admin',
    display: 'Admin',
  }]

  public pathOpt = [{
    value: true,
    display: 'Path match exactly',
  }, {
    value: false,
    display: 'Path starts with',
  }]

  public accessOpt = [{
    value: false,
    display: 'Allow',
  },
  {
    value: true,
    display: 'Deny',
  }]

  constructor(
    private activatedRoute: ActivatedRoute,
    private adminService: AdminService,
    private router: Router,
    private notifyService: NotificationService,
    private loadingService: LoadingService,
    private siteService: SiteService,
  ) { 
    this.siteService.setState(sites.settings);
  }

  ngOnInit() {
    this.activatedRoute.params.subscribe(params => {
      this.adminService.getRole(params.id).subscribe(
        data => {
          this.role = data;
        },
        error => {
          this.router.navigate(['settings/roles']);
        },
      );
    });
  }

  addRightsRow() {
    this.role.rights.push({
      role: 'write',
      path: '/',
      exact: false,
      deny: false,
    });
  }

  removeRightsRow(i) {
    this.role.rights.splice(i, 1);
  }

  cancel() {
    this.router.navigate(['settings/roles']);
  }

  save() {
    this.adminService.editRole(this.role).subscribe(
      () => {
        this.notifyService.success('Role saved successfull', '');
      },
      error => {
        this.notifyService.error('An error occured while saving', '');
      });
  }

  delete() {
    this.loadingService.start();
    this.adminService.deleteRole(this.role._id).subscribe(
      () => {
        this.loadingService.stop();
        this.notifyService.success('Role was deleted successfull', '');
        this.router.navigate(['settings/roles']);
      },
      error => {
        this.notifyService.error('An error occured while deleting', '');
      });
  }
}

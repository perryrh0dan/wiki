import { Component, OnInit } from '@angular/core';
import { AdminService } from 'src/app/services/admin.service';

import { Role } from 'src/app/models/role';
import { Router } from '@angular/router';
import { SiteService, sites } from 'src/app/services/site.service';

import { faLock } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-role-list',
  templateUrl: './role-list.component.html',
  styleUrls: ['./role-list.component.less'],
})
export class RoleListComponent implements OnInit {
  faLock = faLock

  roles: Role[]

  constructor(
    private adminService: AdminService,
    private router: Router,
    private siteService: SiteService,
  ) { 
    this.siteService.setState(sites.roles);
  }

  ngOnInit() {
    this.adminService.getRoles().subscribe(data => this.roles = data);
  }

  select(id) {
    this.router.navigate(['settings/roles', id]);
  }
}

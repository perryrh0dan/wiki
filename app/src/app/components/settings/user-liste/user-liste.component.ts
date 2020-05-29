import { Component, OnInit } from '@angular/core';
import { AdminService } from 'src/app/services/admin.service';
import { Router } from '@angular/router';
import { User } from 'src/app/models/user';
import { SiteService, sites } from 'src/app/services/site.service';

import { faUsers, faUser } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'user-liste',
  templateUrl: './user-liste.component.html',
  styleUrls: ['./user-liste.component.less'],
})
export class UserListeComponent implements OnInit {
  faUsers = faUsers
  faUser = faUser

  users: User[]
  roles: Array<any>

  constructor(
    private adminService: AdminService,
    private router: Router,
    private siteService: SiteService,
  ) {
    this.siteService.setState(sites.users);
  }

  ngOnInit() {
    this.adminService.getUsers().subscribe(data => this.users = data);
    this.adminService.getRoles().subscribe(data =>this.roles = data);
  }

  getUserRoles(user: User) {
    let roles: Array<string> = new Array<string>();
    user.roles.forEach(uRole => {
      roles.push(this.roles.find(x => x._id === uRole).name);
    });

    return roles.join(',');
  }

  select(id) {
    this.router.navigate(['settings/users', id]);
  }
}

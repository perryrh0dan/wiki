import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialogRef } from '@angular/material/dialog';

import { AdminService } from 'src/app/services/admin.service';
import { User } from 'src/app/models/user';
import { NotificationService } from 'src/app/services/notification.service';

@Component({
  selector: 'app-user-create',
  templateUrl: './user-create.component.html',
  styleUrls: ['./user-create.component.less']
})
export class UserCreateComponent implements OnInit {
  user = new User()

  constructor(
    public dialogRef: MatDialogRef<UserCreateComponent>,
    private adminService: AdminService,
    private router: Router,
    private notifyService: NotificationService
  ) { }

  ngOnInit() {
  }

  create() {
    this.adminService.createUser(this.user).subscribe(
    user => {
      this.dialogRef.close()
      this.router.navigate(['settings/users', user._id])
    },
    error => {
      this.notifyService.error(error, '')
    })
  }

  cancel() {
    this.dialogRef.close()
  }
}

import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';

import { AdminService } from 'src/app/services/admin.service';
import { NotificationService } from 'src/app/services/notification.service';

@Component({
  selector: 'app-role-create',
  templateUrl: './role-create.component.html',
  styleUrls: ['./role-create.component.less']
})
export class RoleCreateComponent implements OnInit {
  name = ''

  constructor(
    public dialogRef: MatDialogRef<RoleCreateComponent>,
    private adminService: AdminService,
    private router: Router,
    private notifyService: NotificationService
  ) { }

  ngOnInit() {
  }

  create() {
    this.adminService.createRole(this.name).subscribe(res => {
      this.dialogRef.close()
      this.router.navigate(['settings/roles', res._id])
    },
    error => {
      this.notifyService.error(error, '')
    })
  }

  cancel() {
    this.dialogRef.close()
  }
}

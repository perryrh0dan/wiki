import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';

import { AdminService } from 'src/app/services/admin.service';
import { NotificationService } from 'src/app/services/notification.service';
import { ThemeService } from 'src/app/services/theme.service';
import { OverlayContainer } from '@angular/cdk/overlay';

@Component({
  selector: 'role-create',
  templateUrl: './role-create.component.html',
  styleUrls: ['./role-create.component.scss'],
})
export class RoleCreateComponent {
  name = ''

  constructor(
    public dialogRef: MatDialogRef<RoleCreateComponent>,
    private adminService: AdminService,
    private router: Router,
    private notifyService: NotificationService,
    private overlayContainer: OverlayContainer,
    private themeService: ThemeService
    ) {
    this.themeService.isDarkTheme.subscribe((x: boolean) => {
      this.setTheme(x ? 'dark-theme' : 'default-theme');
    });
  }

  private setTheme(theme: string = 'default-theme'): void {
    this.overlayContainer.getContainerElement().classList.add(theme);
  }

  create() {
    this.adminService.createRole(this.name).subscribe(res => {
      this.dialogRef.close();
      this.router.navigate(['settings/roles', res._id]);
    },
    error => {
      this.notifyService.error(error, '');
    });
  }

  cancel() {
    this.dialogRef.close();
  }
}

import { Component } from "@angular/core";
import { Router } from "@angular/router";
import { MatDialogRef } from "@angular/material/dialog";

import { AdminService } from "src/app/services/admin.service";
import { User } from "src/app/models/user";
import { NotificationService } from "src/app/services/notification.service";
import { ThemeService } from "src/app/services/theme.service";
import { OverlayContainer } from '@angular/cdk/overlay';

@Component({
  selector: "user-create",
  templateUrl: "./user-create.component.html",
  styleUrls: ["./user-create.component.scss"]
})
export class UserCreateComponent{
  user = new User();

  constructor(
    public dialogRef: MatDialogRef<UserCreateComponent>,
    private adminService: AdminService,
    private router: Router,
    private notifyService: NotificationService,
    private overlayContainer: OverlayContainer,
    private themeService: ThemeService
  ) {
    this.themeService.isDarkTheme.subscribe((x: boolean) => {
      this.setTheme(x ? "dark-theme" : "default-theme");
    });
  }

  private setTheme(theme: string = "default-theme"): void {
    this.overlayContainer.getContainerElement().classList.add(theme);
  }

  create() {
    this.adminService.createUser(this.user).subscribe(
      user => {
        this.dialogRef.close();
        this.router.navigate(["settings/users", user._id]);
      },
      error => {
        this.notifyService.error(error, "");
      }
    );
  }

  cancel() {
    this.dialogRef.close();
  }
}

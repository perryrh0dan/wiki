import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  options = {
    timeOut: 3000,
    tapToDismiss: true,
    fadeOut: 10,
    positionClass: "toast-top-right"
  };

  constructor(
    private toastr: ToastrService
  ) { }

  success(message, title) {
    this.toastr.success(message, title, this.options)
  }

  error(message, title) {
    this.toastr.error(message, title)
  }
}

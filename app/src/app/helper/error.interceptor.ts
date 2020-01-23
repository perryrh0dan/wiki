import { Injectable } from "@angular/core";
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http'
import { AuthenticationService } from '../services/auth.service';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { NotificationService } from '../services/notification.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(
    private authenticationService: AuthenticationService,
    private router: Router,
    private notificationService: NotificationService
  ) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(catchError(err => {
      if (err.status === 401) {
        this.authenticationService.logout(true)
        this.router.navigate(['login'])
        this.notificationService.error('Not authenticated', '');
      } else if (403) {
        // Replacing the wrong route so back navigation is working
        this.router.navigate(['home'], { replaceUrl: true })
        this.notificationService.error('Not authorized', '')
      } else if (err.status == 404) {
        // Replacing the wrong route so back navigation is working
        this.router.navigate(['home'], { replaceUrl: true })
        this.notificationService.error('Not found', '')
      }

      const error = err.error ? err.error.msg : err.message || err.statusText;
      return throwError(error);
    }))
  }
}

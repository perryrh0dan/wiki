import { Injectable } from "@angular/core";
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http'
import { AuthenticationService } from '../services/auth.service';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(
    private authenticationService: AuthenticationService,
    private router: Router
  ) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(catchError(err => {
      if (err.status === 401) {
        this.authenticationService.logout(true)
        this.router.navigate(['login'])
        return throwError(new Error('Not authenticated'))
      } else if (403) {
        // Replacing the wrong route so back navigation is working
        this.router.navigate(['home'], { replaceUrl: true })
        return throwError(new Error('Not auhtorized'))
      } else if (err.status == 404) {
        // Replacing the wrong route so back navigation is working
        this.router.navigate(['home'], { replaceUrl: true })
        return throwError(new Error('Not found'))
      } else {
        const error = err.error ? err.error.msg : err.message || err.statusText;
        return throwError(error);
      }
    }))
  }
}

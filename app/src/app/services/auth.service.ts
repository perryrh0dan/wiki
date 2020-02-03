import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import find from 'lodash.find';

import { APP_CONFIG, AppConfig } from '../app-config.module';
import { User } from '../models/user';
import { Socket } from 'ngx-socket-io';
import { MasterRole } from '../models/masterrole';

@Injectable({ providedIn: 'root' })
export class AuthenticationService {
  private userupdate = this.socket.fromEvent<Document>('updateuser');
  private currentUserSubject: BehaviorSubject<User>;
  public currentUser: Observable<User>;

  public constructor(
    @Inject(APP_CONFIG) private config: AppConfig,
    private http: HttpClient,
    private socket: Socket,
  ) {
    this.currentUserSubject = new BehaviorSubject<User>(JSON.parse(localStorage.getItem('currentUser')));
    this.currentUser = this.currentUserSubject.asObservable();
    this.userupdate.subscribe(() => {
      this.reloadUser();
    });
  }

  public get currentUserValue(): User {
    return this.currentUserSubject.value;
  }

  public login(email: string, password: string) {
    return this.http.post<User>(`${this.config.apiEndpoint}/auth/login`, { email, password })
      .pipe(map(user => {
        if (user) {
          user.masterrole = this.getMasterRole(user);
          localStorage.setItem('currentUser', JSON.stringify(user));
          this.currentUserSubject.next(user);
        }
        return user;
      }));
  }

  public logout(client: boolean = false): Observable<void> {
    if (!client) {
      return this.http.post(`${this.config.apiEndpoint}/auth/logout`, null).pipe(map(() => {
        this.currentUserSubject.next(null);
        localStorage.removeItem('currentUser');
      }));
    } else {
      this.currentUserSubject.next(null);
      localStorage.removeItem('currentUser');
    }
  }

  public getRole() {
    if (this.currentUserSubject.value) return this.currentUserSubject.value.masterrole;
  }

  public reloadUser(): void {
    this.http.get<User>(`${this.config.apiEndpoint}/auth/profile`).subscribe(user => {
      if (user) {
        user.masterrole = this.getMasterRole(user);
        localStorage.setItem('currentUser', JSON.stringify(user));
        this.currentUserSubject.next(user);
      }
    });
  }

  public getMasterRole(user): string {
    let rights = [{}];
    user.roles.forEach(role => {
      rights = rights.concat(role.rights);
    });
    if (find(rights, {
      role: 'admin',
    })) {
      return MasterRole.Admin;
    }
    return MasterRole.User;
  }

  public updateSettings(key: string, value: any) {
    const updatedUser = this.currentUserValue.settings
    updatedUser.settings[key] = value
    return this.http.post(`${this.config.apiEndpoint}/profile/settings`, updatedUser.settings).pipe(map(() => {
      localStorage.setItem('currentUser', updatedUser)
    }));
  }

  public webauthnLogin(username: string): Observable<any> {
    return this.http.post<any>(`${this.config.apiEndpoint}/auth/webauthn/login`, { username: username });
  }

  public webauthnRegister(userID: string): Observable<any> {
    return this.http.post<any>(`${this.config.apiEndpoint}/admin/users/authenticator/register`, { userID: userID });
  }

  public webauthnRegisterResponse(body) {
    return this.http.post(`${this.config.apiEndpoint}/admin/users/authenticator/response`, body);
  }

  public webauthnLoginResponse(body) {
    return this.http.post<User>(`${this.config.apiEndpoint}/auth/webauthn/response`, body)
      .pipe(map(user => {
        if (user) {
          user.masterrole = this.getMasterRole(user);
          localStorage.setItem('currentUser', JSON.stringify(user));
          this.currentUserSubject.next(user);
        }
        return user;
      }));
  }

  public webauthnUnregister(userID, credID) {
    return this.http.post<any>(`${this.config.apiEndpoint}/admin/users/authenticator/unregister`, { userID: userID, credID: credID });
  }
}

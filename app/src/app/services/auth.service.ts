import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import * as _ from "lodash";

import { APP_CONFIG, AppConfig } from '../app-config.module';
import { User } from '../models/user';
import { Socket } from 'ngx-socket-io';
import { MasterRole } from '../models/masterrole';

@Injectable({ providedIn: 'root' })
export class AuthenticationService {
  userupdate = this.socket.fromEvent<Document>('updateuser');
  private currentUserSubject: BehaviorSubject<User>;
  public currentUser: Observable<User>;

  constructor(
    @Inject(APP_CONFIG) private config: AppConfig,
    private http: HttpClient,
    private socket: Socket
  ) {
    this.currentUserSubject = new BehaviorSubject<User>(JSON.parse(localStorage.getItem('currentUser')))
    this.currentUser = this.currentUserSubject.asObservable()
    this.userupdate.subscribe(() => {
      this.reloadUser()
    })
  }

  public get currentUserValue(): User {
    return this.currentUserSubject.value
  }

  login(email: string, password: string) {
    return this.http.post<User>(`${this.config.apiEndpoint}/auth/login`, { email, password })
      .pipe(map(user => {
        if (user) {
          user.masterrole = this.getMasterRole(user)
          localStorage.setItem('currentUser', JSON.stringify(user))
          this.currentUserSubject.next(user)
        }
        return user
      }));
  }

  logout(client: boolean = false): Observable<void> {
    if (!client) {
      return this.http.post(`${this.config.apiEndpoint}/auth/logout`, null).pipe(map(() => {
        this.currentUserSubject.next(null)
        localStorage.removeItem('currentUser')
      }))
    } else {
      this.currentUserSubject.next(null)
      localStorage.removeItem('currentUser')
    }
  }

  getRole() {
    if (this.currentUserSubject.value) return this.currentUserSubject.value.masterrole
  }

  reloadUser() {
    this.http.get<User>(`${this.config.apiEndpoint}/auth/profile`).subscribe(user => {
      if (user) {
        user.masterrole = this.getMasterRole(user)
        localStorage.setItem('currentUser', JSON.stringify(user))
        this.currentUserSubject.next(user)
      }
    })
  }

  getMasterRole(user) {
    let rights = [{}]
    user.roles.forEach(role => {
      rights = rights.concat(role.rights)
    });
    if (_.find(rights, {
      role: 'admin'
    })) {
      return MasterRole.Admin
    }
    return MasterRole.User
  }

  webauthnLogin(username) {
    return this.http.post<any>(`${this.config.apiEndpoint}/auth/webauthn/login`, { username: username })
  }

  webauthnRegister(userID) {
    return this.http.post<any>(`${this.config.apiEndpoint}/admin/users/authenticator/register`, { userID: userID })
  }

  webauthnRegisterResponse(body) {
    return this.http.post(`${this.config.apiEndpoint}/admin/users/authenticator/response`, body)
  }

  webauthnLoginResponse(body) {
    return this.http.post<User>(`${this.config.apiEndpoint}/auth/webauthn/response`, body)
      .pipe(map(user => {
        if (user) {
          user.masterrole = this.getMasterRole(user)
          localStorage.setItem('currentUser', JSON.stringify(user))
          this.currentUserSubject.next(user)
        }
        return user
      }));
  }

  webauthnUnregister(userID, credID) {
    return this.http.post<any>(`${this.config.apiEndpoint}/admin/users/authenticator/unregister`, { userID: userID, credID: credID })
  }
}

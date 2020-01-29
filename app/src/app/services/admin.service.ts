import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { APP_CONFIG, AppConfig } from '../app-config.module';
import { Role } from '../models/role';
import { User } from '../models/user';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class AdminService {

    public constructor(
        @Inject(APP_CONFIG) private config: AppConfig,
        private http: HttpClient,
    ) { }

    public getUsers(): Observable<User[]> {
        return this.http.get<User[]>(`${this.config.apiEndpoint}/admin/users`);
    }

    public getUser(id: string): Observable<User> {
        return this.http.get<User>(`${this.config.apiEndpoint}/admin/users/${id}`);
    }

    public createUser(user: any): Observable<User> {
        return this.http.post<User>(`${this.config.apiEndpoint}/admin/users`, { user });
    }

    public deleteUser(id: string): Observable<void> {
        return this.http.delete<void>(`${this.config.apiEndpoint}/admin/users/${id}`);
    }

    public editUser(user: any): Observable<void> {
        return this.http.post<void>(`${this.config.apiEndpoint}/admin/users/${user._id}`, { user });
    }

    public getRoles(): Observable<Role[]> {
        return this.http.get<Role[]>(`${this.config.apiEndpoint}/admin/roles`);
    }

    public getRole(id: string): Observable<Role> {
        return this.http.get<Role>(`${this.config.apiEndpoint}/admin/roles/${id}`);
    }

    public createRole(name: string): Observable<Role> {
        return this.http.post<Role>(`${this.config.apiEndpoint}/admin/roles`, { name: name });
    }

    public deleteRole(id: string): Observable<void> {
        return this.http.delete<void>(`${this.config.apiEndpoint}/admin/roles/${id}`);
    }

    public editRole(role: Role): Observable<void> {
        return this.http.post<void>(`${this.config.apiEndpoint}/admin/roles/${role._id}`, { role });
    }

    public getStatus(): Observable<any> {
        return this.http.get<any>(`${this.config.apiEndpoint}/admin/statistic`);
    }

    public closeAllSessions(): Observable<any> {
        return this.http.post(`${this.config.apiEndpoint}/admin/system/sessions/kill`, {});
    }

    public getSystemInfo(): Observable<any> {
        return this.http.get<any>(`${this.config.apiEndpoint}/admin/system`);
    }

    public backup(): Observable<void> {
        return this.http.post<void>(`${this.config.apiEndpoint}/admin/system/backup`, { });
    }

    public getLogs(): Observable<any> {
        return this.http.get<any>(`${this.config.apiEndpoint}/admin/logs`);
    }

    public getLog(id: string): Observable<any> {
        return this.http.get(`${this.config.apiEndpoint}/admin/logs/${id}`, { responseType: 'arraybuffer' });
    }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Role } from '../models/role';
import { User } from '../models/user';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class AdminService {
    private api_url = window["_env_"]["API_URL"];

    public constructor(
        private http: HttpClient,
    ) { }

    public getUsers(): Observable<User[]> {
        return this.http.get<User[]>(`${this.api_url}/admin/users`);
    }

    public getUser(id: string): Observable<User> {
        return this.http.get<User>(`${this.api_url}/admin/users/${id}`);
    }

    public createUser(user: any): Observable<User> {
        return this.http.post<User>(`${this.api_url}/admin/users`, { user });
    }

    public deleteUser(id: string): Observable<void> {
        return this.http.delete<void>(`${this.api_url}/admin/users/${id}`);
    }

    public editUser(user: any): Observable<void> {
        return this.http.post<void>(`${this.api_url}/admin/users/${user._id}`, { user });
    }

    public getRoles(): Observable<Role[]> {
        return this.http.get<Role[]>(`${this.api_url}/admin/roles`);
    }

    public getRole(id: string): Observable<Role> {
        return this.http.get<Role>(`${this.api_url}/admin/roles/${id}`);
    }

    public createRole(name: string): Observable<Role> {
        return this.http.post<Role>(`${this.api_url}/admin/roles`, { name: name });
    }

    public deleteRole(id: string): Observable<void> {
        return this.http.delete<void>(`${this.api_url}/admin/roles/${id}`);
    }

    public editRole(role: Role): Observable<void> {
        return this.http.post<void>(`${this.api_url}/admin/roles/${role._id}`, { role });
    }

    public getStatus(): Observable<any> {
        return this.http.get<any>(`${this.api_url}/admin/statistic`);
    }

    public closeAllSessions(): Observable<any> {
        return this.http.post(`${this.api_url}/admin/system/sessions/kill`, {});
    }

    public getSystemInfo(): Observable<any> {
        return this.http.get<any>(`${this.api_url}/admin/system`);
    }

    public backup(): Observable<void> {
        return this.http.post<void>(`${this.api_url}/admin/system/backup`, { });
    }

    public getLogs(): Observable<any> {
        return this.http.get<any>(`${this.api_url}/admin/logs`);
    }

    public getLog(id: string): Observable<any> {
        return this.http.get(`${this.api_url}/admin/logs/${id}`, { responseType: 'arraybuffer' });
    }
}

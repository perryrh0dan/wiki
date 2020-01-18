import { Injectable, Inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";

import { APP_CONFIG, AppConfig } from '../app-config.module';
import { Role } from '../models/role';
import { User } from '../models/user';

@Injectable({
    providedIn: "root"
})
export class AdminService {

    constructor(
        @Inject(APP_CONFIG) private config: AppConfig,
        private http: HttpClient
    ) { }

    getUsers() {
        return this.http.get<User[]>(`${this.config.apiEndpoint}/admin/users`)
    }

    getUser(id) {
        return this.http.get<User>(`${this.config.apiEndpoint}/admin/users/${id}`)
    }

    createUser(user) {
        return this.http.post<User>(`${this.config.apiEndpoint}/admin/users`, { user })
    }

    deleteUser(id) {
        return this.http.delete(`${this.config.apiEndpoint}/admin/users/${id}`)
    }

    editUser(user) {
        return this.http.post(`${this.config.apiEndpoint}/admin/users/${user._id}`, { user })
    }

    getRoles() {
        return this.http.get<Role[]>(`${this.config.apiEndpoint}/admin/roles`)
    }

    getRole(id) {
        return this.http.get<Role>(`${this.config.apiEndpoint}/admin/roles/${id}`)
    }

    createRole(name) {
        return this.http.post<Role>(`${this.config.apiEndpoint}/admin/roles`, { name: name })
    }

    deleteRole(id) {
        return this.http.delete(`${this.config.apiEndpoint}/admin/roles/${id}`)
    }

    editRole(role) {
        return this.http.post(`${this.config.apiEndpoint}/admin/roles/${role._id}`, { role })
    }

    getStatus() {
        return this.http.get<any>(`${this.config.apiEndpoint}/admin/statistic`)
    }

    closeAllSessions() {
        return this.http.post(`${this.config.apiEndpoint}/admin/system/sessions/kill`, {})
    }

    getSystemInfo() {
        return this.http.get<any>(`${this.config.apiEndpoint}/admin/system`)
    }

    backup() {
        return this.http.post(`${this.config.apiEndpoint}/admin/system/backup`, { })
    }

    getLogs() {
        return this.http.get<any>(`${this.config.apiEndpoint}/admin/logs`)
    }   

    getLog(id) {
        return this.http.get(`${this.config.apiEndpoint}/admin/logs/${id}`, { responseType: 'arraybuffer' })
    }
}

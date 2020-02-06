import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { APP_CONFIG, AppConfig } from '../app-config.module';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class ProfileService {

    public constructor(
        @Inject(APP_CONFIG) private config: AppConfig,
        private http: HttpClient,
    ) { }

    public change(name: string, password?: string): Observable<void> {
        return this.http.post<void>(`${this.config.apiEndpoint}/profile`, { name: name, password: password });
    }
}

import { Injectable, Inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";

import { APP_CONFIG, AppConfig } from '../app-config.module';

@Injectable({
    providedIn: "root",
})
export class ProfileService {

    constructor(
        @Inject(APP_CONFIG) private config: AppConfig,
        private http: HttpClient,
    ) { }

    change(name, password?) {
        return this.http.post(`${this.config.apiEndpoint}/profile`, { name: name, password: password });
    }
}

import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class LoadingService {
    private loadingSubject: BehaviorSubject<boolean>;
    public loading: Observable<boolean>;

    constructor() {
        this.loadingSubject = new BehaviorSubject<boolean>(false);
        this.loading = this.loadingSubject.asObservable();
    }

    public start() {
        this.loadingSubject.next(true);
    }

    public stop() {
        this.loadingSubject.next(false);
    }
}

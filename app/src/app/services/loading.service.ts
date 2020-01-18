import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class LoadingService {
    private loadingSubject: BehaviorSubject<Boolean>;
    public loading: Observable<Boolean>;

    constructor() {
        this.loadingSubject = new BehaviorSubject<Boolean>(false)
        this.loading = this.loadingSubject.asObservable()
    }

    public start() {
        this.loadingSubject.next(true)
    } 

    public stop() {
        this.loadingSubject.next(false)        
    }
}

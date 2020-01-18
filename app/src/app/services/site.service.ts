import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { SidebarService } from './sidebar.service';

export enum sites {
    home,
    view,
    edit,
    users,
    roles,
    settings,
    profile,
    login,
    files
}

@Injectable({
    providedIn: 'root'
})
export class SiteService {
    private stateSubject: BehaviorSubject<sites>;
    public state: Observable<sites>;
    public sites: sites;

    constructor(
        private sidebarService: SidebarService
    ) {
        this.stateSubject = new BehaviorSubject<sites>(sites.view)
        this.state = this.stateSubject.asObservable()
    }

    setState(state: sites): void {
        this.stateSubject.next(state)
        switch (state) {
            case sites.edit:
                this.sidebarService.blockSidebar();
                break;
            case sites.login:
                this.sidebarService.blockSidebar();
                break;
            default:
                this.sidebarService.unblockSidebar();
        }
    }
}

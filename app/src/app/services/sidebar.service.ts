import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';

enum SidebarState {
  open = 'open',
  small = 'small',
  closed = 'closed',
  blocked = 'blocked'
}

@Injectable({
  providedIn: 'root'
})
export class SidebarService {
  private stateSubject: BehaviorSubject<SidebarState>;
  public state: Observable<SidebarState>;
  private treeVisibleSubject: BehaviorSubject<Boolean>;
  public treeVisible: Observable<Boolean>;
  private blurVisibleSubject: BehaviorSubject<Boolean>;
  public blurVisible: Observable<Boolean>;

  private small: boolean;

  constructor() {
    this.stateSubject = new BehaviorSubject<SidebarState>(SidebarState.open)
    this.state = this.stateSubject.asObservable()
    this.treeVisibleSubject = new BehaviorSubject<any>(false)
    this.treeVisible = this.treeVisibleSubject.asObservable()
    this.blurVisibleSubject = new BehaviorSubject<Boolean>(false)
    this.blurVisible = this.blurVisibleSubject.asObservable()
    this.resizeEvent();
    window.addEventListener('resize', () => {
      this.resizeEvent();
    })
  }

  resizeEvent() {
    if (window.innerWidth > 1300) {
      this.small = false;
      if (!this.treeVisibleSubject.value) {
        this.setBlurVisibility(false)
      }
      if (this.stateSubject.value !== SidebarState.blocked) {
        this.stateSubject.next(SidebarState.open)
      }
    } else {
      this.small = true
      if (this.treeVisibleSubject.value) {
        this.stateSubject.next(SidebarState.small)
      } else if (this.stateSubject.value !== SidebarState.blocked) {
        this.blurVisibleSubject.next(false)
        this.stateSubject.next(SidebarState.closed)
      }
    }
  }

  openSidebar() {
    if (this.small) {
      this.blurVisibleSubject.next(true)
    }
    this.stateSubject.next(SidebarState.open)
  }

  closeSidebar() {
    if (this.small) {
      this.treeVisibleSubject.next(false)
      this.stateSubject.next(SidebarState.closed)
    }
    this.treeVisibleSubject.next(false)
    this.blurVisibleSubject.next(false)
  }

  blockSidebar() {
    this.stateSubject.next(SidebarState.blocked);
    this.treeVisibleSubject.next(false);
    this.blurVisibleSubject.next(false);
  }

  unblockSidebar() {
    if (this.stateSubject.value === SidebarState.blocked && !this.small) {
      this.openSidebar();
    } else if (this.stateSubject.value === SidebarState.blocked && this.small) {
      this.closeSidebar();
    }
  }

  openTree() {
    if (!this.small) {
      this.setBlurVisibility(true);
      this.stateSubject.next(SidebarState.open)
    } else {
      this.stateSubject.next(SidebarState.small)
    }
    this.treeVisibleSubject.next(true)
  }

  closeTree() {
    if (!this.small) {
      this.setBlurVisibility(false);
    } else {
      this.stateSubject.next(SidebarState.open)
    }
    this.treeVisibleSubject.next(false)

  }

  setBlurVisibility(value) {
    this.blurVisibleSubject.next(value);
  }
}

import { NgModule } from '@angular/core';
import { Routes, RouterModule, UrlSegmentGroup, UrlSegment, Route } from '@angular/router';

import { LoginComponent } from './components/login/login.component';
import { DocumentComponent } from './components/document/document.component';
import { AuthGuard } from './guards/auth.guard';
import { DocumentEditComponent } from './components/document-edit/document-edit.component';
import { HomeComponent } from './components/home/home.component';
import { FilesComponent } from './components/files/files.component';
import { RoleListComponent } from './components/settings/role-list/role-list.component';
import { RoleComponent } from './components/settings/role/role.component';
import { UserListeComponent } from './components/settings/user-liste/user-liste.component';
import { UserComponent } from './components/settings/user/user.component';
import { ProfileComponent } from './components/profile/profile.component';
import { MasterRole } from './models/masterrole';
import { SystemComponent } from './components/settings/system/system.component';
import { StatisticsComponent } from './components/settings/statistics/statistics.component';
import { TagsComponent } from './components/tags/tags.component';
import { LogsComponent } from './components/settings/logs/logs.component';
import { DebugComponent } from './components/settings/debug/debug.component';

export function customMatcher(
  segments: UrlSegment[],
  group: UrlSegmentGroup,
  route: Route,
): {
  consumed: UrlSegment[];
  posParams: {
    id: UrlSegment;
  };
} {
  const firstSegment = segments[0];
  if (firstSegment && firstSegment.path === 'document') {
    const idSegments = segments.slice(1);
    const idPaths = idSegments.map(segment => segment.path);
    const mergedId = idPaths.join('/');
    const idSegment: UrlSegment = new UrlSegment(mergedId, { id: mergedId });
    return ({ consumed: segments, posParams: { id: idSegment } });
  }
  return null;
}

const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'home',
    component: HomeComponent,
    canActivate: [AuthGuard],
  },
  {
    matcher: customMatcher,
    component: DocumentComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'edit/document/:id',
    component: DocumentEditComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'files',
    component: FilesComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'profile',
    component: ProfileComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'tags',
    component: TagsComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'settings/statistics',
    component: StatisticsComponent,
    canActivate: [AuthGuard],
    data: { roles: [MasterRole.Admin] },
  },
  {
    path: 'settings/users',
    component: UserListeComponent,
    canActivate: [AuthGuard],
    data: { roles: [MasterRole.Admin] },
  },
  {
    path: 'settings/users/:id',
    component: UserComponent,
    canActivate: [AuthGuard],
    data: { roles: [MasterRole.Admin] },
  },
  {
    path: 'settings/roles',
    component: RoleListComponent,
    canActivate: [AuthGuard],
    data: { roles: [MasterRole.Admin] },
  },
  {
    path: 'settings/roles/:id',
    component: RoleComponent,
    canActivate: [AuthGuard],
    data: { roles: [MasterRole.Admin] },
  },
  {
    path: 'settings/system',
    component: SystemComponent,
    canActivate: [AuthGuard],
    data: { roles: [MasterRole.Admin] },
  },
  {
    path: 'settings/logs',
    component: LogsComponent,
    canActivate: [AuthGuard],
    data: { roles: [MasterRole.Admin] },
  },
  {
    path: 'settings/debug',
    component: DebugComponent,
    canActivate: [AuthGuard],
    data: { roles: [MasterRole.Admin] },
  },
  {
    path: 'settings',
    redirectTo: 'settings/users',
  },
  {
    path: '**',
    redirectTo: 'home',
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule { }

import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { UrlSerializer } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { MarkdownModule, MarkedOptions, MarkedRenderer } from 'ngx-markdown';
import { ToastrModule } from 'ngx-toastr';
import { BarChartModule } from '@swimlane/ngx-charts';
import { AutosizeModule } from 'ngx-autosize';

import { MaterialModule } from './material/material.module';
import { AppConfigModule } from './app-config.module';
import { AppRoutingModule } from './app-routing.module';
import { environment } from '../environments/environment';

import { AppComponent } from './app.component';
import { LoginComponent } from './components/login/login.component';
import { NavBarComponent } from './components/navbar/navbar.component';
import { DocumentListComponent } from './components/document-list/document-list.component';
import { DocumentComponent } from './components/document/document.component';
import { ErrorInterceptor } from './helper/error.interceptor';
import { CustomUrlSerializer } from './helper/custom.urlserializer';
import { SafeHtmlPipe } from './pipes/safehtml.pipe';
import { SearchDocumentsPipe, SearchStringsPipe } from './pipes/search.pipe';
import { DocumentCreateComponent } from './components/document-create/document-create.component';
import { DocumentEditComponent } from './components/document-edit/document-edit.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { DocumentMoveComponent } from './components/document-move/document-move.component';
import { FilesComponent } from './components/files/files.component';
import { HomeComponent } from './components/home/home.component';
import { RoleComponent } from './components/settings/role/role.component';
import { RoleCreateComponent } from './components/settings/role-create/role-create.component';
import { RoleListComponent } from './components/settings/role-list/role-list.component';
import { UserListeComponent } from './components/settings/user-liste/user-liste.component';
import { UserComponent } from './components/settings/user/user.component';
import { ProfileComponent } from './components/profile/profile.component';
import { UserCreateComponent } from './components/settings/user-create/user-create.component';
import { SystemComponent } from './components/settings/system/system.component';
import { DebugComponent } from './components/settings/debug/debug.component';
import { InsertFileComponent } from './components/document-edit/insertfile/insertfile.component';
import { StatisticsComponent } from './components/settings/statistics/statistics.component';
import { CustomInterceptor } from './helper/http.interceptor';
import { FilesCreateComponent } from './components/files-create/files-create.component';
import { ConfirmationDialogComponent } from './components/shared/confirmation-dialog/confirmation-dialog.component';
import { TagsComponent } from './components/tags/tags.component';
import { LogsComponent } from './components/settings/logs/logs.component';
import { InsertLinkComponent } from './components/document-edit/insertlink/insertlink.component';

const config: SocketIoConfig = { url: environment.endpoint, options: { path: '/api/socket.io', transport: ['polling'] } }; //websocket

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    NavBarComponent,
    DocumentListComponent,
    DocumentComponent,
    SafeHtmlPipe,
    SearchDocumentsPipe,
    SearchStringsPipe,
    DocumentCreateComponent,
    DocumentEditComponent,
    SidebarComponent,
    DocumentMoveComponent,
    FilesComponent,
    HomeComponent,
    RoleComponent,
    RoleCreateComponent,
    RoleListComponent,
    UserListeComponent,
    UserComponent,
    ProfileComponent,
    UserCreateComponent,
    SystemComponent,
    DebugComponent,
    InsertFileComponent,
    InsertLinkComponent,
    StatisticsComponent,
    FilesCreateComponent,
    ConfirmationDialogComponent,
    TagsComponent,
    LogsComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    BrowserAnimationsModule,
    MaterialModule,
    HttpClientModule,
    AppConfigModule,
    NgbModule,
    FontAwesomeModule,
    BarChartModule,
    MarkdownModule.forRoot({
      markedOptions: {
        provide: MarkedOptions,
        useFactory: markedOptionsFactory
      }
    }),
    SocketIoModule.forRoot(config),
    ToastrModule.forRoot(),
    AutosizeModule
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: CustomInterceptor, multi: true },
    { provide: UrlSerializer, useClass: CustomUrlSerializer }
  ],
  bootstrap: [AppComponent],
  entryComponents: [
    ConfirmationDialogComponent,
    DocumentCreateComponent,
    DocumentMoveComponent,
    UserCreateComponent,
    RoleCreateComponent,
    FilesCreateComponent,
    InsertFileComponent,
    InsertLinkComponent
  ]
})
export class AppModule {}


// Wrap table in markdown with a div tag
export function markedOptionsFactory(): MarkedOptions {
  const renderer = new MarkedRenderer()

  const tableRenderer = renderer.table;
  renderer.table = (header: string, body: string) => {
    const html = tableRenderer.call(renderer, header, body);
    return `<div class="table-wrapper">${html}</div>`
  }

  return {
    renderer: renderer,
    gfm: true,
    tables: true,
    breaks: false,
    pedantic: false,
    sanitize: false,
    smartLists: true,
    smartypants: false,
  };
}

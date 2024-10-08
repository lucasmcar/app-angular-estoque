import { NgModule, isDevMode } from '@angular/core';
import { BrowserModule, provideClientHydration } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { LoginComponent } from './components/login/login.component';
import { HttpClientModule } from '@angular/common/http';
import { MaterialModule } from './shared/material/material.module';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
//import { provideHttpClient, withFetch } from '@angular/common/http';
import { DialogComponent } from './shared/dialog/dialog/dialog.component';
import { DialogErrorComponent } from './shared/dialog/dialog-error/dialog-error.component';
import { RegisterUserComponent } from './components/register-user/register-user.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { DialogSuccessComponent } from './shared/dialog/dialog-success/dialog-success.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { RegisterProfileComponent } from './components/register-profile/register-profile.component';

import { NgxMaskDirective, NgxMaskPipe, provideNgxMask } from 'ngx-mask';
import { CollaboratorsComponent } from './components/collaborators/collaborators.component';
import { CarPaintsComponent } from './components/car-paints/car-paints.component';
import { FormDialogComponent } from './shared/dialog/form-dialog/form-dialog.component';
import { MaterialsComponent } from './components/materials/materials.component';
import { FormMaterialComponent } from './shared/dialog/form-material/form-material.component';
import { LogComponent } from './components/log/log.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    DialogComponent,
    DialogErrorComponent,
    RegisterUserComponent,
    DialogSuccessComponent,
    DashboardComponent,
    RegisterProfileComponent,
    CollaboratorsComponent,
    CarPaintsComponent,
    FormDialogComponent,
    MaterialsComponent,
    FormMaterialComponent,
    LogComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MaterialModule,
    RouterModule,
    ReactiveFormsModule,
    HttpClientModule,
    NgxMaskDirective,
    NgxMaskPipe,

    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: !isDevMode(),
      // Register the ServiceWorker as soon as the application is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: 'registerWhenStable:30000'
    }),


  ],
  providers: [
    provideClientHydration(),
    provideAnimationsAsync(),
    provideNgxMask({})
    //provideHttpClient(withFetch())
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

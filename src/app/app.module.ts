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



@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    DialogComponent,
    DialogErrorComponent,
    RegisterUserComponent,
    DialogSuccessComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MaterialModule,
    RouterModule,
    ReactiveFormsModule,
    HttpClientModule,
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
    //provideHttpClient(withFetch())
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

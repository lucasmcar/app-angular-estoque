import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { environment } from './environments/environment-dev';

import { AppModule } from './app/app.module';

import {  initializeApp } from 'firebase/app';

initializeApp(environment.firebase);

if(environment.production){

}

platformBrowserDynamic().bootstrapModule(AppModule, {
  ngZoneEventCoalescing: true
})
  .catch(err => console.error(err));

  platformBrowserDynamic().bootstrapModule(AppModule, {
    ngZoneEventCoalescing: true
  })
    .catch(err => console.error(err));

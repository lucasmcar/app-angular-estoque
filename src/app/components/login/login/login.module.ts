import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LoginRoutingModule } from './login-routing.module';
import { MaterialModule } from '../../../shared/material/material.module';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    LoginRoutingModule,
    MaterialModule
  ]
})
export class LoginModule { }

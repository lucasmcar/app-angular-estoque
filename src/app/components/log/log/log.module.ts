import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LogRoutingModule } from './log-routing.module';
import { MaterialModule } from '../../../shared/material/material.module';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    LogRoutingModule,
    MaterialModule,
    FormsModule,
  ]
})
export class LogModule { }

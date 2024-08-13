import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CarPaintsRoutingModule } from './car-paints-routing.module';
import { MaterialModule } from '../../../shared/material/material.module';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    CarPaintsRoutingModule,
    MaterialModule
  ]
})
export class CarPaintsModule { }

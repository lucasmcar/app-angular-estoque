import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CarPaintsComponent } from '../car-paints.component';

const routes: Routes = [
  {
    path: '', component: CarPaintsComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CarPaintsRoutingModule { }

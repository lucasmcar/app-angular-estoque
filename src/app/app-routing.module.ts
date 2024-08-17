import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '', pathMatch: 'full', redirectTo: 'login'
  },
  {
    path: 'login',
    loadChildren: ()=>import('./components/login/login/login.module')
    .then(m => m.LoginModule)
  },
  {
    path: 'register/user',
    loadChildren: ()=>import('./components/register-user/register/register.module')
    .then(m => m.RegisterModule)
  },
  {
    path: 'dashboard',
    loadChildren: ()=>import('./components/dashboard/dashboard/dashboard.module')
    .then(m => m.DashboardModule)
  },
  {
    path: 'collaborators',
    loadChildren: () => import('./components/collaborators/collaborators/collaborators.module')
    .then(m => m.CollaboratorsModule)
  },
  {
    path: 'materials',
    loadChildren: () => import('./components/materials/materials/materials.module')
    .then(m => m.MaterialsModule)
  },
  {
    path: 'carpaints',
    loadChildren: () => import('./components/car-paints/car-paints/car-paints.module')
    .then(m => m.CarPaintsModule)
  },
  {
    path: 'register/profile',
    loadChildren: ()=>import('./components/register-profile/profile/profile.module')
    .then(m => m.ProfileModule)
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

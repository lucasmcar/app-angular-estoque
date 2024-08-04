import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {MatToolbarModule} from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card'
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import {MatCheckboxModule} from '@angular/material/checkbox';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import {MatDialogModule} from '@angular/material/dialog';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
  ],
  exports :[
    MatToolbarModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatCheckboxModule,
    MatInputModule,
    MatButtonModule,
    MatDialogModule,
    MatProgressSpinnerModule
  ]
})
export class MaterialModule { }

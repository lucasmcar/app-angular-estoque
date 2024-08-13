import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { getAuth, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { CarPaintsService } from '../../../services/car-paints.service';

@Component({
  selector: 'app-form-dialog',
  templateUrl: './form-dialog.component.html',
  styleUrl: './form-dialog.component.css'
})
export class FormDialogComponent implements OnInit{


  formAddPaint: FormGroup;
  userId: any;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private auth: AuthService,
    private carPaintService: CarPaintsService,
    public dialogRef: MatDialogRef<FormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { title: string }) {

    this.formAddPaint = this.fb.group({
      colorGroup: ['', Validators.required],
      colorName: ['', Validators.required],
      code: ['', Validators.required],
      brand: ['', Validators.required]
    });
  }
  async ngOnInit() {
    try {
      const user: FirebaseUser | null = await this.auth.getUser();
      if (user) {
        this.userId = user.uid;
      } else {
        this.router.navigate(['/login']); // Redireciona para a página de login se o usuário não estiver logado
      }
    } catch (error) {
      console.error('Error fetching user', error);
    }
  }

  async addPaint(){
    if (this.formAddPaint.valid) {
      const {colorGroup, colorName, code, brand } = this.formAddPaint.value;
      this.router.navigate(['/colorpaints']);
      try{
        await this.carPaintService.addCarPaints(colorGroup, colorName, code, brand, this.userId);
      }catch(error){
        throw error;
      }
    }
  }

  cancel(){
    this.router.navigate(['/carpaints']);
    this.dialogRef.close();
  }
}

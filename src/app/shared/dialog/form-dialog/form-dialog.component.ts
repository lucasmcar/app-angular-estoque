import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { getAuth, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { CarPaintsService } from '../../../services/car-paints.service';
import { SendNotificationService } from '../../../services/send-notification.service';

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
      quantity: [''],
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
      const {colorGroup, colorName, code, quantity, brand } = this.formAddPaint.value;
      try{

        const phoneNumber = '+555196699337'; // Número do colaborador com código do país
        const message = `Sua nova tinta ${colorName} - ${code} foi adicionada com sucesso!`;
        await this.carPaintService.addOrUpdateCarPaint(colorGroup, colorName, code, quantity, brand, this.userId);
        //this.notificationService.sendWhatsAppMessage(phoneNumber, message).subscribe((result) =>{})
        this.formAddPaint.reset();
        this.dialogRef.close();
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

import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AuthService } from '../../../services/auth.service';
import { MaterialsService } from '../../../services/materials.service';
import { Materials } from '../../../models/materials';
import { getAuth, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-form-material',
  templateUrl: './form-material.component.html',
  styleUrl: './form-material.component.css'
})
export class FormMaterialComponent implements OnInit{

  formAddMaterial : FormGroup;
  userId: any;

  constructor(

    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private materialService: MaterialsService,
    public dialogRef: MatDialogRef<FormMaterialComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { title: string }){
    this.formAddMaterial = this.fb.group({
      materialGroup: ['', Validators.required],
      materialName: ['', Validators.required],
      materialCategory: ['', Validators.required],
      quantity: [''],

    })
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

  async addMaterial(){
    if (this.formAddMaterial.valid) {
      const {materialGroup, materialName, materialCategory, quantity} = this.formAddMaterial.value;

      const material : Materials = {
        materialGroup,
        materialName,
        materialCategory,
        quantity
      }

      try{

        const phoneNumber = '+555196699337'; // Número do colaborador com código do país
        const message = `Um novo material ${materialName} foi adicionado com sucesso!`;
        await this.materialService.addMaterial(material, this.userId);
        //this.notificationService.sendWhatsAppMessage(phoneNumber, message).subscribe((result) =>{})
        this.formAddMaterial.reset();
        this.dialogRef.close();
      }catch(error){
        throw error;
      }
    }
  }

  cancel(){
    this.router.navigate(['/materials']);
    this.dialogRef.close();
  }
}
